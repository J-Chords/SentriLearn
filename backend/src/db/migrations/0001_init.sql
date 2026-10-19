-- =============================================
-- SentriLearn — initial schema
-- =============================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('learner', 'admin')),
  learner_category TEXT CHECK (learner_category IN ('student', 'employee', 'both')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  sid TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ---------------------------------------------
-- Curriculum (seeded content, versioned)
-- ---------------------------------------------
CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  duration_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_json TEXT NOT NULL,
  key_takeaways_json TEXT,
  sort_order INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);

CREATE TABLE lesson_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  lesson_version INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX idx_lesson_completions_user_id ON lesson_completions(user_id);

-- ---------------------------------------------
-- Assessments (versioned content + attempts)
-- ---------------------------------------------
CREATE TABLE assessments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  skill_tag TEXT NOT NULL,
  explanation TEXT NOT NULL
);
CREATE INDEX idx_assessment_questions_assessment ON assessment_questions(assessment_id, version);

CREATE TABLE assessment_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  option_order INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_assessment_options_question ON assessment_options(question_id);

CREATE TABLE assessment_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  assessment_version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
  score INTEGER,
  total INTEGER,
  percentage REAL,
  started_at TEXT NOT NULL,
  submitted_at TEXT
);
CREATE INDEX idx_assessment_attempts_user ON assessment_attempts(user_id, assessment_id, submitted_at);

CREATE TABLE assessment_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES assessment_questions(id),
  selected_option_id INTEGER NOT NULL REFERENCES assessment_options(id),
  is_correct INTEGER NOT NULL,
  UNIQUE (attempt_id, question_id)
);

-- ---------------------------------------------
-- Reviewed practice bank (versioned) + attempts
-- ---------------------------------------------
CREATE TABLE practice_scenarios (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL,
  target_context TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  subject TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_legitimate INTEGER NOT NULL DEFAULT 0,
  tactics_summary TEXT NOT NULL,
  manipulation_techniques_json TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE practice_scenario_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT NOT NULL REFERENCES practice_scenarios(id) ON DELETE CASCADE,
  indicator_key TEXT NOT NULL,
  is_present INTEGER NOT NULL,
  note TEXT,
  UNIQUE (scenario_id, indicator_key)
);

CREATE TABLE practice_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES practice_scenarios(id),
  scenario_version INTEGER NOT NULL,
  selected_indicators_json TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('phishing', 'legitimate')),
  decision_correct INTEGER NOT NULL,
  indicator_correct_count INTEGER NOT NULL,
  indicator_total_positive INTEGER NOT NULL,
  is_first_attempt INTEGER NOT NULL,
  campaign_id INTEGER REFERENCES campaigns(id),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_practice_attempts_user ON practice_attempts(user_id, scenario_id, created_at);

-- ---------------------------------------------
-- AI-generated practice (Gemini), owner-scoped
-- ---------------------------------------------
CREATE TABLE ai_scenarios (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  target_context TEXT,
  impersonation TEXT,
  severity TEXT,
  urgency INTEGER,
  tone TEXT,
  subject TEXT NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  body_html TEXT NOT NULL,
  red_flags_json TEXT,
  tactics_summary TEXT,
  severity_score INTEGER,
  manipulation_techniques_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_ai_scenarios_user ON ai_scenarios(user_id, created_at);

-- ---------------------------------------------
-- Campaigns (admin-managed, assigned exercises)
-- ---------------------------------------------
CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_category TEXT NOT NULL CHECK (target_category IN ('student', 'employee', 'both')),
  difficulty TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  start_date TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  activated_at TEXT,
  completed_at TEXT,
  archived_at TEXT
);

CREATE TABLE campaign_scenarios (
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES practice_scenarios(id),
  PRIMARY KEY (campaign_id, scenario_id)
);

CREATE TABLE campaign_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL,
  UNIQUE (campaign_id, user_id)
);
CREATE INDEX idx_campaign_assignments_user ON campaign_assignments(user_id);

CREATE TABLE campaign_scenario_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES practice_scenarios(id),
  practice_attempt_id INTEGER NOT NULL REFERENCES practice_attempts(id),
  completed_at TEXT NOT NULL,
  UNIQUE (campaign_id, user_id, scenario_id)
);

-- ---------------------------------------------
-- Practice phishing reports (learner-submitted)
-- ---------------------------------------------
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  reasons_json TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewed', 'closed')),
  created_at TEXT NOT NULL,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT
);
CREATE INDEX idx_reports_user ON reports(user_id);

-- ---------------------------------------------
-- Activity / audit log
-- ---------------------------------------------
CREATE TABLE activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_activity_events_user ON activity_events(user_id, created_at);
