# SentriLearn

**Cybersecurity Awareness and Phishing Prevention Platform for Students and Employees**

SentriLearn is a final-year academic project that provides cybersecurity-awareness training, assessments, reviewed phishing-practice scenarios, progress tracking, phishing-reporting practice, campaign management, and administrator analytics.

The current implementation uses:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite using Node's built-in `node:sqlite`
- **Authentication:** Server-side sessions with role-based access control
- **Password security:** Argon2id
- **AI integration:** Google Gemini for optional AI-generated phishing-practice scenarios
- **Reviewed practice:** Works without Gemini and is the recommended mode for demonstrations

---

## 1. System Requirements

Install the following before running the project.

### Required

1. **Windows 10 or Windows 11**
2. **Node.js 22.5.0 or later**
   - The project was tested with Node.js **24.18.0**
   - Node 22.5+ is required because the backend uses Node's built-in `node:sqlite`
3. **npm**
   - Installed automatically with Node.js
4. **A modern browser**
   - Google Chrome, Microsoft Edge, or Firefox

### Recommended

- **Visual Studio Code** for viewing/editing the project
- **Git** if the project will be cloned or version-controlled
- **Google Gemini API key** only if you want to use the optional AI-generated practice feature

> The main SentriLearn features work without Gemini. Training, assessments, reviewed phishing practice, campaigns, reports, progress, authentication, and admin analytics do not require an AI key.

---

## 2. Project Folder Structure

A simplified structure is:

```text
SentriLearn/
│
├── backend/
│   ├── src/
│   ├── data/
│   ├── local/
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/
│   ├── IMPLEMENTATION_STATUS.md
│   ├── API_REFERENCE.md
│   ├── TEST_RESULTS.md
│   └── REPORT_UPDATE_NOTES.md
│
└── README.md
```

---

# 3. First-Time Installation

The commands below are written for **Windows PowerShell**.

Open PowerShell and move to the project folder.

Example:

```powershell
cd D:\SentriLearn
```

If your folder is stored somewhere else, replace `D:\SentriLearn` with the correct path.

---

## 4. Install the Backend

Move into the backend folder:

```powershell
cd D:\SentriLearn\backend
```

Install the backend dependencies:

```powershell
npm install
```

Wait until installation finishes without errors.

---

## 5. Create the Backend Environment File

The project includes an example environment file.

From the backend folder, run:

```powershell
Copy-Item .env.example .env
```

Then open:

```text
D:\SentriLearn\backend\.env
```

in Visual Studio Code or Notepad.

The `.env.example` file contains the supported configuration variables.

A typical local-development configuration includes values such as:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=data/sentrilearn.sqlite

SESSION_SECRET=replace-with-a-long-random-secret
CSRF_SECRET=replace-with-another-long-random-secret

GOOGLE_API_KEY=
```

### Important

- Use long random values for `SESSION_SECRET` and `CSRF_SECRET`.
- Do **not** upload or commit the real `.env` file.
- `GOOGLE_API_KEY` is optional.
- If no Gemini key is supplied, the rest of SentriLearn will still work.

If Vite starts the frontend on a different port, such as `5174`, update `FRONTEND_URL` if necessary and restart the backend.

---

# 6. Create the Database

Still inside:

```text
D:\SentriLearn\backend
```

run:

```powershell
npm run db:migrate
```

This creates/migrates the SQLite database and required tables.

The normal development database is stored in:

```text
backend\data\sentrilearn.sqlite
```

Do not manually edit the SQLite file.

---

# 7. Create Demo Accounts

SentriLearn can generate local demonstration accounts automatically.

There are two useful options.

## Option A - Demo Accounts Only

Run:

```powershell
npm run db:seed:demo
```

This creates demonstration accounts without adding completed learning activity.

## Option B - Demo Accounts + Showcase Data

For a project defence or demonstration, this option is recommended:

```powershell
npm run db:seed:showcase
```

This creates the demo accounts and also adds a small, internally consistent demonstration dataset for the learner dashboard and analytics.

### Demo Account Emails

The seed process creates accounts similar to:

```text
Administrator:
admin@sentrilearn.local

Learner:
alex.morgan@sentrilearn.local

Learner:
priya.nair@sentrilearn.local
```

### Demo Passwords

Passwords are generated automatically.

After running the demo seed command, open:

```text
backend\local\demo-credentials.md
```

The generated passwords are stored there for local use.

Example location:

```text
D:\SentriLearn\backend\local\demo-credentials.md
```

> `demo-credentials.md` is intentionally gitignored. Do not copy the generated passwords into this README or commit them to Git.

If the credentials file is missing, run the demo seed command again on a clean database.

---

# 8. Start the Backend

From:

```text
D:\SentriLearn\backend
```

run:

```powershell
npm run dev
```

A successful startup should indicate that the SentriLearn backend is online.

The default backend address is:

```text
http://localhost:5000
```

Keep this PowerShell window open while using the application.

---

# 9. Install the Frontend

Open a **second PowerShell window**.

Run:

```powershell
cd D:\SentriLearn\frontend
npm install
```

Wait until the dependencies finish installing.

---

# 10. Start the Frontend

Still inside:

```text
D:\SentriLearn\frontend
```

run:

```powershell
npm run dev
```

Vite will display an address similar to:

```text
http://localhost:5173
```

If port 5173 is already being used, Vite may select another port such as:

```text
http://localhost:5174
```

Always use the URL shown by Vite.

Open that address in your browser.

---

# 11. Login to SentriLearn

At the SentriLearn sign-in page, enter one of the demo email addresses and the matching password from:

```text
backend\local\demo-credentials.md
```

## Learner Demonstration

Use:

```text
alex.morgan@sentrilearn.local
```

or:

```text
priya.nair@sentrilearn.local
```

with the corresponding generated password.

Learners can access:

- Dashboard
- Training Modules
- Assessments
- Phishing Simulation Lab
- My Progress
- Assigned Simulation Campaigns
- Report Phishing

A learner cannot access administrator-only pages.

## Administrator Demonstration

Use:

```text
admin@sentrilearn.local
```

with the generated password.

The administrator can access features such as:

- Administrator Analytics
- Learner Account Management
- Campaign Management
- Report Review
- Learner Performance
- Risk/Awareness Distribution

---

# 12. Recommended Defence Demonstration Flow

For a reliable project defence, use the following order.

## Learner Flow

1. Sign in as **Alex Morgan**
2. Open the **Dashboard**
3. Open **Training Modules**
4. Complete or review a lesson
5. Open **Assessments**
6. Complete an assessment
7. Open **Phishing Simulation Lab**
8. Use **Reviewed Practice**
9. Identify whether the message is phishing or legitimate
10. Review the feedback
11. Open **Report Phishing**
12. Submit a practice report
13. Open **My Progress**
14. Show how the score/progress has changed
15. Sign out

## Second Learner Isolation Check

1. Sign in as **Priya Nair**
2. Open the dashboard
3. Show that Priya does not inherit Alex's private progress/results

## Administrator Flow

1. Sign in as the administrator
2. Open **Admin Analytics**
3. Show database-derived learner statistics
4. Open **Learner Accounts**
5. Create or review a learner account
6. Open **Simulation Campaigns**
7. Create/activate a campaign if required
8. Open **Report Review**
9. Show submitted learner practice reports

---

# 13. Phishing Simulation Lab

SentriLearn provides two simulation modes.

## Reviewed Practice

This is the recommended defence mode.

It contains reviewed fictional scenarios with known expected answers.

The learner:

- reads a simulated message
- identifies suspicious indicators
- decides whether the message is phishing or legitimate
- submits the answer
- receives reviewed feedback

Reviewed Practice contributes to the learner's educational awareness metrics.

## AI-Generated Practice

The optional AI mode uses the configured Google Gemini API.

To enable it:

1. Obtain a Gemini API key from Google AI Studio.
2. Add the key to:

```text
backend\.env
```

Example:

```env
GOOGLE_API_KEY=your-key-here
```

3. Restart the backend.

### Important

AI-generated practice is optional and unscored.

If Google Gemini is unavailable or returns a temporary service error, use **Reviewed Practice** instead. The rest of SentriLearn remains operational.

---

# 14. Awareness Score

SentriLearn uses a project-defined educational awareness score.

The implemented weighting is:

```text
30% Assessment Performance
30% Reviewed-Practice Decision Accuracy
25% Training Completion
15% Appropriate Phishing Reporting Behaviour
```

Risk/awareness categories are:

```text
0-39   = High Risk
40-69  = Medium Risk
70-100 = Low Risk
```

These categories are educational indicators for the project and are not intended to predict with certainty whether a user will experience a real-world compromise.

If a learner has not completed enough activity, the interface may display:

```text
Not yet assessed
```

instead of incorrectly treating missing activity as zero performance.

---

# 15. Verify the Backend with Automated Tests

From:

```powershell
cd D:\SentriLearn\backend
```

run:

```powershell
npm test
```

The final verified backend test suite completed with:

```text
61 tests
61 passed
0 failed
```

The test suite uses an isolated SQLite test database and does not intentionally use the main development database.

---

# 16. Build the Frontend for Verification

From:

```powershell
cd D:\SentriLearn\frontend
```

run:

```powershell
npm run build
```

A successful build should end with a message similar to:

```text
built successfully
```

or:

```text
✓ built
```

---

# 17. Database Backup

Before an important demonstration or project defence, back up the database.

From:

```powershell
cd D:\SentriLearn\backend
```

run:

```powershell
npm run db:backup
```

Keep the backup in a safe location.

---

# 18. Reset the Development Database

Use this only when you intentionally want to erase the development database and start again.

## Step 1 - Stop the Backend

Press:

```text
Ctrl + C
```

in the PowerShell window running the backend.

The database must not be open by the backend when resetting it.

## Step 2 - Reset

From the backend folder:

```powershell
$env:CONFIRM_RESET = "yes"
npm run db:reset
Remove-Item Env:CONFIRM_RESET
```

## Step 3 - Recreate the Database

Run:

```powershell
npm run db:migrate
```

## Step 4 - Recreate Demo Data

For showcase data:

```powershell
npm run db:seed:showcase
```

or for accounts only:

```powershell
npm run db:seed:demo
```

Then restart the backend:

```powershell
npm run dev
```

> Resetting deletes local development activity. Back up first if the data is important.

---

# 19. Normal Daily Startup

After the project has already been installed once, you normally need only two PowerShell windows.

## PowerShell Window 1 - Backend

```powershell
cd D:\SentriLearn\backend
npm run dev
```

## PowerShell Window 2 - Frontend

```powershell
cd D:\SentriLearn\frontend
npm run dev
```

Then open the frontend URL printed by Vite.

You do **not** need to migrate, reinstall dependencies, or reseed the database every time the application starts.

---

# 20. Normal Shutdown

Stop the frontend and backend using:

```text
Ctrl + C
```

in each PowerShell window.

The SQLite database preserves learner progress between normal restarts.

---

# 21. Troubleshooting

## Problem: `npm` is not recognized

Node.js/npm is not installed correctly.

Install Node.js 22.5 or later and restart PowerShell.

Check:

```powershell
node --version
npm --version
```

---

## Problem: Port 5000 is already in use

Another backend process may still be running.

Close the old backend terminal or stop the process using the port.

Do not start multiple backend servers against the same development database unnecessarily.

---

## Problem: Vite uses port 5174 instead of 5173

This is normal if 5173 is busy.

Use the URL printed by Vite.

If login/API requests are blocked because the backend only allows 5173, update `FRONTEND_URL` in `backend\.env` to match the active frontend URL and restart the backend.

---

## Problem: Demo login credentials are unknown

Open:

```text
backend\local\demo-credentials.md
```

If the file does not exist on a fresh database, run:

```powershell
npm run db:seed:showcase
```

or:

```powershell
npm run db:seed:demo
```

---

## Problem: Login fails after the database was reset

The old accounts were deleted.

Run:

```powershell
npm run db:migrate
npm run db:seed:showcase
```

Then use the new credentials written to:

```text
backend\local\demo-credentials.md
```

---

## Problem: `EBUSY` or SQLite database is locked during reset

Stop the backend first.

Press:

```text
Ctrl + C
```

in the backend terminal, then run the reset command again.

Do not delete SQLite files while the server is still using them.

---

## Problem: Gemini shows "unavailable" or HTTP 503

This does not prevent the core application from running.

Google Gemini can occasionally return temporary service or high-demand errors.

Use:

```text
Phishing Simulation Lab -> Reviewed Practice
```

for the project demonstration.

---

## Problem: Browser session behaves unexpectedly after major database changes

1. Sign out if possible.
2. Stop and restart the backend.
3. Close and reopen the application tab.
4. Sign in again using a valid demo account.

---

# 22. Security Notes

The current implementation includes:

- Argon2id password hashing
- Server-side sessions
- CSRF protection
- Role-based authorization
- Learner/admin separation
- Server-side assessment scoring
- Per-user record ownership
- SQLite persistence
- Input validation
- Login rate limiting
- Owner-isolated AI history

Do not:

- publish the `.env` file
- commit real API keys
- commit generated demo passwords
- use real user credentials inside phishing scenarios
- change the application into a credential-harvesting system
- send simulated phishing messages to real people without proper authorization

SentriLearn is an educational platform.

---

# 23. Important Local Files

## Environment configuration

```text
backend\.env
```

Private. Do not commit.

## Environment template

```text
backend\.env.example
```

Safe template for setup.

## SQLite database

```text
backend\data\sentrilearn.sqlite
```

Contains the local application's stored records.

## Demo credentials

```text
backend\local\demo-credentials.md
```

Generated locally and gitignored.

## Implementation documentation

```text
docs\IMPLEMENTATION_STATUS.md
docs\API_REFERENCE.md
docs\TEST_RESULTS.md
docs\REPORT_UPDATE_NOTES.md
```

---

# 24. Quick Setup Summary

For a fresh defence/demo installation:

```powershell
# BACKEND
cd D:\SentriLearn\backend
npm install
Copy-Item .env.example .env

# Edit .env and set SESSION_SECRET / CSRF_SECRET.
# GOOGLE_API_KEY is optional.

npm run db:migrate
npm run db:seed:showcase
npm run dev
```

Open a second PowerShell window:

```powershell
# FRONTEND
cd D:\SentriLearn\frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

Login using one of:

```text
admin@sentrilearn.local
alex.morgan@sentrilearn.local
priya.nair@sentrilearn.local
```

and read the generated passwords from:

```text
backend\local\demo-credentials.md
```

---

# 25. Project Status

The final verified implementation includes:

- database-backed learner/admin accounts
- persistent training progress
- server-scored assessments
- reviewed phishing-practice scenarios
- optional Gemini-generated practice
- practice phishing reports
- simulation campaigns
- learner progress analytics
- administrator analytics
- learner-account administration
- server-side authorization and ownership checks

The project is intended as an academic cybersecurity-awareness prototype and demonstration system rather than a large-scale commercial production deployment.

---

## SentriLearn

**Learn. Identify. Report. Stay Secure.**
