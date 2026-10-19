// =============================================
// ASSESSMENT SERVICE — server-side grading & attempt history
//
// Answer keys and explanations are NEVER returned before an attempt
// is submitted. Grading always happens here, never on the client.
// =============================================
import { getDb, withTransaction } from '../../db/connection.js';
import { logActivity } from '../activity/activity.service.js';

function currentVersion(db, assessmentId) {
  const row = db.prepare('SELECT MAX(version) as v FROM assessment_questions WHERE assessment_id = ?').get(assessmentId);
  return row?.v || 1;
}

export function listAssessments() {
  const db = getDb();
  return db.prepare('SELECT * FROM assessments WHERE is_active = 1').all().map((a) => {
    const version = currentVersion(db, a.id);
    const questionCount = db.prepare(
      'SELECT COUNT(*) as c FROM assessment_questions WHERE assessment_id = ? AND version = ?'
    ).get(a.id, version).c;
    return { id: a.id, title: a.title, description: a.description, icon: a.icon, version, questionCount };
  });
}

/** Question + option shape safe to send BEFORE submission — no correctness, no explanation. */
export function getAssessmentForTaking(assessmentId) {
  const db = getDb();
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ? AND is_active = 1').get(assessmentId);
  if (!assessment) return null;

  const version = currentVersion(db, assessmentId);
  const questions = db.prepare(
    'SELECT * FROM assessment_questions WHERE assessment_id = ? AND version = ? ORDER BY question_order'
  ).all(assessmentId, version);

  const optionStmt = db.prepare('SELECT id, option_order, option_text FROM assessment_options WHERE question_id = ? ORDER BY option_order');

  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    version,
    questions: questions.map((q) => ({
      id: q.id,
      order: q.question_order,
      text: q.question_text,
      options: optionStmt.all(q.id).map((o) => ({ id: o.id, text: o.option_text })),
    })),
  };
}

export function startAttempt(userId, assessmentId) {
  const db = getDb();
  const taking = getAssessmentForTaking(assessmentId);
  if (!taking) {
    const err = new Error('Assessment not found.');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO assessment_attempts (user_id, assessment_id, assessment_version, status, started_at)
    VALUES (?, ?, ?, 'in_progress', ?)
  `).run(userId, assessmentId, taking.version, new Date().toISOString());

  return { attemptId: lastInsertRowid, assessment: taking };
}

function loadAttemptOwned(db, userId, attemptId) {
  const attempt = db.prepare('SELECT * FROM assessment_attempts WHERE id = ?').get(attemptId);
  if (!attempt) {
    const err = new Error('Attempt not found.');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }
  if (attempt.user_id !== userId) {
    const err = new Error('You do not have permission to access this attempt.');
    err.statusCode = 403;
    err.expose = true;
    throw err;
  }
  return attempt;
}

/**
 * Grades and records the attempt. Idempotent: resubmitting an already-submitted
 * attempt returns the existing stored result instead of grading again.
 */
export function submitAttempt(userId, attemptId, answers) {
  const db = getDb();
  const attempt = loadAttemptOwned(db, userId, attemptId);

  if (attempt.status === 'submitted') {
    return { alreadySubmitted: true, ...buildResult(db, attempt) };
  }

  const questions = db.prepare(
    'SELECT * FROM assessment_questions WHERE assessment_id = ? AND version = ?'
  ).all(attempt.assessment_id, attempt.assessment_version);
  const questionIds = new Set(questions.map((q) => q.id));

  if (answers.length !== questions.length || !answers.every((a) => questionIds.has(a.questionId))) {
    const err = new Error('Answers do not match this assessment\'s current question set.');
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  const optionStmt = db.prepare('SELECT * FROM assessment_options WHERE id = ? AND question_id = ?');
  const graded = answers.map((a) => {
    const option = optionStmt.get(a.selectedOptionId, a.questionId);
    if (!option) {
      const err = new Error('Selected option does not belong to the given question.');
      err.statusCode = 400;
      err.expose = true;
      throw err;
    }
    return { questionId: a.questionId, selectedOptionId: a.selectedOptionId, isCorrect: option.is_correct === 1 };
  });

  const score = graded.filter((g) => g.isCorrect).length;
  const total = graded.length;
  const percentage = Math.round((score / total) * 100);
  const submittedAt = new Date().toISOString();

  withTransaction(() => {
    const insertAnswer = db.prepare(`
      INSERT INTO assessment_answers (attempt_id, question_id, selected_option_id, is_correct)
      VALUES (?, ?, ?, ?)
    `);
    graded.forEach((g) => insertAnswer.run(attemptId, g.questionId, g.selectedOptionId, g.isCorrect ? 1 : 0));

    db.prepare(`
      UPDATE assessment_attempts SET status = 'submitted', score = ?, total = ?, percentage = ?, submitted_at = ?
      WHERE id = ?
    `).run(score, total, percentage, submittedAt, attemptId);
  });

  const assessment = db.prepare('SELECT title FROM assessments WHERE id = ?').get(attempt.assessment_id);
  logActivity(userId, 'assessment.submitted', `Completed ${assessment?.title || 'an assessment'} — scored ${percentage}%`);

  return {
    alreadySubmitted: false,
    ...buildResult(db, { ...attempt, status: 'submitted', score, total, percentage, submitted_at: submittedAt }),
  };
}

function buildResult(db, attempt) {
  const answers = db.prepare(`
    SELECT aa.question_id as questionId, aa.selected_option_id as selectedOptionId, aa.is_correct as isCorrect,
           q.question_text as questionText, q.skill_tag as skillTag, q.explanation, q.question_order as questionOrder
    FROM assessment_answers aa
    JOIN assessment_questions q ON q.id = aa.question_id
    WHERE aa.attempt_id = ?
    ORDER BY q.question_order
  `).all(attempt.id);

  const optionStmt = db.prepare('SELECT id, option_text, is_correct FROM assessment_options WHERE question_id = ? ORDER BY option_order');
  const review = answers.map((a) => ({
    questionId: a.questionId,
    question: a.questionText,
    skillTag: a.skillTag,
    explanation: a.explanation,
    selectedOptionId: a.selectedOptionId,
    isCorrect: Boolean(a.isCorrect),
    options: optionStmt.all(a.questionId).map((o) => ({ id: o.id, text: o.option_text, isCorrect: Boolean(o.is_correct) })),
  }));

  const strengths = [...new Set(review.filter((r) => r.isCorrect).map((r) => r.skillTag))]
    .filter((skill) => !review.some((r) => !r.isCorrect && r.skillTag === skill));
  const areasToImprove = [...new Set(review.filter((r) => !r.isCorrect).map((r) => r.skillTag))];

  return {
    attemptId: attempt.id,
    assessmentId: attempt.assessment_id,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    submittedAt: attempt.submitted_at,
    strengths,
    areasToImprove,
    review,
  };
}

export function getAttemptResult(userId, attemptId) {
  const db = getDb();
  const attempt = loadAttemptOwned(db, userId, attemptId);
  if (attempt.status !== 'submitted') {
    const err = new Error('This attempt has not been submitted yet.');
    err.statusCode = 409;
    err.expose = true;
    throw err;
  }
  return buildResult(db, attempt);
}

export function listAttemptsForUser(userId, assessmentId) {
  const db = getDb();
  return db.prepare(`
    SELECT id, score, total, percentage, started_at as startedAt, submitted_at as submittedAt
    FROM assessment_attempts
    WHERE user_id = ? AND assessment_id = ? AND status = 'submitted'
    ORDER BY submitted_at ASC
  `).all(userId, assessmentId).map((a, i) => ({ ...a, isFirstAttempt: i === 0 }));
}

/**
 * "Quiz Average" = average of the LATEST submitted attempt per assessment,
 * across whichever assessments the learner has attempted at least once.
 */
export function getLatestAssessmentAverage(userId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT assessment_id as assessmentId, MAX(submitted_at) as latestAt
    FROM assessment_attempts
    WHERE user_id = ? AND status = 'submitted'
    GROUP BY assessment_id
  `).all(userId);

  if (rows.length === 0) return { available: false, average: null, attemptedCount: 0 };

  const latestPercentages = rows.map((r) => {
    const attempt = db.prepare(
      'SELECT percentage FROM assessment_attempts WHERE user_id = ? AND assessment_id = ? AND submitted_at = ?'
    ).get(userId, r.assessmentId, r.latestAt);
    return attempt.percentage;
  });

  const average = Math.round(latestPercentages.reduce((s, p) => s + p, 0) / latestPercentages.length);
  return { available: true, average, attemptedCount: rows.length };
}
