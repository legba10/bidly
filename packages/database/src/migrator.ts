import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { Pool } from 'pg';

export interface AppliedMigration {
  readonly name: string;
  readonly checksum: string;
  readonly appliedAt: Date;
}

const migrationDirectory = fileURLToPath(new URL('../migrations/', import.meta.url));

export async function migrateToLatest(
  connectionString: string,
): Promise<readonly AppliedMigration[]> {
  const pool = new Pool({ application_name: 'bidly-migrator', connectionString, max: 1 });
  const client = await pool.connect();
  const applied: AppliedMigration[] = [];
  try {
    await client.query('begin');
    await client.query("select pg_advisory_xact_lock(hashtext('bidly-schema-migrations'))");
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )
    `);
    const entries = (await readdir(migrationDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /^\d{4}_.+\.sql$/u.test(entry.name))
      .map((entry) => entry.name)
      .sort();
    for (const name of entries) {
      const migrationSql = await readFile(
        new URL(`../migrations/${name}`, import.meta.url),
        'utf8',
      );
      const checksum = createHash('sha256').update(migrationSql).digest('hex');
      const existing = await client.query<{ checksum: string }>(
        'select checksum from schema_migrations where name = $1',
        [name],
      );
      const row = existing.rows[0];
      if (row) {
        if (row.checksum !== checksum)
          throw new Error(`Applied migration checksum mismatch: ${name}`);
        continue;
      }
      await client.query(migrationSql);
      const inserted = await client.query<{ applied_at: Date }>(
        'insert into schema_migrations(name, checksum) values ($1, $2) returning applied_at',
        [name, checksum],
      );
      const appliedAt = inserted.rows[0]?.applied_at;
      if (!appliedAt) throw new Error(`Migration record was not returned: ${name}`);
      applied.push({ name, checksum, appliedAt });
    }
    await client.query('commit');
    return applied;
  } catch (error: unknown) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
