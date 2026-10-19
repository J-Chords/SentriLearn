// =============================================
// MIGRATION RUNNER
//
// Applies every *.sql file in db/migrations that hasn't been
// recorded in schema_migrations yet, in filename order, each
// inside its own transaction. Safe to run repeatedly.
// =============================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getDb } from './connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export function runMigrations() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version)
  );

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const results = [];
  for (const file of files) {
    if (applied.has(file)) {
      results.push({ file, applied: false, reason: 'already applied' });
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
        .run(file, new Date().toISOString());
      db.exec('COMMIT');
      results.push({ file, applied: true });
    } catch (err) {
      db.exec('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err.message}`);
    }
  }
  return results;
}

// Allow running directly: `node src/db/migrate.js`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = runMigrations();
  for (const r of results) {
    console.log(r.applied ? `✓ applied ${r.file}` : `- skipped ${r.file} (${r.reason})`);
  }
  console.log(`Migrations complete: ${results.filter((r) => r.applied).length} applied, ${results.length} total.`);
}
