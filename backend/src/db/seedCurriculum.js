// =============================================
// CURRICULUM SEEDING (safe to run on every startup)
//
// Inserts modules/lessons/assessments/questions/options and the
// reviewed practice bank at version 1 if they do not already
// exist. Never touches learner data (lesson_completions,
// assessment_attempts, practice_attempts, etc). Idempotent.
// =============================================
import { pathToFileURL } from 'node:url';
import { getDb, withTransaction } from './connection.js';
import { MODULES_SEED, ASSESSMENTS_SEED } from './seedData/curriculum.js';
import { PRACTICE_SCENARIOS_SEED, INDICATOR_KEYS } from './seedData/practiceScenarios.js';

export function seedCurriculum() {
  const db = getDb();
  const summary = { modules: 0, lessons: 0, assessments: 0, questions: 0, scenarios: 0 };

  withTransaction(() => {
    // ---- Modules & lessons ----
    const insertModule = db.prepare(`
      INSERT INTO modules (id, title, description, icon, duration_label, sort_order, version, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1, 1)
      ON CONFLICT(id) DO NOTHING
    `);
    const insertLesson = db.prepare(`
      INSERT INTO lessons (id, module_id, title, body_json, key_takeaways_json, sort_order, version)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO NOTHING
    `);

    MODULES_SEED.forEach((mod, modIndex) => {
      insertModule.run(mod.id, mod.title, mod.description, mod.icon, mod.durationLabel, modIndex);

      mod.lessons.forEach((lesson, lessonIndex) => {
        const already = db.prepare('SELECT 1 FROM lessons WHERE id = ?').get(lesson.id);
        insertLesson.run(
          lesson.id,
          mod.id,
          lesson.title,
          JSON.stringify(lesson.body),
          JSON.stringify(lesson.keyTakeaways || []),
          lessonIndex
        );
        if (!already) summary.lessons += 1;
      });
    });
    summary.modules = db.prepare('SELECT COUNT(*) as c FROM modules').get().c;

    // ---- Assessments, questions & options ----
    const insertAssessment = db.prepare(`
      INSERT INTO assessments (id, title, description, icon, version, is_active)
      VALUES (?, ?, ?, ?, 1, 1)
      ON CONFLICT(id) DO NOTHING
    `);
    const insertQuestion = db.prepare(`
      INSERT INTO assessment_questions (assessment_id, version, question_order, question_text, skill_tag, explanation)
      VALUES (?, 1, ?, ?, ?, ?)
    `);
    const insertOption = db.prepare(`
      INSERT INTO assessment_options (question_id, option_order, option_text, is_correct)
      VALUES (?, ?, ?, ?)
    `);

    ASSESSMENTS_SEED.forEach((assessment) => {
      insertAssessment.run(assessment.id, assessment.title, assessment.description, assessment.icon);

      const alreadySeeded = db.prepare(
        'SELECT COUNT(*) as c FROM assessment_questions WHERE assessment_id = ? AND version = 1'
      ).get(assessment.id).c > 0;

      if (!alreadySeeded) {
        assessment.questions.forEach((q, qIndex) => {
          const { lastInsertRowid: questionId } = insertQuestion.run(
            assessment.id, qIndex, q.question, q.skill, q.explanation
          );
          q.options.forEach((optionText, optIndex) => {
            insertOption.run(questionId, optIndex, optionText, optIndex === q.correctIndex ? 1 : 0);
          });
          summary.questions += 1;
        });
      }
    });
    summary.assessments = db.prepare('SELECT COUNT(*) as c FROM assessments').get().c;

    // ---- Reviewed practice bank ----
    const insertScenario = db.prepare(`
      INSERT INTO practice_scenarios (
        id, version, category, target_context, difficulty, subject, sender_name, sender_email,
        body_html, is_legitimate, tactics_summary, manipulation_techniques_json, is_active
      ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO NOTHING
    `);
    const insertIndicator = db.prepare(`
      INSERT INTO practice_scenario_indicators (scenario_id, indicator_key, is_present, note)
      VALUES (?, ?, ?, NULL)
      ON CONFLICT(scenario_id, indicator_key) DO NOTHING
    `);

    PRACTICE_SCENARIOS_SEED.forEach((s) => {
      const already = db.prepare('SELECT 1 FROM practice_scenarios WHERE id = ?').get(s.id);
      insertScenario.run(
        s.id, s.category, s.targetContext, s.difficulty, s.subject, s.senderName, s.senderEmail,
        s.body, s.isLegitimate ? 1 : 0, s.tacticsSummary, JSON.stringify(s.manipulationTechniques || [])
      );
      INDICATOR_KEYS.forEach((key) => {
        insertIndicator.run(s.id, key, s.indicators[key] ? 1 : 0);
      });
      if (!already) summary.scenarios += 1;
    });
  });

  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = seedCurriculum();
  console.log('Curriculum seed complete:', summary);
}
