// =============================================
// DEMO ACCOUNT SEEDING (explicit, not run automatically)
//
//   npm run db:seed:demo               — 1 admin + 2 learners, empty progress
//   npm run db:seed:demo -- --with-showcase   — adds a small, labeled, consistent
//                                                showcase dataset for Alex Morgan
//
// Generated passwords are printed ONCE and written to a local,
// gitignored file. They are never logged elsewhere or embedded in
// the frontend bundle.
// =============================================
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runMigrations } from './migrate.js';
import { seedCurriculum } from './seedCurriculum.js';
import { getDb } from './connection.js';
import { createUser, findUserByEmail } from '../services/auth/auth.service.js';
import { completeLesson } from '../services/training/training.service.js';
import { startAttempt, submitAttempt } from '../services/assessments/assessment.service.js';
import { submitPracticeAttempt } from '../services/practice/practice.service.js';
import { createReport } from '../services/reports/report.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DIR = path.resolve(__dirname, '../../local');

const ACCOUNTS = [
  { email: 'admin@sentrilearn.local', name: 'Site Administrator', role: 'admin', learnerCategory: null },
  { email: 'alex.morgan@sentrilearn.local', name: 'Alex Morgan', role: 'learner', learnerCategory: 'student' },
  { email: 'priya.nair@sentrilearn.local', name: 'Priya Nair', role: 'learner', learnerCategory: 'employee' },
];

async function seedAccounts() {
  const created = [];
  for (const account of ACCOUNTS) {
    const existing = findUserByEmail(account.email);
    if (existing) {
      console.log(`- ${account.email} already exists, skipped (password unchanged).`);
      continue;
    }
    const password = crypto.randomBytes(9).toString('base64url');
    const user = await createUser({ ...account, password });
    created.push({ email: user.email, password, role: user.role, name: user.name });
    console.log(`✓ created ${account.role} account: ${account.email}`);
  }
  return created;
}

function writeCredentialsFile(created) {
  if (created.length === 0) return;
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  const filePath = path.join(LOCAL_DIR, 'demo-credentials.md');
  const lines = [
    '# SentriLearn demo credentials (LOCAL ONLY — do not commit, do not share)',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    ...created.map((c) => `- **${c.role}** — ${c.email} / \`${c.password}\` (${c.name})`),
    '',
  ];
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\nCredentials written to ${filePath}`);
  console.log('(This file is gitignored. Do not copy these values into any committed file.)');
}

function seedShowcaseData() {
  const db = getDb();
  const alex = findUserByEmail('alex.morgan@sentrilearn.local');
  if (!alex) {
    console.log('Skipping showcase data: alex.morgan@sentrilearn.local does not exist.');
    return;
  }

  console.log('\nSeeding showcase data for Alex Morgan (clearly a demo account — see isDemoAccount flag)...');

  // Complete two modules in full via the real completion service (idempotent).
  const lessonIds = db.prepare(`
    SELECT id FROM lessons WHERE module_id IN ('intro-to-cybersecurity', 'phishing-awareness') ORDER BY module_id, sort_order
  `).all().map((r) => r.id);
  lessonIds.forEach((lessonId) => completeLesson(alex.id, lessonId));
  console.log(`  - completed ${lessonIds.length} lessons across 2 modules`);

  // Partially progress a third module (2 of its lessons).
  const partialLessons = db.prepare(
    "SELECT id FROM lessons WHERE module_id = 'password-security' ORDER BY sort_order LIMIT 2"
  ).all().map((r) => r.id);
  partialLessons.forEach((lessonId) => completeLesson(alex.id, lessonId));
  console.log(`  - partially completed password-security (${partialLessons.length} lessons)`);

  // One real, server-graded assessment attempt (intentionally 8/10 — two realistic misses).
  const { attemptId, assessment } = startAttempt(alex.id, 'phishing-awareness');
  const correctByQuestion = new Map(
    db.prepare(`
      SELECT q.id as questionId, o.id as optionId
      FROM assessment_questions q JOIN assessment_options o ON o.question_id = q.id
      WHERE q.assessment_id = 'phishing-awareness' AND o.is_correct = 1
    `).all().map((r) => [r.questionId, r.optionId])
  );
  const wrongOptionFor = (questionId) => {
    const row = db.prepare('SELECT id FROM assessment_options WHERE question_id = ? AND is_correct = 0 LIMIT 1').get(questionId);
    return row.id;
  };
  // Miss the 3rd and 7th questions (URL inspection / reporting procedures) to mirror a realistic result.
  const missIndices = new Set([2, 6]);
  const answers = assessment.questions.map((q, idx) => ({
    questionId: q.id,
    selectedOptionId: missIndices.has(idx) ? wrongOptionFor(q.id) : correctByQuestion.get(q.id),
  }));
  const graded = submitAttempt(alex.id, attemptId, answers);
  console.log(`  - submitted phishing-awareness assessment: ${graded.score}/${graded.total} (${graded.percentage}%)`);

  // Two reviewed-practice attempts: one phishing scenario correctly reported, one legitimate correctly identified.
  submitPracticeAttempt(alex.id, 'account-verification-phishing-1', {
    selectedIndicators: ['urgent-language', 'suspicious-sender', 'mismatched-domain', 'credential-request', 'suspicious-link'],
    decision: 'phishing',
  });
  submitPracticeAttempt(alex.id, 'legit-it-newsletter', {
    selectedIndicators: [],
    decision: 'legitimate',
  });
  console.log('  - submitted 2 reviewed-practice attempts (1 phishing correctly reported, 1 legitimate correctly identified)');

  // One practice report.
  createReport(alex.id, {
    messageType: 'Email',
    reasons: ['Suspicious sender', 'Urgent request'],
    notes: 'Demo showcase report.',
  });
  console.log('  - submitted 1 practice phishing report');

  console.log('\nShowcase data complete. This is clearly demo data: the account is flagged isDemoAccount=true');
  console.log('(email ends in @sentrilearn.local) and the frontend must display a "Demo data" label wherever it is shown.');
}

async function main() {
  runMigrations();
  seedCurriculum();

  console.log('Seeding demo accounts...\n');
  const created = await seedAccounts();
  writeCredentialsFile(created);

  if (process.argv.includes('--with-showcase')) {
    seedShowcaseData();
  } else {
    console.log('\nNo showcase data requested (pass --with-showcase to add a small labeled demo dataset for Alex Morgan).');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Demo seeding failed:', err);
    process.exitCode = 1;
  });
}
