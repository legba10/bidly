import { DomainError, parseEntityId, toUtcInstant } from '@bidly/domain';
import { sql } from 'kysely';

import type { BidlyDatabase } from '../kysely.js';
import type { CommandMetadata, EntityId, Offers } from '@bidly/domain';

const operation = 'offer.accept';

interface OfferRow {
  readonly id: string;
  readonly buyer_demand_id: string;
  readonly buyer_id: string;
  readonly allocation_candidate_id: string;
  readonly offer_version_id: string;
  readonly status: string;
  readonly current_version: number;
  readonly expires_at: Date;
}

interface LockedOfferRow extends OfferRow {
  readonly capacity_unit_id: string;
  readonly allocated_quantity: bigint;
  readonly unit_active: boolean;
  readonly total_quantity: bigint;
  readonly reserved_quantity: bigint;
  readonly consumed_quantity: bigint;
  readonly supplier_organization_id: string;
  readonly database_now: Date;
}

function toOffer(row: OfferRow): Offers.Offer {
  return {
    id: parseEntityId<'Offer'>(row.id),
    buyerDemandId: parseEntityId<'BuyerDemand'>(row.buyer_demand_id),
    buyerId: parseEntityId<'User'>(row.buyer_id),
    allocationCandidateId: parseEntityId<'AllocationCandidate'>(row.allocation_candidate_id),
    currentVersionId: parseEntityId<'OfferVersion'>(row.offer_version_id),
    status: row.status as Offers.OfferStatus,
    expiresAt: toUtcInstant(row.expires_at),
    version: row.current_version,
  };
}

function offerByOwner(offerId: string, buyerId: string) {
  return sql<OfferRow>`
    select
      o.id,
      o.buyer_demand_id,
      o.buyer_id,
      o.allocation_candidate_id,
      ov.id as offer_version_id,
      o.status,
      o.current_version,
      o.expires_at
    from offers o
    join offer_versions ov on ov.offer_id = o.id and ov.version = o.current_version
    where o.id = ${offerId} and o.buyer_id = ${buyerId}
  `;
}

/**
 * PostgreSQL implementation of the buyer's accept-offer boundary.
 *
 * The offer, its capacity unit and the actor-bound idempotency record are locked
 * in one transaction. A successful acceptance is therefore both replay-safe and
 * unable to reserve more capacity than the concrete allocation allows.
 */
export class PostgresOfferAcceptanceRepository implements Offers.OfferAcceptanceRepository {
  constructor(private readonly database: BidlyDatabase) {}

  async findOwned(
    offerId: Offers.Offer['id'],
    buyerId: Offers.Offer['buyerId'],
  ): Promise<Offers.Offer | undefined> {
    const result = await offerByOwner(offerId, buyerId).execute(this.database);
    const row = result.rows[0];
    return row ? toOffer(row) : undefined;
  }

  async acceptAtomically(
    offerId: Offers.Offer['id'],
    buyerId: Offers.Offer['buyerId'],
    expectedVersion: number,
    metadata: CommandMetadata,
  ): Promise<{
    readonly offer: Offers.Offer;
    readonly reservationId: EntityId<'CapacityReservation'>;
  }> {
    if (metadata.actor.userId !== buyerId) {
      throw new DomainError('AUTHORIZATION_DENIED', 'Offer is not available');
    }
    return this.database.transaction().execute(async (transaction) => {
      await sql`
        insert into idempotency_records(
          actor_id, operation, idempotency_key, payload_hash, status, expires_at
        ) values (
          ${buyerId}, ${operation}, ${metadata.idempotencyKey}, ${metadata.payloadHash},
          'PROCESSING', now() + interval '1 day'
        )
        on conflict (actor_id, operation, idempotency_key) do nothing
      `.execute(transaction);

      const idempotency = await sql<{
        readonly id: string;
        readonly payload_hash: string;
        readonly status: string;
        readonly response_resource_id: string | null;
      }>`
        select id, payload_hash, status, response_resource_id
        from idempotency_records
        where actor_id = ${buyerId}
          and operation = ${operation}
          and idempotency_key = ${metadata.idempotencyKey}
        for update
      `.execute(transaction);
      const idempotencyRow = idempotency.rows[0];
      if (!idempotencyRow) {
        throw new DomainError('VALIDATION_FAILED', 'Idempotency record was not created');
      }
      if (idempotencyRow.payload_hash !== metadata.payloadHash) {
        throw new DomainError(
          'IDEMPOTENCY_CONFLICT',
          'Idempotency key was used with another payload',
        );
      }
      if (idempotencyRow.status === 'SUCCEEDED' && idempotencyRow.response_resource_id) {
        const existing = await offerByOwner(offerId, buyerId).execute(transaction);
        const existingOffer = existing.rows[0];
        if (!existingOffer) {
          throw new DomainError('AUTHORIZATION_DENIED', 'Offer is not available');
        }
        return {
          offer: toOffer(existingOffer),
          reservationId: parseEntityId<'CapacityReservation'>(idempotencyRow.response_resource_id),
        };
      }

      const locked = await sql<LockedOfferRow>`
        select
          o.id,
          o.buyer_demand_id,
          o.buyer_id,
          o.allocation_candidate_id,
          ov.id as offer_version_id,
          o.status,
          o.current_version,
          o.expires_at,
          ov.capacity_unit_id,
          ca.quantity as allocated_quantity,
          cu.active as unit_active,
          cu.total_quantity,
          cu.reserved_quantity,
          cu.consumed_quantity,
          ov.supplier_organization_id,
          now() as database_now
        from offers o
        join offer_versions ov on ov.offer_id = o.id and ov.version = o.current_version
        join capacity_allocations ca on ca.allocation_candidate_id = o.allocation_candidate_id
        join capacity_units cu on cu.id = ov.capacity_unit_id and cu.id = ca.capacity_unit_id
        where o.id = ${offerId} and o.buyer_id = ${buyerId}
        for update of o, cu
      `.execute(transaction);
      const offer = locked.rows[0];
      if (!offer) {
        throw new DomainError('AUTHORIZATION_DENIED', 'Offer is not available');
      }
      if (offer.current_version !== expectedVersion) {
        throw new DomainError('INVALID_STATE_TRANSITION', 'Offer version is no longer current');
      }
      if (offer.status !== 'AVAILABLE' && offer.status !== 'VIEWED') {
        throw new DomainError(
          'INVALID_STATE_TRANSITION',
          'Offer cannot be accepted from its current state',
        );
      }
      if (offer.expires_at.getTime() <= offer.database_now.getTime()) {
        throw new DomainError('OFFER_EXPIRED', 'Offer has expired');
      }
      if (
        !offer.unit_active ||
        offer.allocated_quantity <= 0n ||
        offer.reserved_quantity + offer.consumed_quantity + offer.allocated_quantity >
          offer.total_quantity
      ) {
        throw new DomainError('CAPACITY_UNAVAILABLE', 'Requested capacity is unavailable');
      }

      const capacity = await sql<{ readonly id: string }>`
        update capacity_units
        set reserved_quantity = reserved_quantity + ${offer.allocated_quantity}, version = version + 1
        where id = ${offer.capacity_unit_id}
          and active = true
          and reserved_quantity + consumed_quantity + ${offer.allocated_quantity} <= total_quantity
        returning id
      `.execute(transaction);
      if (!capacity.rows[0]) {
        throw new DomainError('CAPACITY_UNAVAILABLE', 'Requested capacity is unavailable');
      }

      const reservationKey = `offer-accept:${metadata.idempotencyKey}`;
      const reservation = await sql<{ readonly id: string }>`
        insert into capacity_reservations(
          capacity_unit_id, offer_id, buyer_id, quantity, status, expires_at, idempotency_key
        ) values (
          ${offer.capacity_unit_id}, ${offer.id}, ${buyerId}, ${offer.allocated_quantity},
          'RESERVED', null, ${reservationKey}
        )
        returning id
      `.execute(transaction);
      const reservationId = reservation.rows[0]?.id;
      if (!reservationId) {
        throw new DomainError('VALIDATION_FAILED', 'Capacity reservation was not created');
      }

      const accepted = await sql<{ readonly id: string }>`
        update offers
        set status = 'ACCEPTED', accepted_at = now()
        where id = ${offer.id}
          and buyer_id = ${buyerId}
          and current_version = ${expectedVersion}
          and status in ('AVAILABLE', 'VIEWED')
        returning id
      `.execute(transaction);
      if (!accepted.rows[0]) {
        throw new DomainError(
          'INVALID_STATE_TRANSITION',
          'Offer cannot be accepted from its current state',
        );
      }

      await sql`
        insert into offer_status_history(offer_id, from_status, to_status, actor_id)
        values (${offer.id}, ${offer.status}, 'ACCEPTED', ${buyerId})
      `.execute(transaction);
      await sql`
        insert into audit_events(
          action, actor_id, organization_id, resource_type, resource_id, request_id, reason, safe_changes
        ) values (
          'OFFER_ACCEPTED', ${buyerId}, ${offer.supplier_organization_id}, 'Offer', ${offer.id},
          ${metadata.actor.requestId}, null,
          jsonb_build_object('fromStatus', ${offer.status}, 'toStatus', 'ACCEPTED', 'version', ${expectedVersion})
        )
      `.execute(transaction);
      await sql`
        insert into outbox_events(event_type, aggregate_type, aggregate_id, safe_payload)
        values (
          'OfferAccepted', 'Offer', ${offer.id},
          jsonb_build_object('offerId', ${offer.id}, 'reservationId', ${reservationId})
        )
      `.execute(transaction);
      await sql`
        update idempotency_records
        set status = 'SUCCEEDED',
            response_code = 'OFFER_ACCEPTED',
            response_resource_id = ${reservationId},
            response_body = jsonb_build_object('offerId', ${offer.id}, 'reservationId', ${reservationId}),
            updated_at = now()
        where id = ${idempotencyRow.id}
      `.execute(transaction);

      return {
        offer: toOffer({ ...offer, status: 'ACCEPTED' }),
        reservationId: parseEntityId<'CapacityReservation'>(reservationId),
      };
    });
  }

  async activateNextFallback(
    buyerDemandId: Offers.OfferFallbackChain['buyerDemandId'],
    unavailableOfferId: Offers.Offer['id'],
  ): Promise<Offers.Offer | undefined> {
    const next = await sql<OfferRow>`
      select
        o.id,
        o.buyer_demand_id,
        o.buyer_id,
        o.allocation_candidate_id,
        ov.id as offer_version_id,
        o.status,
        o.current_version,
        o.expires_at
      from offer_fallback_chain chain
      join offers o on o.id = chain.offer_id
      join offer_versions ov on ov.offer_id = o.id and ov.version = o.current_version
      where chain.buyer_demand_id = ${buyerDemandId}
        and chain.offer_id <> ${unavailableOfferId}
        and o.status = 'AVAILABLE'
        and o.expires_at > now()
      order by chain.ordinal
      limit 1
    `.execute(this.database);
    const row = next.rows[0];
    return row ? toOffer(row) : undefined;
  }
}
