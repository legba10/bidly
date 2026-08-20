import type { ColumnType, Generated } from 'kysely';

export type Timestamp = ColumnType<Date, Date | string, Date | string>;
export type NullableTimestamp = ColumnType<Date | null, Date | string | null, Date | string | null>;
export type GeneratedTimestamp = ColumnType<Date, Date | string | undefined, Date | string>;
export type JsonObject = Readonly<Record<string, unknown>>;

export interface UsersTable {
  id: Generated<string>;
  status: string;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface CapacityUnitsTable {
  id: Generated<string>;
  capacity_pool_id: string;
  kind: string;
  starts_at: NullableTimestamp;
  ends_at: NullableTimestamp;
  total_quantity: bigint;
  reserved_quantity: Generated<bigint>;
  consumed_quantity: Generated<bigint>;
  version: Generated<number>;
  active: Generated<boolean>;
}

export interface CapacityReservationsTable {
  id: Generated<string>;
  capacity_unit_id: string;
  offer_id: string;
  buyer_id: string;
  quantity: bigint;
  status: string;
  expires_at: NullableTimestamp;
  idempotency_key: string;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface CapacityReleasesTable {
  id: Generated<string>;
  reservation_id: string;
  quantity: bigint;
  reason: string;
  released_at: GeneratedTimestamp;
}

export interface IdempotencyRecordsTable {
  id: Generated<string>;
  actor_id: string;
  operation: string;
  idempotency_key: string;
  payload_hash: string;
  status: string;
  response_code: string | null;
  response_resource_id: string | null;
  response_body: JsonObject | null;
  expires_at: Timestamp;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface AuditEventsTable {
  id: Generated<string>;
  action: string;
  actor_id: string;
  organization_id: string | null;
  resource_type: string;
  resource_id: string;
  request_id: string;
  reason: string | null;
  safe_changes: JsonObject;
  occurred_at: GeneratedTimestamp;
}

export interface OutboxEventsTable {
  id: Generated<string>;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  schema_version: Generated<number>;
  safe_payload: JsonObject;
  occurred_at: GeneratedTimestamp;
  available_at: GeneratedTimestamp;
  claimed_at: NullableTimestamp;
  completed_at: NullableTimestamp;
  attempts: Generated<number>;
  last_error_code: string | null;
}

export interface Database {
  users: UsersTable;
  capacity_units: CapacityUnitsTable;
  capacity_reservations: CapacityReservationsTable;
  capacity_releases: CapacityReleasesTable;
  idempotency_records: IdempotencyRecordsTable;
  audit_events: AuditEventsTable;
  outbox_events: OutboxEventsTable;
}
