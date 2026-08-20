import { Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';

import type { Database } from './schema.js';

export type BidlyDatabase = Kysely<Database>;

export interface DatabaseOptions {
  readonly connectionString: string;
  readonly maxConnections?: number;
  readonly applicationName?: string;
  readonly ssl?: boolean;
}

export function createDatabase({
  connectionString,
  maxConnections = 10,
  applicationName = 'bidly-api',
  ssl = false,
}: DatabaseOptions): BidlyDatabase {
  // PostgreSQL int8 must stay exact for money and capacity; the pg default is a string.
  types.setTypeParser(20, (value) => BigInt(value));
  const pool = new Pool({
    application_name: applicationName,
    connectionString,
    max: maxConnections,
    ssl: ssl ? { rejectUnauthorized: true } : undefined,
  });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}
