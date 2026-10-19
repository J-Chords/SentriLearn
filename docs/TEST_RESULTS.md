# SentriLearn — Test Results

_Date: 2026-09-25. Environment: Windows, Node.js v24.18.0, npm 11.16.0._
_All destructive/automated testing ran against an isolated, disposable SQLite
file (`backend/data/test-<pid>-<timestamp>.sqlite`, auto-deleted at the end
of the run) — the real development database
(`backend/data/sentrilearn.sqlite`) was never touched by automated tests._

## 1. Backend automated integration tests

**Command:** `cd backend && npm test`
(runs `node --test "tests/**/*.test.js"`, i.e. `backend/tests/api.test.js`)

**Result: 61 / 61 passed, 0 failed.** (duration ≈ 5.9s)

| Suite | Tests | Result |
|---|---|---|
| Authentication | 8 | ✔ all pass |
| Authorization | 7 | ✔ all pass |
| Training | 5 | ✔ all pass |
| Assessments | 9 | ✔ all pass |
| Reviewed Practice | 6 | ✔ all pass |
| Campaigns | 10 | ✔ all pass |
| Reports | 5 | ✔ all pass |
| Analytics | 3 | ✔ all pass |
| AI-generated practice is optional | 4 | ✔ all pass |

Covers, concretely: CSRF issuance/rejection/stale-token-after-regenerate,
generic-failure login (no user enumeration), disabled-account login and
**mid-session** disablement, unauthenticated/wrong-role/wrong-owner rejection
on every resource type, lesson-completion idempotency, module-percent
arithmetic, pre-submission question payloads containing no answer key,
server-computed grading against a known answer set, rejection of a forged
`score` field (strict schema), rejection of a cross-question option id,
attempt-ownership enforcement, submit-idempotency under conflicting
resubmission, retake producing a distinct attempt, both the per-assessment
"latest attempt" rule and the cross-assessment "quiz average" calculation,
phishing/legitimate scenario classification, indicator-overselection not
rescuing a wrong decision, first-attempt-only scoring with retries excluded,
reporting-rate eligibility scoping, full campaign lifecycle (draft → no
recipients / no scenarios rejection → activate → snapshot correctness →
learner isolation by category → scenario completion → cross-campaign
attempt rejection → complete → archive, with metrics preserved at each
step), report CRUD + role-gated status transitions, admin analytics
reconciling against direct DB counts (and explicitly **not** equal to the
old hard-coded `125`), risk-distribution/unassessed-count arithmetic, and AI
optionality (status, clean 503, owner-isolated empty history, and that every
other endpoint family works with AI disabled).

### Bugs found and fixed *during* this test-writing process
1. **`submitAttempt` returned stale `null` score/total/percentage** after a
   fresh submission (it reused the pre-update in-memory row instead of the
   freshly computed values). Fixed in `assessment.service.js`; caught by the
   `db:seed:showcase` script logging `null/null (null%)` before the fix, and
   confirmed by the "known answers produce the expected score" test after.
2. **A brand-new, completely untouched account read as "0% / High Risk"**
   instead of "Not yet assessed" — training completion (0/25) was always
   treated as an "available" scoring component even when literally nothing
   had happened yet. Fixed in `awarenessScore.service.js` (training only
   counts once ≥1 lesson is done, or some other component is available).
   Caught manually while inspecting a fresh learner's `/api/analytics/me`
   response, confirmed by the "risk distribution... unassessed" test.
3. **A test-harness bug (not an app bug) accidentally fired real, billed
   Gemini API calls during automated tests.** The test setup deleted
   `process.env.GOOGLE_API_KEY` to force AI off, but `dotenv/config`
   (imported later, inside `config/index.js`) only skips keys that are
   *already present* in `process.env` — deleting the key made dotenv reload
   the real key from `backend/.env`, and one test's `POST /generate` made a
   genuine ~11s round trip to Google before the harness was fixed. Fixed by
   setting the variable to an **empty string** instead of deleting it (dotenv
   then leaves it alone). Re-ran afterward: confirmed 503 in ~8ms, no network
   call. No other automated run is known to have made a live AI call.
4. **`npm run db:reset` failed with `EBUSY`** the first time it was tried,
   because the dev server (running under `nodemon`, auto-restarting on every
   source-file save) still held the SQLite file open. This was a genuine
   usage-ordering issue, not a code bug — fixed by (a) documenting clearly
   that the server must be stopped first, and (b) making `resetDev.js` catch
   `EBUSY`/`EPERM` and print Windows-specific `Get-NetTCPConnection` /
   `Stop-Process` instructions instead of an unhandled stack trace. Verified:
   stopping the server first, then `CONFIRM_RESET=yes npm run db:reset`,
   completed cleanly with no error.

## 2. Frontend build

**Command:** `cd frontend && npm run build`
**Result:** ✔ pass, both before and after the Admin Users page was added.
No new frontend dependencies were introduced. No build warnings other than
Vite's own CSS-plugin-timing notice (unrelated to this codebase).

There is no configured frontend lint script in `package.json`; none was
added, since the brief's testing checklist treats it as "available if
present" and it was not present before this session either.

## 3. Browser / manual end-to-end verification

Performed with Playwright driving Chromium against the running dev servers
(`backend` on `:5000`, `frontend` on `:5174`), against a **freshly reset and
reseeded** database (`npm run db:reset` → `db:migrate` → `db:seed:showcase`),
so every check below reflects genuinely fresh state, not carried-over test
pollution from earlier ad-hoc runs.

| Check | Result |
|---|---|
| Learner A (Alex) signs in with real credentials from `demo-credentials.md` | ✔ |
| Dashboard shows real, backend-derived figures (44% training / 80% quiz avg / 100% detection / Low Risk — matching the showcase seed, not any hard-coded value) | ✔ |
| Completing a genuinely-fresh lesson (Safe Browsing) updates progress live | ✔ |
| Taking a fresh assessment (Safe Browsing) end-to-end, seeing the server-graded result | ✔ |
| Reviewed Practice: picking a scenario, submitting a decision, seeing server feedback | ✔ |
| Submitting a Report Phishing form, seeing the "saved... for review" confirmation | ✔ |
| My Progress page reflects the same figures as the Dashboard | ✔ |
| **Security: Alex manually navigating the browser to `/admin` is redirected to `/dashboard`, not shown admin content** | ✔ |
| Sign out clears the session (redirected to `/login`) | ✔ |
| Learner B (Priya) signs in and does **not** see any of Alex's data (own dashboard reads 0% / "Not yet assessed", not Alex's 80%) | ✔ |
| Admin signs in, lands on Admin Analytics with real DB-derived figures (not the old 125/78%/21%) | ✔ |
| Admin → Learner Accounts: list, create (temporary password shown exactly once, "Done" dismisses it), disable, re-enable | ✔ |
| Admin → Simulation Campaigns: create a draft, activate it, see it move to Active with a real assigned-learner count | ✔ |
| Admin → Report Review page loads and lists submitted reports | ✔ |
| Responsive: tablet width (768px) and mobile width (390px) both render usably, including the bottom mobile nav and the demo-account banner | ✔ |
| Console/page errors during the above walkthrough | Only benign `401` network-log entries from the expected pre-login "am I already signed in?" check — no application errors |

## 4. Test database isolation

Confirmed: the automated suite creates
`backend/data/test-<pid>-<timestamp>.sqlite`, runs entirely against it, and
deletes it (plus `-wal`/`-shm` sidecars) in an `after()` hook that first
closes the `node:sqlite` connection and stops the HTTP listener. One earlier
run left a stray test file behind because the previous attempt crashed
before cleanup (see bug #3 above); it was manually removed
(`backend/data/test-28060-*.sqlite`) and is not present in the repository.
The real dev database was never deleted, reset, or written to by any
automated test.

## 5. Demo seeding verification

- Running `npm run db:migrate` / starting the server ordinarily does **not**
  create or touch demo accounts (only `seedCurriculum`, which is idempotent
  content, runs automatically).
- Re-running `npm run db:seed:demo` against an existing database prints
  "already exists, skipped (password unchanged)" for each account and does
  **not** regenerate or overwrite passwords.
- A clean seed (no `--with-showcase`) produces three accounts with genuinely
  zero learning activity — verified via `GET /api/training/summary` and
  `GET /api/analytics/me` immediately after seeding.
- `--with-showcase` produces internally consistent data because it calls the
  *same* service functions the real API routes use (`completeLesson`,
  `startAttempt`/`submitAttempt`, `submitPracticeAttempt`) rather than
  hand-writing rows — the resulting numbers are exactly what those code
  paths would produce for a real learner.
- Every account seeded this way has `isDemoAccount: true` in every API
  response and is labelled in the UI (Dashboard banner, Admin Analytics
  banner, Learner Accounts table, profile menu).
- No password appears in any committed file; `backend/local/` is gitignored
  and was confirmed absent from `git status` tracked output.

## 6. Gemini live smoke test

**Status: performed, bounded (2 calls total), result: reached the real API,
transient upstream failure both times.**

```
GET /api/ai-scenarios/status  ->  { provider: "Google Gemini", model: "gemini-3.8-flash", available: true }
POST /api/ai-scenarios/generate  (attempt 1)  ->  503 after ~10.8s
POST /api/ai-scenarios/generate  (attempt 2, one bounded retry)  ->  503 after ~12.4s
```

Server log for both attempts:
```
[GoogleGenerativeAI Error]: Error fetching from
https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent:
[503 Service Unavailable] This model is currently experiencing high demand.
Spikes in demand are usually temporary. Please try again later.
```

This confirms the integration itself is correctly wired — real
authentication succeeded (no `API_KEY`/`PERMISSION_DENIED` error), the
configured model name resolved to a real endpoint (no 404), and the
backend's own error handling degraded cleanly (a normal JSON 503, no crash,
no hang past the request timeout) — it just did not get a successful
generation from Google in either of the two attempts made. No further
retries were made, per instructions to avoid uncontrolled repeated paid
requests. **The configured model name was not changed** — the failure was
Google's own transient capacity signal, not a naming or auth problem, so
there was nothing to "fix" here per the "do not invent a model name" rule.

## 7. Summary

| Category | Passed | Failed | Blocked |
|---|---|---|---|
| Backend automated integration tests | 61 | 0 | 0 |
| Frontend build | 1 | 0 | 0 |
| Browser/manual end-to-end checks | 16 | 0 | 0 |
| Gemini live smoke test | 0 successful generations | 0 (not a code failure) | — (2 bounded attempts, both hit transient upstream 503) |
