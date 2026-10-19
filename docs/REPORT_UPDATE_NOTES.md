# SentriLearn — Notes for Updating the Academic Report

_Written 2026-09-25, after the backend upgrade described in
`docs/IMPLEMENTATION_STATUS.md`. This document tells you what changed and
why it changed, section by section, so the Word report can be brought in
line with what was actually built. **No content has been added to the Word
document itself** — that editing is left to you, and none of the specific
text suggested below should be pasted in verbatim without checking it reads
naturally in context._

**Nothing here fabricates participant data, survey results, learning-outcome
claims, university approvals, or security certifications.** Where the report
previously implied any of that, the note below says so explicitly rather than
inventing a replacement claim.

---

## Why this update is needed, in one paragraph

The project previously described (and the Word report presumably documents)
a frontend-only prototype: demo role-switching, browser localStorage as the
system of record for progress/quiz results/campaigns, and no real
authentication. That is no longer true. The application now has a real
Node.js/Express + SQLite backend, Argon2id password hashing with
cookie-session authentication and CSRF protection, server-side grading,
role-enforced authorization, and a database-derived analytics/awareness-score
model. Every section below exists because the report's current wording
almost certainly still describes the old system.

---

## Abstract

**Likely needs to change:** any sentence characterising the system as using
"local storage" for persistence, "demo" or "simulated" authentication, or
describing the backend as limited to AI email generation only.

**Suggested framing:** the platform now persists learner accounts, training
progress, assessment results, phishing-simulation outcomes, campaign
assignments and administrator analytics in a server-side SQLite database,
behind real session-based authentication with role-based access control. The
Gemini-based AI generation feature is preserved as one *optional* practice
mode alongside a new, server-scored "reviewed practice" mode with a curated
answer key.

**Do not claim:** measured learning-outcome improvement, participant
adoption numbers, or security certification — none of that was tested here.

---

## 1.6.3 Technological Scope

**Likely needs to change:** the technology list. Add:

- SQLite (via Node.js's built-in `node:sqlite` module, Node ≥ 22.5)
- Argon2id password hashing (`argon2`)
- `express-session` with a custom SQLite-backed session store
- CSRF protection (`csrf-csrf`, double-submit cookie pattern)
- `zod` for strict server-side request validation
- Node's built-in test runner (`node:test`) for backend integration tests

**Remove or reframe:** any line implying the backend is "stateless" or
"AI-generation only," and any line implying the frontend is the system of
record.

---

## Chapter Three — Methodology

If Chapter Three describes an iterative/agile process, this backend upgrade
is itself a clean example worth citing: it was delivered as a distinct
increment (branch `sentrilearn-backend`) after the frontend redesign was
already accepted, with its own audit → implementation → automated-testing →
documentation cycle. If your methodology chapter discusses testing strategy,
this is the point to mention that **automated integration tests were written
against an isolated, disposable database**, distinct from manual UI
walkthroughs — a real methodological detail worth citing (see
`docs/TEST_RESULTS.md` §1 and §4).

---

## 4.3 Architecture

**Needs a real rewrite**, not a patch. The previous architecture diagram
almost certainly showed: Frontend → (localStorage) and Frontend → Backend →
Gemini only. The current architecture is:

```
Browser (React SPA)
   |  cookie session + CSRF header
   v
Express API (Node.js)
   |  parameterised queries, transactions
   v
SQLite (single file, WAL mode)
   |
   +-- optional --> Google Gemini API (AI-generated practice only)
```

Key architectural facts to state:
- The frontend holds **no authoritative state** except a theme preference.
- Every learning record, quiz result, campaign assignment, and analytics
  figure is computed from the SQLite database on every request.
- The AI provider is an **optional dependency** — the architecture diagram
  should show it as a dashed/optional edge, not a required one, since the
  system fully functions (auth, training, assessments, reviewed practice,
  campaigns, reports, analytics) without it.

## 4.3.1 Component Architecture

Update the component diagram to show the new backend layering:
`routes/` (HTTP concerns, validation) → `services/` (business logic, one
folder per domain: `auth`, `training`, `assessments`, `practice`,
`campaigns`, `reports`, `analytics`, `scoring`, `session`, `activity`, `ai`)
→ `db/` (the single SQLite connection, migrations, seed data). This mirrors
whatever layered-architecture diagram your report already uses for the
frontend (pages → components → services) — it is worth explicitly drawing
the parallel.

## 4.3.2 Data Model

**This is the biggest concrete addition.** The report should now include an
entity-relationship description or diagram for the 22-table schema in
`backend/src/db/migrations/0001_init.sql`. At minimum, describe:
- `users` / `sessions` (auth)
- `modules` / `lessons` / `lesson_completions` (training, with a `version`
  column separating content from learner records)
- `assessments` / `assessment_questions` / `assessment_options` /
  `assessment_attempts` / `assessment_answers` (note: the answer key lives in
  a column, `assessment_options.is_correct`, that is never serialized to the
  client pre-submission — worth a sentence on this as a deliberate security
  boundary)
- `practice_scenarios` / `practice_scenario_indicators` / `practice_attempts`
  (the reviewed-practice bank and its ground truth)
- `ai_scenarios` (owner-scoped Gemini history)
- `campaigns` / `campaign_scenarios` / `campaign_assignments` /
  `campaign_scenario_completions`
- `reports`, `activity_events`

A short paragraph on **why SQLite** (see `docs/IMPLEMENTATION_STATUS.md` §2)
belongs here — it is a legitimate, citable architectural decision for a
final-year project of this scope.

## 4.4 Implementation

Sections likely worth adding/expanding:
- **Authentication implementation**: Argon2id parameters, session
  regeneration on login, CSRF double-submit pattern, rate limiting.
- **Server-side grading**: the pre-submission/post-submission data-hiding
  boundary for assessments (a genuinely interesting implementation detail —
  the question payload and the graded result are structurally different
  responses, not the same object with fields conditionally hidden).
- **Awareness scoring**: reproduce the weighted formula and the
  missing-data/renormalisation handling from
  `docs/IMPLEMENTATION_STATUS.md` §11 — this is likely to be one of the more
  heavily scrutinised design decisions in a viva/defense, so it is worth
  explaining the reasoning (why standalone reports don't count, why an
  untouched account isn't "0% / High Risk") rather than just stating the
  formula.
- **Campaign assignment snapshotting**: worth a short paragraph — it is a
  non-obvious design decision (why activation doesn't retroactively include
  new/changed learners) that a marker may ask about directly.

## 4.5 Screenshots

**All screenshots taken before this session are now stale** — they showed
either the old PhishSim UI, or the newer SentriLearn UI but backed by
localStorage/demo data. See the dedicated list below.

## 4.6 Testing

Replace any description of testing as manual/exploratory only. The report
should now describe:
- **Automated backend integration tests** (`backend/tests/api.test.js`,
  Node's built-in test runner, 61 tests across 9 suites, run against an
  isolated disposable database) — this is genuine automated testing evidence
  a marker can ask to see run live.
- **Manual/browser verification** of the full learner and admin journeys,
  including the specific security check that a learner cannot reach `/admin`
  by direct URL navigation.
- **The bounded live AI smoke test** and its honest result (see
  `docs/TEST_RESULTS.md` §6) — a good example of responsible testing
  practice (not spamming a paid API) worth a sentence in a testing-strategy
  discussion.
- Reference `docs/TEST_RESULTS.md` for the full evidence table rather than
  copying it verbatim into the report body — an appendix reference is
  cleaner.

## Chapter Five — Achievements / Limitations

**Achievements** worth stating plainly (all verified, see
`docs/TEST_RESULTS.md`):
- Real, persistent, database-backed authentication and authorization
  replacing the earlier demo-role prototype.
- Server-side grading with a verified data-hiding boundary (answer keys
  never reach the client before submission).
- A working, documented awareness-score formula with defensible handling of
  missing/partial data.
- A reviewed-practice content bank that includes legitimate messages, so
  "report everything" is not a winning strategy — addressing a common
  weakness in phishing-training tools.
- An automated regression test suite, not just manual testing.

**Genuine limitations** (do not overstate, do not understate):
- SQLite's single-writer model is appropriate for this bounded academic
  deployment, not a large concurrent user base.
- No self-service password reset; recovery is administrator-assisted by
  design.
- Curriculum/question content versioning exists in the schema but has no
  admin-facing editing UI (a CMS was explicitly out of scope for this
  project).
- The live Gemini smoke test did not get a successful generation on the day
  it was run (see `docs/TEST_RESULTS.md` §6) — the integration is verified
  correct, but this is honest evidence to report rather than omit.
- The project's root `README.md` documentation has not yet been rewritten
  to match the new architecture (see "Follow-up work" below).

**Do not claim** in this chapter: measured improvement in participant
phishing-detection ability, formal security audit/certification, or
institutional deployment approval — none of that was in scope for this
session's work.

## Appendix — User Manual

Needs new sections/screenshots for:
- Signing in with a real account (no more one-click demo buttons).
- The Admin → Learner Accounts panel: creating an account and the one-time
  temporary-password display.
- The Admin → Report Review panel.
- The two Simulation Lab modes (Reviewed Practice vs. AI-Generated Practice)
  and what distinguishes them for the end user.
- Campaign assignment from a learner's point of view (Simulation Campaigns
  page now shows *assigned* exercises with progress, not a management
  console).

---

## Screenshots that MUST be retaken

Every screenshot from before this backend upgrade should be treated as
stale. Concretely, retake:

1. **Login page** — no more "Continue as Demo Learner / Demo Administrator"
   buttons; real email/password form; informational demo-account note.
2. **Learner Dashboard** — now shows a "Demo account" banner when applicable,
   and "Not yet assessed" text (not `0%`/a bare dash) for unavailable
   metrics.
3. **Training Modules / lesson viewer** — content is now server-delivered;
   capture the "Mark as Complete" interaction.
4. **Assessment in progress and results/review screens** — the review screen
   content is materially unchanged visually but is now backend-sourced.
5. **Phishing Simulation Lab — Reviewed Practice tab** (new — did not exist
   in this form before): scenario picker, indicator checklist, the
   phishing-vs-legitimate decision buttons, and the post-decision feedback
   panel.
6. **Phishing Simulation Lab — AI-Generated Practice tab**: now carries an
   explicit "exploratory, unreviewed model output — not scored" banner that
   did not exist before.
7. **Simulation Campaigns — Admin view**: campaign creation modal (now
   selects reviewed scenarios and a target category, not free-text fields),
   and the Activate/Mark Completed/Archive controls.
8. **Simulation Campaigns — Learner view**: now shows only assigned
   campaigns with a personal completion progress bar (materially different
   from the admin view — worth showing both).
9. **Report Phishing page**: updated confirmation wording ("saved in
   SentriLearn for review") and the "My Reports" history list.
10. **My Progress page** — "Not yet assessed" wording for unavailable
    metrics.
11. **Admin Analytics dashboard** — real, small, database-derived numbers
    (not the old 125 / 78% / 21% placeholders), plus the "these figures
    include demo data" banner.
12. **Admin → Learner Accounts** (new page — did not exist before): the
    learner table and the one-time temporary-password dialog.
13. **Admin → Report Review** (new page — did not exist before).

---

## Follow-up work explicitly NOT done in this session

- `README.md` at the project root still describes the previous "PhishSim"
  architecture (in-memory storage, old `/api/phishing/*` routes, old
  screenshots) and was **not** rewritten — it was judged out of scope for a
  backend-upgrade session and is called out here so it isn't mistaken for an
  oversight. A `docs/SETUP.md` was written instead with accurate, current
  setup commands (see that file).
- No changes were made to the Word report itself, per instructions.
