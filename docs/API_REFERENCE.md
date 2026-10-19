# SentriLearn — API Reference

_Base URL (dev): `http://localhost:5000/api` (proxied from the frontend at `/api`)_

All responses share the envelope:
```json
{ "success": true, "message": "...", "data": { ... }, "timestamp": "..." }
```
Errors: `{ "success": false, "message": "...", "details": [...]?, "timestamp": "..." }`

**CSRF**: every non-`GET`/`HEAD`/`OPTIONS` request must include header
`X-CSRF-Token`, obtained from `GET /api/auth/csrf` and refreshed from the
`csrfToken` field returned by `POST /api/auth/login`. Requests are also
cookie-session authenticated (`credentials: 'include'` / `withCredentials`).

No endpoint below returns secrets (password hashes, session secrets, the
Gemini API key) under any role.

---

## Auth — `/api/auth`

| Method | Path | Access | CSRF | Body | Success | Common errors |
|---|---|---|---|---|---|---|
| GET | `/csrf` | public | no | — | `{ csrfToken }` | — |
| POST | `/login` | public | **yes** | `{ email, password, rememberMe? }` | `{ user, csrfToken }` | 401 generic "Invalid email or password" (also for disabled/unknown accounts — no user enumeration); 429 rate-limited; 400 validation |
| POST | `/logout` | learner/admin | yes | — | `null` | 401 if not authenticated |
| GET | `/me` | learner/admin | no | — | `{ user }` | 401 if not authenticated |

`user` shape: `{ id, email, name, role, learnerCategory, isActive, createdAt, isDemoAccount }`.

---

## Admin user management — `/api/admin`  (admin only)

| Method | Path | Body | Success | Common errors |
|---|---|---|---|---|
| GET | `/users` | — | `{ users: [...] }` (learners only) | 403 if not admin |
| POST | `/users` | `{ email, name, learnerCategory }` | `{ user, temporaryPassword }` — password shown **once** | 409 email exists; 403 |
| PATCH | `/users/:id/status` | `{ isActive: boolean }` | `{ user }` — disabling immediately destroys all of that user's sessions | 404 not a learner; 403 |

---

## Training — `/api/training`  (learner/admin)

| Method | Path | Body | Success | Notes |
|---|---|---|---|---|
| GET | `/modules` | — | `{ modules: [{ id, title, description, icon, durationLabel, percent, status, lessons: [{ id, title, body, keyTakeaways, completed }] }] }` | Merges curriculum + this user's completion |
| GET | `/summary` | — | `{ trainingCompletionPercent, completedLessons, totalLessons, modulesCompleted, totalModules, perModule: [...] }` | Same calculation used by `/analytics/me` |
| POST | `/lessons/:lessonId/complete` | — | `{ alreadyCompleted, ...summary }` | Idempotent; 404 unknown lesson |

---

## Assessments — `/api/assessments`  (learner/admin)

| Method | Path | Body | Success | Notes |
|---|---|---|---|---|
| GET | `/` | — | `{ assessments: [{ id, title, description, icon, version, questionCount, latestAttempt }] }` | |
| GET | `/average` | — | `{ available, average, attemptedCount }` | Mean of the latest attempt per attempted assessment |
| GET | `/:assessmentId` | — | `{ assessment: { id, title, version, questions: [{ id, text, options: [{id, text}] }] } }` | **No correct answers or explanations** |
| POST | `/:assessmentId/attempts` | — | `{ attemptId, assessment }` | Creates an `in_progress` attempt |
| POST | `/attempts/:attemptId/submit` | `{ answers: [{questionId, selectedOptionId}] }` (`.strict()` — extra fields rejected) | `{ alreadySubmitted, attemptId, score, total, percentage, strengths, areasToImprove, review }` | Idempotent — resubmission returns the original result unchanged; 403 wrong owner; 400 malformed answer set |
| GET | `/attempts/:attemptId` | — | full result (as above) | Only if `status='submitted'`; 409 otherwise; 403 wrong owner |
| GET | `/:assessmentId/attempts` | — | `{ attempts: [{ id, score, total, percentage, startedAt, submittedAt, isFirstAttempt }] }` | |

---

## Reviewed Practice — `/api/practice`  (learner/admin)

| Method | Path | Body | Success | Notes |
|---|---|---|---|---|
| GET | `/indicators` | — | `{ indicators: [{ key, label }] }` | The 8 fixed indicator keys |
| GET | `/scenarios` | — | `{ scenarios: [{ id, category, targetContext, difficulty, subject, senderName, senderEmail, body }] }` | **No `isLegitimate` or indicator ground truth** |
| GET | `/scenarios/:id` | — | `{ scenario }` (same shape) | 404 unknown |
| POST | `/scenarios/:id/attempts` | `{ selectedIndicators: string[], decision: 'phishing'\|'legitimate', campaignId? }` | `{ attemptId, isFirstAttempt, decision, correctDecision, decisionCorrect, isLegitimate, indicators: {correctlyIdentified, missed, falsePositives, totalPositive}, tacticsSummary, manipulationTechniques }` | If `campaignId` given: 403 not assigned, 400 scenario not in that campaign, 400 campaign not active |
| GET | `/summary` | — | `{ decisionAccuracy: {available, accuracy, attemptedCount}, reportingRate: {available, rate, eligibleCount} }` | First-attempts only |
| GET | `/history` | — | `{ attempts: [...] }` | Owner-scoped |

---

## AI-Generated Practice — `/api/ai-scenarios`  (learner/admin)

| Method | Path | Body | Success | Notes |
|---|---|---|---|---|
| GET | `/status` | — | `{ provider, model, available }` | `available:false` when no `GOOGLE_API_KEY` |
| POST | `/generate` | `{ category, target, impersonation, severity?, urgency?, tone? }` | full simulation object, persisted, owner-scoped | 503 if AI unavailable; 429 per-user rate limit (8/10min default) |
| POST | `/explain` | `{ emailSubject, category, tactics? }` | explanation object | 503 if AI unavailable |
| GET | `/history` | — | owner-scoped array | |
| GET | `/stats` | — | `{ totalGenerated, categoryCounts, lastGeneratedAt }` | Owner-scoped |
| DELETE | `/history/:id` | — | `null` | 404 not found / not owner |
| DELETE | `/history` | — | `null` | Clears only the caller's own history |

---

## Campaigns — `/api/campaigns`

| Method | Path | Access | Body | Success | Notes |
|---|---|---|---|---|---|
| GET | `/mine` | learner/admin | — | `{ campaigns: [...] }` | Only campaigns this user is assigned to, with per-scenario `completed` flag and `myProgress` |
| GET | `/` | **admin** | — | `{ campaigns: [...] }` | Full management view |
| POST | `/` | **admin** | `{ name, targetCategory: 'student'\|'employee'\|'both', difficulty, description?, startDate?, scenarioIds: string[] (min 1) }` | `{ campaign }` (status `draft`) | 400 if `scenarioIds` empty |
| GET | `/:id` | **admin** | — | `{ campaign }` | 404 |
| POST | `/:id/activate` | **admin** | — | `{ campaign }` (status `active`, `assignedCount` set) | 400 no scenarios / no matching learners; snapshots assignment |
| POST | `/:id/complete` | **admin** | — | `{ campaign }` (status `completed`) | 400 if not currently `active` |
| POST | `/:id/archive` | **admin** | — | `{ campaign }` (status `archived`) | Never deletes rows |

---

## Reports — `/api/reports`

| Method | Path | Access | Body | Success | Notes |
|---|---|---|---|---|---|
| POST | `/` | learner/admin | `{ messageType, reasons: string[] (min 1, from a fixed enum), notes? }` | `{ report }` (status `received`) | |
| GET | `/mine` | learner/admin | — | `{ reports: [...] }` | Own reports only |
| GET | `/` | **admin** | — | `{ reports: [...] }` (all, with `userName`) | |
| PATCH | `/:id/status` | **admin** | `{ status: 'received'\|'reviewed'\|'closed' }` | `{ report }` | 403 for learners |

---

## Analytics — `/api/analytics`

| Method | Path | Access | Success |
|---|---|---|---|
| GET | `/me` | learner/admin | `{ training, assessment, decisionAccuracy, reportingRate, awareness: {available, score, riskLevel, riskLabel, componentsUsed}, recentActivity }` |
| GET | `/admin` | **admin** | `{ totalLearners, includesDemoAccounts, trainingCompletionPercent, averageAssessmentScore, averageDecisionAccuracy, averageReportingRate, riskDistribution: [{level,count,percent}], unassessedCount, trainingPerformance, campaignPerformance, reportsByStatus, learnerTable, recentActivity }` |

---

## Health

| Method | Path | Access | Success |
|---|---|---|---|
| GET | `/health` | public | `{ status, uptime, aiProvider: {provider, model, available}, timestamp }` |

---

## HTTP status code conventions

| Code | Meaning here |
|---|---|
| 200 / 201 | success (201 for resource creation: attempts, campaigns, learner accounts, reports) |
| 400 | validation failure (zod schema, or a business-rule rejection like "no scenarios to activate") |
| 401 | not authenticated, or session invalidated (disabled account) |
| 403 | authenticated but forbidden (wrong role, not the resource owner, not campaign-assigned) |
| 404 | resource not found |
| 409 | conflict (duplicate email on account creation; reading an un-submitted attempt's result) |
| 429 | rate limited (login attempts, or AI generation) |
| 503 | AI-generated practice unavailable (no key configured) |
