// =============================================
// DEV-ONLY DATABASE RESET
//
// Deletes the SQLite database file (and WAL/SHM sidecars) so a
// fresh one is created on next migrate. Refuses to run unless
// NODE_ENV is NOT 'production' AND CONFIRM_RESET=yes is set, so it
// cannot be triggered by accident against a real deployment.
//
//   CONFIRM_RESET=yes npm run db:reset
// =============================================
import fs from 'node:fs';
import { config } from '../config/index.js';
import { resolveDatabasePath } from './connection.js';

function main() {
  if (config.server.nodeEnv === 'production') {
    console.error('Refusing to reset the database: NODE_ENV=production.');
    process.exit(1);
  }
  if (process.env.CONFIRM_RESET !== 'yes') {
    console.error('Refusing to reset the database: set CONFIRM_RESET=yes to confirm this destructive, dev-only action.');
    console.error('Example (PowerShell): $env:CONFIRM_RESET="yes"; npm run db:reset');
    process.exit(1);
  }

  const dbPath = resolveDatabasePath();
  let lockedFile = null;

  for (const suffix of ['', '-wal', '-shm']) {
    const p = dbPath + suffix;
    if (!fs.existsSync(p)) continue;
    try {
      fs.unlinkSync(p);
      console.log(`Removed ${p}`);
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        lockedFile = p;
        break;
      }
      throw err;
    }
  }

  if (lockedFile) {
    console.error(`\nCould not delete ${lockedFile} — it is still open by another process.`);
    console.error('On Windows, SQLite files stay locked as long as ANY node process has the');
    console.error('database open (the dev server, a nodemon watcher, another terminal, etc).');
    console.error('\nStop the backend server first, then re-run this command:');
    console.error('  1. Find and stop the process using the port (PowerShell):');
    console.error(`       Get-NetTCPConnection -LocalPort ${config.server.port} | Select-Object OwningProcess`);
    console.error('       Stop-Process -Id <that PID> -Force');
    console.error('  2. Re-run: CONFIRM_RESET=yes npm run db:reset  (PowerShell: $env:CONFIRM_RESET="yes"; npm run db:reset)');
    process.exit(1);
  }

  console.log('Database reset. Run `npm run db:migrate` (or just start the server) to recreate it.');
}

main();
