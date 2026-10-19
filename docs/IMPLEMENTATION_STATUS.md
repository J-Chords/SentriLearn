# SentriLearn — Implementation Status

_Last updated: 2026-09-25 — branch `sentrilearn-backend`_

This document describes the **actual, verified** state of the SentriLearn
platform after the backend upgrade: a database-backed academic application
replacing the earlier browser-localStorage prototype.

## 1. Architecture Overview

```
frontend/   React 18 + Vite, React Router, Tailwind (unchanged design)
backend/    Node.js 24 + Express 4, SQLite (node:sqlite), session auth
```

- **Frontend and backend are separate processes.** In development, Vite
  proxies `/api/*` to `http://localhost:5000`. In this bounded academic
  deployment there is no reverse proxy — the two are run side by side.
- **Single SQLite database file** (`backend/data/sentrilearn.sqlite`) is the
  sole source of truth for every learner record, admin record, and piece of
  content. Nothing authoritative lives in the browser except theme
  preference (see §12).

## 2. Why SQLite, and Why `node:sqlite`

The brief called for SQLite for this single-server academic application. Two
implementation choices were available: a third-party driver (`better-sqlite3`)
or Node's own built-in `node:sqlite` module (stable since Node 22.5).
`node:sqlite` was chosen because:

- **Zero native dependency risk.** No `node-gyp` compilation, no prebuilt
  binary mismatch on Windows — it ships inside the Node binary itself.
- **Maintained by the Node.js project directly** — as "maintained" a
  dependency as software can be.
- Provides everything needed for this scope: prepared statements,
  transactions (`BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`), `VACUUM INTO` for
  consistent backups, and synchronous execution (simplifies transaction
  correctness — there is no `await` boundary inside a request handler where
  another request could interleave).

**Requirement:** Node.js ≥ 22.5.0 (the installed runtime is 24.18.0). This is
declared in `backend/package.json`'s `engines` field.

Journal mode is WAL, foreign keys are enforced (`PRAGMA foreign_keys = ON`),
and every multi-statement write goes through `withTransaction()`
(`backend/src/db/connection.js`).

## 3. Schema & Migrations

- `backend/src/db/migrations/0001_init.sql` — the full schema (22 tables).
- `backend/src/db/migrate.js` — a minimal, hand-rolled migration runner
  (tracks applied files in a `schema_migrations` table; safe to re-run).
- Curriculum content (modules, lessons, assessments, questions, options, the
  reviewed-practice bank) is versioned via a `version` column on each content
  table, and learner records reference the version that was active when
  they interacted with it (`lesson_completions.lesson_version`,
  `assessment_attempts.assessment_version`,
  `practice_attempts.scenario_version`). **This means a future content edit
  cannot silently rewrite a past result** — a new version is added, old rows
  keep pointing at the version they were graded against. In this release,
  content is only ever seeded once at version 1; bumping content in the
  future is a manual step (write a new seed entry with `version: 2`, add a
  migration) — there is no in-app content-editing UI (deliberately out of
  scope — see the brief's "no CMS" instruction).

Full table list: `users`, `sessions`, `modules`, `lessons`,
`lesson_completions`, `assessments`, `assessment_questions`,
`assessment_options`, `assessment_attempts`, `assessment_answers`,
`practice_scenarios`, `practice_scenario_indicators`, `practice_attempts`,
`ai_scenarios`, `campaigns`, `campaign_scenarios`, `campaign_assignments`,
`campaign_scenario_completions`, `reports`, `activity_events`,
`schema_migrations`.

## 4. Authentication & Session Design

| Concern | Implementation |
|---|---|
| Password hashing | **Argon2id** via the `argon2` npm package. Parameters: `memoryCost=19456` (19 MiB), `timeCost=2`, `parallelism=1` — the OWASP 2024 cheat-sheet baseline. |
| Session store | **Custom `SqliteSessionStore`** (`services/session/sqliteSessionStore.js`) implementing the `express-session` `Store` interface directly on the same `node:sqlite` connection — no separate session-store package, no `MemoryStore`. |
| Session cookie | `httpOnly`, `sameSite: 'lax'`, `secure` in production only, name `sentrilearn.sid`. |
| Session lifetime | Default (no "Remember Me"): browser-session cookie, server-enforced ceiling of `SESSION_TTL_MS` (2h default). With "Remember Me": persistent cookie, `REMEMBER_ME_TTL_MS` (30 days default). |
| Session regeneration | `req.session.regenerate()` on every successful login (defeats session fixation). |
| CSRF | Double-submit cookie pattern via `csrf-csrf`, bound to the session id (`getSessionIdentifier`). Token is fetched from `GET /api/auth/csrf` (also silently establishes an anonymous session) and sent back as `X-CSRF-Token` on every mutating request. **Login itself requires a valid CSRF token** — not exempted. |
| Login rate limiting | `express-rate-limit`, keyed by `ip:email`, 10 attempts / 15 min by default. |
| AI generation rate limiting | Custom in-memory per-user sliding window (`middleware/rateLimiters.js`), 8 generations / 10 min by default — deliberately separate from the CSRF/session mechanism since it is a cost control, not a security control. |
| Account disablement | `PATCH /api/admin/users/:id/status` immediately calls `SqliteSessionStore.destroyAllForUser()`, deleting every live session row for that user — the account is locked out **immediately**, not just on next login. `requireAuth` also re-checks `is_active` from the database on every single request (not just at login), so even an as-yet-undestroyed session is rejected. |

## 5. Authorization Model

Two roles: `learner`, `admin`. `learner_category` (`student` / `employee` /
`both`) is **not** a privilege level — it only affects campaign targeting.

Every protected route:
1. `requireAuth` resolves the current user fresh from the database (not
   trusted from the session blob) and rejects if missing/disabled.
2. `requireRole('admin')` gates admin-only routes.
3. Ownership checks are explicit per resource (e.g. an assessment attempt's
   `user_id` is checked against `req.user.id` before any read or write —
   see `assessment.service.js#loadAttemptOwned`).
4. All request bodies are validated with **`zod` schemas using `.strict()`**,
   so an unexpected field (e.g. a client trying to smuggle a `role` or
   `score` field into a request) is rejected with 400 rather than silently
   ignored or accepted.

There is **no client-side role switching**. The demo "Continue as Demo
Administrator" one-click bypass from the earlier prototype has been
removed entirely — every session, including demo accounts, authenticates
through the same real `/api/auth/login` form.

## 6. Training

- Curriculum (6 modules, 25 lessons total) is served from the database via
  `GET /api/training/modules`.
- `POST /api/training/lessons/:lessonId/complete` is **idempotent** — a
  `UNIQUE(user_id, lesson_id)` constraint plus an explicit existence check
  means a duplicate click returns `alreadyCompleted: true` and does not
  change any count or fire a duplicate activity-log entry.
- **Overall training progress** = completed eligible lessons ÷ eligible
  lessons (a flat lesson-level ratio across all 6 modules — 25 lessons
  total). **Modules completed** (a module counts once 100% of its lessons
  are done) is reported separately. Both the Dashboard and My Progress pages
  read the identical `GET /api/training/summary` / `GET /api/analytics/me`
  computation — there is exactly one implementation
  (`training.service.js#computeTrainingSummary`).
- "Finish Module" on the last lesson does **not** claim completion unless
  the module is actually at 100% — otherwise it shows a neutral
  "come back later" message.

## 7. Assessments

- Answer keys and `is_correct` flags are **never** sent to the client before
  submission (`assessment.service.js#getAssessmentForTaking` deliberately
  omits them; verified by an automated test that greps the pre-submission
  JSON payload for the strings `isCorrect` / `explanation`).
- `POST /api/assessments/:id/attempts` creates a server-recognised
  `in_progress` attempt row tied to the authenticated user and the
  assessment's *current* version.
- `POST /api/assessments/attempts/:id/submit` grades on the server using the
  submitted `{questionId, selectedOptionId}` pairs — a client-supplied
  `score` field would be rejected outright by the `.strict()` zod schema.
  Grading validates that every question belongs to the attempt's version and
  every option belongs to its question.
- **Idempotent submission**: resubmitting an already-`submitted` attempt
  (even with different answers) returns the *original* stored result
  unchanged (`alreadySubmitted: true`) — verified by an automated test that
  submits conflicting answers twice and asserts the score never changes.
- Retaking creates a **new** attempt row; full history is retained
  (`GET /api/assessments/:id/attempts`).
- **"Quiz Average"** (used on the Dashboard) = the mean of the *latest*
  submitted attempt's percentage, across every assessment the learner has
  attempted at least once (`getLatestAssessmentAverage`). This is a
  cross-assessment figure, distinct from any single assessment's own
  attempt history.

## 8. Reviewed Practice vs. AI-Generated Practice

Two clearly separate modes, both inside the existing Simulation Lab page:

### Reviewed Practice (scored)
- A small (8-scenario) versioned bank, **mixing phishing and legitimate**
  messages (`backend/src/db/seedData/practiceScenarios.js`), each with
  curated per-indicator ground truth across 8 indicator keys
  (`urgent-language`, `suspicious-sender`, `mismatched-domain`,
  `unexpected-attachment`, `credential-request`, `suspicious-link`,
  `unusual-grammar`, `emotional-pressure`). Ground truth is **not** assumed
  present by default — the legitimate scenarios have zero indicators marked
  present.
- The learner selects indicators *and* makes a binary decision
  (`phishing` / `legitimate`). **Decision correctness is independent of
  indicator selection** — selecting every indicator does not "rescue" a
  wrong decision (verified by an automated test).
- Only the learner's **first** attempt on a given scenario counts toward the
  scored metrics (`is_first_attempt` flag, set at insert time); retries
  remain available as ungraded practice.
- Message bodies are rendered via `SafeEmailBody` — plain text with
  `[LINK]` / `[ATTACHMENT]` tokens highlighted as inert, non-navigable
  `<span>` elements. **No `dangerouslySetInnerHTML` is used anywhere in the
  app.**

### AI-Generated Practice (exploratory, unscored)
- Preserves the original Gemini integration
  (`services/ai/providers/gemini.provider.js`, unchanged prompt contract).
- Scenarios are now persisted to `ai_scenarios`, owner-scoped — history and
  deletion are filtered by `user_id` (previously an in-memory array shared
  by all users).
- The UI explicitly labels this content "AI-generated practice... exploratory,
  unreviewed model output — it is not scored", and shows the model's own
  `redFlags` list transparently as *its own* unverified output rather than
  presenting it as a graded indicator exercise.
- **Optional by design**: if `GOOGLE_API_KEY` is not configured, the backend
  still starts normally; every AI route returns a clean `503` with a
  human-readable message (`ai.service.js#assertAvailable`) instead of
  crashing. Verified live: the configured key and model (`gemini-3.8-flash`)
  are real and correctly wired — see `docs/TEST_RESULTS.md` for the live
  smoke-test outcome.

## 9. Campaigns

- Admin-managed lifecycle: `draft → active → completed / archived`.
  Archiving never deletes rows — completed/archived campaigns remain fully
  readable with their historical metrics intact.
- **Activation snapshots membership.** At the moment of activation, every
  active learner whose `learner_category` matches the campaign's
  `target_category` (or either side is `'both'`) is inserted into
  `campaign_assignments`. This is a one-time snapshot — a learner who joins
  or changes category afterward is **not** retroactively added, and a
  campaign cannot be re-activated.
- Activation is rejected if the campaign has no scenarios attached, or if no
  learner currently matches the target category.
- Completing a reviewed-practice scenario **with a `campaignId`** is
  validated three ways before it is accepted: the learner must be assigned
  to that campaign, the scenario must actually belong to that campaign, and
  the campaign must currently be `active` (a `completed`/`archived`/`draft`
  campaign rejects new attempts against it).
- Campaign metrics (`detectionRate`, `reportRate`, `completedLearnerCount`)
  are always derived live from `campaign_scenario_completions` joined to
  `practice_attempts` — never stored as a separate mutable counter, so they
  cannot drift from reality.

## 10. Reports

Learner-submitted practice phishing reports (`reports` table) with an admin
review workflow: `received → reviewed → closed`. Learners see only their own
reports; only admins can list all reports or change status. **Standalone
report submissions do not feed the awareness score** — see §11.

## 11. Awareness / Risk Scoring

Single implementation: `backend/src/services/scoring/awarenessScore.service.js`.

```
30%  latest assessment performance   (cross-assessment average, §7)
30%  reviewed-practice decision accuracy   (first attempts only, §8)
25%  lesson completion   (§6)
15%  appropriate reporting of REVIEWED-PRACTICE phishing scenarios
     (first attempts only; NOT the standalone Report Phishing form)
```

**Reporting rate** is defined precisely as: among the learner's *first*
attempts on reviewed-practice scenarios that are *actually phishing*, what
fraction were correctly decided `'phishing'`. This replaces an earlier,
rejected design (`base 70 + 2 points per report submitted`) that would have
let a learner inflate their score by repeatedly submitting the standalone
report form — that form's activity is logged for the admin's audit trail
only and never touches this formula.

**Missing-data handling:** each of the four components carries its own
`available` flag. A component is excluded from the weighted average (weights
of the remaining components are renormalised proportionally, not treated as
zero) if the learner has no relevant activity. **Training completion is
itself only counted as "available" once the learner has completed at least
one lesson, or has some other scored activity** — a genuinely untouched new
account (zero lessons, zero assessments, zero practice, zero eligible
reports) shows the whole score as unavailable (`"Not yet assessed"`, no risk
band), rather than defaulting to a punitive 0%/High-Risk reading. This was a
real bug found and fixed during this session's testing (see
`docs/TEST_RESULTS.md`).

Risk bands (Low ≥70, Medium ≥40, High <40) are explicitly labelled in the UI
as project-defined educational indicators, not a validated compromise
prediction.

## 12. Frontend — What Uses the Backend vs. localStorage

**Authoritative backend calls, no localStorage fallback, for:** authentication
and current user, training content and completion, assessment content,
attempts and results, reviewed-practice scenarios and attempts, AI-generated
practice history, campaigns (both admin and learner views), reports, and all
analytics (learner snapshot + admin aggregate).

**localStorage remaining use — theme only** (`context/ThemeContext.jsx`,
key `sentrilearn:theme`), a pure per-browser display preference with no
security or scoring relevance. No authentication token, role, lesson
progress, quiz result, campaign state, report state, or score is ever
written to `localStorage`.

## 13. Demo Accounts & Showcase Data

`npm run db:seed:demo` creates (idempotently — never overwrites existing
accounts or their passwords) one admin and two learners, all using the
`@sentrilearn.local` email convention, with randomly generated passwords
printed once and written to the gitignored `backend/local/demo-credentials.md`.
`npm run db:seed:showcase` additionally adds a small, internally-consistent
showcase dataset for one learner (real lesson completions, one real
server-graded assessment attempt, two real reviewed-practice attempts) —
**never run automatically on ordinary startup**, and any account whose email
ends in `@sentrilearn.local` is flagged `isDemoAccount: true` in every API
response, which the frontend renders as an explicit "Demo account" /
"Demo data" badge (Dashboard banner, Admin Analytics banner, Learner
Accounts table, Profile menu).

## 14. Runtime & Dependency Versions

- Node.js: **24.18.0** (minimum supported: 22.5.0, for `node:sqlite`)
- npm: 11.16.0
- Key backend dependencies added this session: `argon2` (password hashing),
  `express-session` (sessions), `csrf-csrf` (CSRF), `cookie-parser` (CSRF
  cookie reading), `zod` (strict request validation). No SQLite driver or
  session-store package was added — both are hand-rolled on `node:sqlite`.
- No new frontend dependencies were required.

## 15. Known, Genuine Limitations

- **SQLite is single-writer.** Fine for a bounded classroom-scale deployment;
  would need a different database for real concurrent-write-heavy scale.
- **No self-service password reset.** By design (`"Forgot password?"` is an
  informational label, not a flow) — recovery is administrator-assisted via
  the Learner Accounts panel (disable/recreate).
- **Admin analytics recompute per-learner snapshots on every request** rather
  than caching. Fine at this scale (a handful of demo/test learners); would
  need caching or pre-aggregation for a large cohort.
- **Content versioning is manual.** There is no admin UI to publish a new
  question/lesson version — bumping curriculum content is a code change
  (add a new seed entry with an incremented `version`), by design (no CMS
  was requested).
- **The root-level `README.md` still describes the previous "PhishSim"
  architecture** (in-memory storage, old API routes) and was intentionally
  **not** rewritten in this session — it is out of scope for the backend
  upgrade task and is called out explicitly in
  `docs/REPORT_UPDATE_NOTES.md` as follow-up work.
- **The configured Gemini model (`gemini-3.8-flash`) is real** (confirmed via
  a live smoke test — see `docs/TEST_RESULTS.md`) but returned a transient
  "high demand" 503 from Google both times it was tested live; the
  integration code itself is verified correct (real auth, real model
  resolution, clean error handling).
