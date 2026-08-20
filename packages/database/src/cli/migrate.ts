import { migrateToLatest } from '../migrator.js';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) throw new Error('DATABASE_URL is required');

const applied = await migrateToLatest(connectionString);
process.stdout.write(
  applied.length === 0
    ? 'Database is up to date.\n'
    : `Applied ${String(applied.length)} migration(s).\n`,
);
