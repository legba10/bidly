import { DomainError, parseEntityId, toUtcInstant } from '@bidly/domain';
import { sql } from 'kysely';

import type { BidlyDatabase } from '../kysely.js';
import type { Capacity } from '@bidly/domain';

const operation = 'capacity.reserve';

function toReservation(row: {
  id: string;
  capacity_unit_id: string;
  offer_id: string;
  buyer_id: string;
  quantity: bigint;
  status: string;
  expires_at: Date | null;
  created_at: Date;
}): Capacity.CapacityReservation {
  return {
    id: parseEntityId<'CapacityReservation'>(row.id),
    unitId: parseEntityId<'CapacityUnit'>(row.capacity_unit_id),
    offerId: parseEntityId<'Offer'>(row.offer_id),
    buyerId: parseEntityId<'User'>(row.buyer_id),
    quantity: row.quantity,
    status: row.status as Capacity.CapacityReservationStatus,
    ...(row.expires_at ? { expiresAt: toUtcInstant(row.expires_at) } : {}),
    createdAt: toUtcInstant(row.created_at),
  };
}

export class PostgresCapacityRepository implements Capacity.CapacityRepository {
  constructor(private readonly database: BidlyDatabase) {}

  async reserveAtomically(
    command: Capacity.ReserveCapacityCommand,
  ): Promise<Capacity.CapacityReservation> {
    return this.database.transaction().execute(async (transaction) => {
      await transaction
        .insertInto('idempotency_records')
        .values({
          actor_id: command.metadata.actor.userId,
          operation,
          idempotency_key: command.metadata.idempotencyKey,
          payload_hash: command.metadata.payloadHash,
          status: 'PROCESSING',
          expires_at: new Date(Date.parse(command.metadata.requestedAt) + 86_400_000),
          response_code: null,
          response_resource_id: null,
          response_body: null,
        })
        .onConflict((conflict) =>
          conflict.columns(['actor_id', 'operation', 'idempotency_key']).doNothing(),
        )
        .execute();

      const idempotency = await transaction
        .selectFrom('idempotency_records')
        .selectAll()
        .where('actor_id', '=', command.metadata.actor.userId)
        .where('operation', '=', operation)
        .where('idempotency_key', '=', command.metadata.idempotencyKey)
        .forUpdate()
        .executeTakeFirstOrThrow();

      if (idempotency.payload_hash !== command.metadata.payloadHash) {
        throw new DomainError(
          'IDEMPOTENCY_CONFLICT',
          'Idempotency key was used with another payload',
        );
      }
      if (idempotency.status === 'SUCCEEDED' && idempotency.response_resource_id) {
        const existing = await transaction
          .selectFrom('capacity_reservations')
          .selectAll()
          .where('id', '=', idempotency.response_resource_id)
          .executeTakeFirstOrThrow();
        return toReservation(existing);
      }

      const unit = await transaction
        .selectFrom('capacity_units')
        .selectAll()
        .where('id', '=', command.unitId)
        .where('active', '=', true)
        .forUpdate()
        .executeTakeFirst();
      if (
        !unit ||
        unit.total_quantity - unit.reserved_quantity - unit.consumed_quantity < command.quantity
      ) {
        throw new DomainError('CAPACITY_UNAVAILABLE', 'Requested capacity is unavailable');
      }

      const updated = await transaction
        .updateTable('capacity_units')
        .set({
          reserved_quantity: sql`reserved_quantity + ${command.quantity}`,
          version: sql`version + 1`,
        })
        .where('id', '=', command.unitId)
        .where(
          sql<boolean>`reserved_quantity + consumed_quantity + ${command.quantity} <= total_quantity`,
        )
        .returning('id')
        .executeTakeFirst();
      if (!updated)
        throw new DomainError('CAPACITY_UNAVAILABLE', 'Requested capacity is unavailable');

      const reservation = await transaction
        .insertInto('capacity_reservations')
        .values({
          capacity_unit_id: command.unitId,
          offer_id: command.offerId,
          buyer_id: command.buyerId,
          quantity: command.quantity,
          status: 'SOFT_RESERVED',
          expires_at: new Date(command.expiresAt),
          idempotency_key: command.metadata.idempotencyKey,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await transaction
        .insertInto('audit_events')
        .values({
          action: 'CAPACITY_CHANGED',
          actor_id: command.metadata.actor.userId,
          organization_id: command.metadata.actor.activeOrganizationId ?? null,
          resource_type: 'CapacityReservation',
          resource_id: reservation.id,
          request_id: command.metadata.actor.requestId,
          reason: null,
          safe_changes: { status: 'SOFT_RESERVED', quantity: command.quantity.toString() },
        })
        .execute();
      await transaction
        .insertInto('outbox_events')
        .values({
          event_type: 'CapacitySoftReserved',
          aggregate_type: 'CapacityReservation',
          aggregate_id: reservation.id,
          safe_payload: { reservationId: reservation.id, unitId: command.unitId },
          claimed_at: null,
          completed_at: null,
          last_error_code: null,
        })
        .execute();
      await transaction
        .updateTable('idempotency_records')
        .set({
          status: 'SUCCEEDED',
          response_code: 'CAPACITY_SOFT_RESERVED',
          response_resource_id: reservation.id,
          response_body: { reservationId: reservation.id },
          updated_at: new Date(),
        })
        .where('id', '=', idempotency.id)
        .execute();
      return toReservation(reservation);
    });
  }

  async confirmReservation(
    id: Capacity.CapacityReservation['id'],
    metadata: Capacity.ReserveCapacityCommand['metadata'],
  ): Promise<Capacity.CapacityReservation> {
    return this.database.transaction().execute(async (transaction) => {
      const existing = await transaction
        .selectFrom('capacity_reservations')
        .selectAll()
        .where('id', '=', id)
        .forUpdate()
        .executeTakeFirstOrThrow();
      if (existing.status === 'RESERVED') return toReservation(existing);
      if (existing.status !== 'SOFT_RESERVED') {
        throw new DomainError('INVALID_STATE_TRANSITION', 'Reservation cannot be confirmed');
      }
      const updated = await transaction
        .updateTable('capacity_reservations')
        .set({ status: 'RESERVED', expires_at: null, updated_at: new Date() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();
      await transaction
        .insertInto('audit_events')
        .values({
          action: 'CAPACITY_CHANGED',
          actor_id: metadata.actor.userId,
          organization_id: metadata.actor.activeOrganizationId ?? null,
          resource_type: 'CapacityReservation',
          resource_id: updated.id,
          request_id: metadata.actor.requestId,
          reason: null,
          safe_changes: { status: 'RESERVED' },
        })
        .execute();
      await transaction
        .insertInto('outbox_events')
        .values({
          event_type: 'CapacityReservationConfirmed',
          aggregate_type: 'CapacityReservation',
          aggregate_id: updated.id,
          safe_payload: { reservationId: updated.id },
          claimed_at: null,
          completed_at: null,
          last_error_code: null,
        })
        .execute();
      return toReservation(updated);
    });
  }

  async consumeReservation(
    id: Capacity.CapacityReservation['id'],
    metadata: Capacity.ReserveCapacityCommand['metadata'],
  ): Promise<Capacity.CapacityReservation> {
    return this.database.transaction().execute(async (transaction) => {
      const reservation = await transaction
        .selectFrom('capacity_reservations')
        .selectAll()
        .where('id', '=', id)
        .forUpdate()
        .executeTakeFirstOrThrow();
      if (reservation.status === 'CONSUMED') return toReservation(reservation);
      if (reservation.status !== 'RESERVED') {
        throw new DomainError('INVALID_STATE_TRANSITION', 'Reservation is not confirmed');
      }
      await transaction
        .updateTable('capacity_units')
        .set({
          reserved_quantity: sql`reserved_quantity - ${reservation.quantity}`,
          consumed_quantity: sql`consumed_quantity + ${reservation.quantity}`,
          version: sql`version + 1`,
        })
        .where('id', '=', reservation.capacity_unit_id)
        .executeTakeFirstOrThrow();
      const updated = await transaction
        .updateTable('capacity_reservations')
        .set({ status: 'CONSUMED', updated_at: new Date() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();
      await transaction
        .insertInto('audit_events')
        .values({
          action: 'CAPACITY_CHANGED',
          actor_id: metadata.actor.userId,
          organization_id: metadata.actor.activeOrganizationId ?? null,
          resource_type: 'CapacityReservation',
          resource_id: updated.id,
          request_id: metadata.actor.requestId,
          reason: null,
          safe_changes: { status: 'CONSUMED' },
        })
        .execute();
      await transaction
        .insertInto('outbox_events')
        .values({
          event_type: 'CapacityReservationConsumed',
          aggregate_type: 'CapacityReservation',
          aggregate_id: updated.id,
          safe_payload: { reservationId: updated.id },
          claimed_at: null,
          completed_at: null,
          last_error_code: null,
        })
        .execute();
      return toReservation(updated);
    });
  }

  async releaseExpired(
    now: Capacity.CapacityReservation['createdAt'],
    batchSize: number,
    metadata: Capacity.ReserveCapacityCommand['metadata'],
  ): Promise<number> {
    const result = await sql<{ released_count: number }>`
      with expired as (
        select id, capacity_unit_id, quantity
        from capacity_reservations
        where status = 'SOFT_RESERVED' and expires_at <= ${new Date(now)}
        order by expires_at, id
        for update skip locked
        limit ${batchSize}
      ), updated_reservations as (
        update capacity_reservations r
        set status = 'EXPIRED', updated_at = now()
        from expired e where r.id = e.id
        returning r.id, r.capacity_unit_id, r.quantity
      ), released_units as (
        update capacity_units u
        set reserved_quantity = u.reserved_quantity - totals.quantity, version = u.version + 1
        from (select capacity_unit_id, sum(quantity)::bigint quantity from updated_reservations group by capacity_unit_id) totals
        where u.id = totals.capacity_unit_id
        returning u.id
      )
      , releases as (
        insert into capacity_releases(reservation_id, quantity, reason)
        select id, quantity, 'TTL_EXPIRED' from updated_reservations
        returning reservation_id, quantity
      ), audit_rows as (
        insert into audit_events(
          action, actor_id, organization_id, resource_type, resource_id,
          request_id, reason, safe_changes
        )
        select 'CAPACITY_CHANGED', ${metadata.actor.userId},
          ${metadata.actor.activeOrganizationId ?? null}, 'CapacityReservation',
          reservation_id::text, ${metadata.actor.requestId}, 'TTL_EXPIRED',
          jsonb_build_object('status', 'EXPIRED', 'quantity', quantity::text)
        from releases
        returning id
      ), outbox_rows as (
        insert into outbox_events(event_type, aggregate_type, aggregate_id, safe_payload)
        select 'CapacityReservationExpired', 'CapacityReservation', reservation_id::text,
          jsonb_build_object('reservationId', reservation_id)
        from releases
        returning id
      )
      select count(*)::integer as released_count from releases
    `.execute(this.database);
    return result.rows[0]?.released_count ?? 0;
  }

  async findUnit(id: Capacity.CapacityUnit['id']): Promise<Capacity.CapacityUnit | undefined> {
    const row = await this.database
      .selectFrom('capacity_units')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    if (!row) return undefined;
    return {
      id: parseEntityId<'CapacityUnit'>(row.id),
      poolId: parseEntityId<'CapacityPool'>(row.capacity_pool_id),
      kind: row.kind as Capacity.CapacityUnitKind,
      ...(row.starts_at ? { startsAt: toUtcInstant(row.starts_at) } : {}),
      ...(row.ends_at ? { endsAt: toUtcInstant(row.ends_at) } : {}),
      totalQuantity: row.total_quantity,
      reservedQuantity: row.reserved_quantity,
      consumedQuantity: row.consumed_quantity,
      version: row.version,
    };
  }
}
