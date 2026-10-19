# SentriLearn — Setup (Windows PowerShell)

Requires **Node.js ≥ 22.5.0** (tested on 24.18.0 — `node:sqlite` needs this
minimum). Check with `node --version`.

## 1. Backend install

```powershell
cd D:\SentriLearn\backend
npm install
```

## 2. Environment configuration

```powershell
Copy-Item .env.example .env
```

Then open `.env` and set (see `.env.example` for the full list with
comments):

- `GOOGLE_API_KEY` — optional. Leave blank/unset to run without AI-generated
  practice; every other feature works fine without it.
- `SESSION_SECRET` and `CSRF_SECRET` — **required**. Generate strong random
  values, e.g.:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Run it twice and paste one value into each. A dev-only insecure default is
  used automatically if you skip this in development, but the server
  **refuses to start in production** without real values.

Never paste real secret values into a chat, a commit message, or this
documentation.

## 3. Database — create and migrate

```powershell
npm run db:migrate
```

Safe to re-run any time (only applies pending migrations; never touches
existing learner data). This also runs automatically on `npm start`/`npm run dev`.

## 4. Demo accounts

```powershell
npm run db:seed:demo
```

Creates one admin + two learner accounts (`admin@sentrilearn.local`,
`alex.morgan@sentrilearn.local`, `priya.nair@sentrilearn.local`) with
randomly generated passwords, printed once and saved to the **gitignored**
`backend\local\demo-credentials.md`. Re-running this command is safe — it
skips accounts that already exist and never regenerates their passwords.

### Optional: showcase data

```powershell
npm run db:seed:showcase
```

Adds a small, clearly-labelled (`isDemoAccount: true`), internally
consistent set of demo activity for `alex.morgan@sentrilearn.local` —
useful for screenshots. Not run by default; safe to run once on a clean
database.

## 5. Start the servers

```powershell
# Terminal 1 — backend
cd D:\SentriLearn\backend
npm run dev          # nodemon, auto-restarts on file changes
# or: npm start       # plain node, no auto-restart

# Terminal 2 — frontend
cd D:\SentriLearn\frontend
npm install          # first time only
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## 6. Run tests

```powershell
cd D:\SentriLearn\backend
npm test
```

Runs `backend/tests/api.test.js` (Node's built-in test runner) against an
isolated, disposable SQLite file created and deleted automatically —
**never** the real `backend\data\sentrilearn.sqlite`.

Frontend build check:
```powershell
cd D:\SentriLearn\frontend
npm run build
```

## 7. Backup

```powershell
cd D:\SentriLearn\backend
npm run db:backup
```

Writes a timestamped, consistent snapshot (via SQLite's `VACUUM INTO`, safe
even while the server is running in WAL mode) to `backend\data\backups\`.

**To restore:** stop the server, then copy the desired backup file over the
path set in `DATABASE_PATH` in `.env` (default
`backend\data\sentrilearn.sqlite`), then start the server again.

## 8. Reset (development only — destructive)

**Stop the backend server first.** SQLite files stay locked on Windows as
long as any process (the dev server, a leftover `nodemon` watcher, another
terminal) has them open — the reset command will fail with a clear
`EBUSY`/`EPERM` message and Windows-specific instructions if something still
has it open.

```powershell
# Find and stop whatever is using the port first if unsure:
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Stop-Process -Id <that PID> -Force

# Then:
$env:CONFIRM_RESET = "yes"
npm run db:reset
```

Refuses to run at all if `NODE_ENV=production`, or if `CONFIRM_RESET` isn't
set to exactly `yes` — this is a deliberate, hard-to-trigger-by-accident
guard, not a convenience default.
