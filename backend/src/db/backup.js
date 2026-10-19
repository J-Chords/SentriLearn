// =============================================
// SAFE BACKUP — consistent snapshot even in WAL mode
//
//   npm run db:backup
//
// Uses SQLite's VACUUM INTO, which produces a single consistent
// file regardless of any in-progress WAL writes — safer than
// copying the .sqlite file directly while the server is running.
// =============================================
import fs from 'node:fs';
import path from 'node:path';
import { getDb, resolveDatabasePath } from './connection.js';

function main() {
  const dbPath = resolveDatabasePath();
  const backupDir = path.join(path.dirname(dbPath), 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `sentrilearn-${stamp}.sqlite`);

  const db = getDb();
  db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);

  console.log(`Backup written to ${backupPath}`);
  console.log('To restore: stop the server, then copy that file over the path in DATABASE_PATH (backend/.env).');
}

main();
