// =============================================
// TRAINING SERVICE — modules, lessons, completion
// =============================================
import { getDb, isUniqueConstraintError } from '../../db/connection.js';
import { logActivity } from '../activity/activity.service.js';

export function getModulesWithLessons() {
  const db = getDb();
  const modules = db.prepare('SELECT * FROM modules WHERE is_active = 1 ORDER BY sort_order').all();
  const lessonStmt = db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order');

  return modules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    icon: m.icon,
    durationLabel: m.duration_label,
    version: m.version,
    lessons: lessonStmt.all(m.id).map((l) => ({
      id: l.id,
      title: l.title,
      body: JSON.parse(l.body_json),
      keyTakeaways: JSON.parse(l.key_takeaways_json || '[]'),
      version: l.version,
    })),
  }));
}

export function getModuleById(moduleId) {
  const modules = getModulesWithLessons();
  return modules.find((m) => m.id === moduleId) || null;
}

/** Curriculum content merged with this learner's completion state — used by the Training UI. */
export function getModulesWithProgressForUser(userId) {
  const modules = getModulesWithLessons();
  const completions = getCompletionsForUser(userId);
  const completedByModule = {};
  completions.forEach((c) => {
    if (!completedByModule[c.moduleId]) completedByModule[c.moduleId] = new Set();
    completedByModule[c.moduleId].add(c.lessonId);
  });

  return modules.map((m) => {
    const completedSet = completedByModule[m.id] || new Set();
    const completedLessons = m.lessons.filter((l) => completedSet.has(l.id)).length;
    const percent = m.lessons.length === 0 ? 0 : Math.round((completedLessons / m.lessons.length) * 100);
    return {
      ...m,
      lessons: m.lessons.map((l) => ({ ...l, completed: completedSet.has(l.id) })),
      percent,
      status: percent >= 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started',
    };
  });
}

export function getCompletionsForUser(userId) {
  const db = getDb();
  return db.prepare('SELECT lesson_id as lessonId, module_id as moduleId, completed_at as completedAt FROM lesson_completions WHERE user_id = ?').all(userId);
}

/** Idempotent — completing the same lesson twice is a no-op (UNIQUE(user_id, lesson_id)). */
export function completeLesson(userId, lessonId) {
  const db = getDb();
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const already = db.prepare('SELECT 1 FROM lesson_completions WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId);
  if (already) {
    return { alreadyCompleted: true, ...computeTrainingSummary(userId) };
  }

  const before = computeTrainingSummary(userId);

  try {
    db.prepare(`
      INSERT INTO lesson_completions (user_id, lesson_id, module_id, lesson_version, completed_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, lessonId, lesson.module_id, lesson.version, new Date().toISOString());
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { alreadyCompleted: true, ...computeTrainingSummary(userId) };
    }
    throw err;
  }

  logActivity(userId, 'training.lesson_completed', `Completed lesson: ${lesson.title}`);

  const summary = computeTrainingSummary(userId);
  if (summary.modulesCompleted > before.modulesCompleted) {
    const mod = db.prepare('SELECT title FROM modules WHERE id = ?').get(lesson.module_id);
    logActivity(userId, 'training.module_completed', `Completed module: ${mod?.title || lesson.module_id}`);
  }

  return { alreadyCompleted: false, ...summary };
}

/**
 * Overall training progress = completed eligible lessons / eligible lessons.
 * Also reports completed modules / total modules as a distinct figure.
 */
export function computeTrainingSummary(userId) {
  const db = getDb();
  const modules = getModulesWithLessons();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const completedLessonIds = new Set(
    db.prepare('SELECT lesson_id FROM lesson_completions WHERE user_id = ?').all(userId).map((r) => r.lesson_id)
  );

  let completedLessons = 0;
  const perModule = modules.map((m) => {
    const completedInModule = m.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    completedLessons += completedInModule;
    const percent = m.lessons.length === 0 ? 0 : Math.round((completedInModule / m.lessons.length) * 100);
    return {
      id: m.id,
      title: m.title,
      icon: m.icon,
      durationLabel: m.durationLabel,
      totalLessons: m.lessons.length,
      completedLessons: completedInModule,
      percent,
      status: percent >= 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started',
    };
  });

  const modulesCompleted = perModule.filter((m) => m.status === 'completed').length;
  const trainingCompletionPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return {
    trainingCompletionPercent,
    completedLessons,
    totalLessons,
    modulesCompleted,
    totalModules: modules.length,
    perModule,
  };
}
