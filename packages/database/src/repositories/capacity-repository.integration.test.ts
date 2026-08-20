import { createHash, randomUUID } from 'node:crypto';

import { parseEntityId, toUtcInstant, type ActorContext, type Capacity } from '@bidly/domain';
import { sql } from 'kysely';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createDatabase, type BidlyDatabase } from '../kysely.js';
import { migrateToLatest } from '../migrator.js';

import { PostgresCapacityRepository } from './capacity-repository.js';
import { PostgresOfferAcceptanceRepository } from './offer-acceptance-repository.js';

const connectionString = process.env['TEST_DATABASE_URL'];

interface Fixture {
  readonly actor: ActorContext;
  readonly buyerId: ReturnType<typeof parseEntityId<'User'>>;
  readonly offerId: ReturnType<typeof parseEntityId<'Offer'>>;
  readonly unitId: ReturnType<typeof parseEntityId<'CapacityUnit'>>;
}

describe.runIf(Boolean(connectionString))(
  'PostgresCapacityRepository',
  { concurrent: false },
  () => {
    let database!: BidlyDatabase;
    let fixture: Fixture;

    beforeAll(async () => {
      if (!connectionString) throw new Error('TEST_DATABASE_URL is required');
      await migrateToLatest(connectionString);
      const pool = new Pool({ connectionString, max: 1 });
      const client = await pool.connect();
      try {
        const seeded = await client.query<{
          actor_id: string;
          buyer_id: string;
          offer_id: string;
          unit_id: string;
        }>(
          `
        with actor as (
          insert into users(status) values ('ACTIVE') returning id
        ), buyer as (
          insert into users(status) values ('ACTIVE') returning id
        ), country as (
          insert into countries(iso_code, name) values ('RU', 'Россия')
          on conflict (iso_code) do update set name = excluded.name returning id
        ), region as (
          insert into regions(country_id, code, name)
          select id, $1, 'DEV TEST REGION' from country returning id
        ), city as (
          insert into cities(region_id, name, timezone)
          select id, 'DEV TEST CITY', 'UTC' from region returning id
        ), category as (
          insert into categories(slug, name, status) values ($2, 'DEV TEST CATEGORY', 'ACTIVE') returning id
        ), category_version as (
          insert into category_versions(
            category_id, version, market_type, capacity_measure, multi_winner,
            requires_coverage, requires_appointment_slot, requires_sku,
            buyer_schema, offer_schema, comparison_fields, active_from
          ) select id, 1, 'CAPACITY', 'APPOINTMENT_SLOT', true, false, true, false,
            '{}'::jsonb, '{}'::jsonb, array['totalCost'], now() from category returning id
        ), demand_pool as (
          insert into demand_pools(category_version_id, status) select id, 'LOCKED' from category_version returning id, category_version_id
        ), demand_pool_version as (
          insert into demand_pool_versions(demand_pool_id, version, criteria, purchase_window_start, purchase_window_end)
          select id, 1, '{}'::jsonb, now(), now() + interval '30 days' from demand_pool returning id
        ), demand as (
          insert into buyer_demands(buyer_id, category_version_id, city_id, intent_level, status, attributes, purchase_window_end)
          select buyer.id, category_version.id, city.id, 'COMMITTED', 'VERIFIED', '{}'::jsonb, now() + interval '30 days'
          from buyer, category_version, city returning id, buyer_id
        ), policy as (
          insert into allocation_policies(category_version_id, current_version) select id, 1 from category_version returning id
        ), policy_version as (
          insert into allocation_policy_versions(allocation_policy_id, version, weights, minimum_score)
          select id, 1, '{"price":1}'::jsonb, 0 from policy returning id
        ), rules as (
          insert into auction_rule_versions(version, rules) values (1, '{}'::jsonb) returning id
        ), auction as (
          insert into auctions(demand_pool_version_id, category_version_id, rules_version_id, allocation_policy_version_id, mode, status)
          select demand_pool_version.id, category_version.id, rules.id, policy_version.id, 'MULTI_WINNER', 'USER_ACCEPTANCE'
          from demand_pool_version, category_version, rules, policy_version returning id
        ), organization as (
          insert into supplier_organizations(legal_name, display_name, inn, ogrn_or_ogrnip, legal_status, verification_status, moderation_status)
          values ('DEV TEST SUPPLIER', 'DEV TEST SUPPLIER', $3, $4, 'LEGAL_ENTITY', 'VERIFIED', 'APPROVED') returning id
        ), bid as (
          insert into bids(auction_id, organization_id, status) select auction.id, organization.id, 'LOCKED' from auction, organization returning id, organization_id
        ), bid_version as (
          insert into bid_versions(
            bid_id, version, headline_minor, headline_cadence, pricing_complete, currency, comparison_months, total_cost_minor,
            effective_minor, capacity_quantity, fulfillment_start, fulfillment_end,
            category_attributes, locked_at, created_by
          ) select bid.id, 1, 10000, 'ONE_TIME', true, 'RUB', 1, 10000, 10000, 1,
            now(), now() + interval '30 days', '{}'::jsonb, now(), actor.id from bid, actor returning id
        ), capacity_pool as (
          insert into capacity_pools(bid_version_id, organization_id, total_quantity)
          select bid_version.id, bid.organization_id, 1 from bid_version, bid returning id
        ), unit as (
          insert into capacity_units(capacity_pool_id, kind, total_quantity)
          select id, 'APPOINTMENT_SLOT', 1 from capacity_pool returning id
        ), allocation_run as (
          insert into allocation_runs(auction_id, allocation_policy_version_id, status, completed_at)
          select auction.id, policy_version.id, 'COMPLETED', now() from auction, policy_version returning id
        ), candidate as (
          insert into allocation_candidates(allocation_run_id, buyer_demand_id, bid_version_id, capacity_unit_id, score, rank, explanation, eligible)
          select allocation_run.id, demand.id, bid_version.id, unit.id, 8000, 1, '{}'::jsonb, true
          from allocation_run, demand, bid_version, unit returning id, buyer_demand_id
        ), offer as (
          insert into offers(buyer_demand_id, buyer_id, allocation_candidate_id, status, expires_at)
          select candidate.buyer_demand_id, demand.buyer_id, candidate.id, 'AVAILABLE', now() + interval '1 hour'
          from candidate, demand returning id
        ), offer_version as (
          insert into offer_versions(
            offer_id, version, supplier_organization_id, bid_version_id, category_version_id,
            allocation_policy_version_id, capacity_unit_id, headline_minor, total_cost_minor,
            currency, comparison_months, snapshot
          )
          select offer.id, 1, organization.id, bid_version.id, category_version.id,
            policy_version.id, unit.id, 10000, 10000, 'RUB', 1, '{}'::jsonb
          from offer, organization, bid_version, category_version, policy_version, unit
          returning id
        ), capacity_allocation as (
          insert into capacity_allocations(capacity_unit_id, allocation_candidate_id, quantity)
          select unit.id, candidate.id, 1 from unit, candidate returning id
        )
        select actor.id actor_id, demand.buyer_id, offer.id offer_id, unit.id unit_id
        from actor, demand, offer, unit, offer_version, capacity_allocation
      `,
          [
            randomUUID(),
            `dev-test-${randomUUID()}`,
            `9${Date.now().toString().slice(-9)}`,
            `9${Date.now().toString().slice(-12)}`,
          ],
        );
        const row = seeded.rows[0];
        if (!row) throw new Error('Failed to create capacity integration fixture');
        const actorId = parseEntityId<'User'>(row.actor_id);
        fixture = {
          actor: {
            userId: actorId,
            sessionId: parseEntityId<'UserSession'>(randomUUID()),
            requestId: `integration-${randomUUID()}`,
            roles: new Set(['BUYER']),
          },
          buyerId: parseEntityId<'User'>(row.buyer_id),
          offerId: parseEntityId<'Offer'>(row.offer_id),
          unitId: parseEntityId<'CapacityUnit'>(row.unit_id),
        };
      } finally {
        client.release();
        await pool.end();
      }
      database = createDatabase({
        connectionString,
        applicationName: 'bidly-capacity-integration',
        maxConnections: 5,
      });
    });

    afterAll(async () => {
      await database.destroy();
    });

    function command(key: string): Capacity.ReserveCapacityCommand {
      const requestedAt = toUtcInstant(new Date());
      return {
        unitId: fixture.unitId,
        offerId: fixture.offerId,
        buyerId: fixture.buyerId,
        quantity: 1n,
        expiresAt: toUtcInstant(new Date(Date.parse(requestedAt) + 600_000)),
        metadata: {
          actor: fixture.actor,
          idempotencyKey: key,
          payloadHash: createHash('sha256').update(`${fixture.offerId}:1`).digest('hex'),
          requestedAt,
        },
      };
    }

    it('never oversells the last unit and safely replays the winning command', async () => {
      const repository = new PostgresCapacityRepository(database);
      const attempts = await Promise.allSettled([
        repository.reserveAtomically(command(`race-a-${randomUUID()}`)),
        repository.reserveAtomically(command(`race-b-${randomUUID()}`)),
      ]);
      const fulfilled = attempts.filter(
        (attempt): attempt is PromiseFulfilledResult<Capacity.CapacityReservation> =>
          attempt.status === 'fulfilled',
      );
      const rejected = attempts.filter((attempt) => attempt.status === 'rejected');
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      const winner = fulfilled[0]?.value;
      expect(winner).toBeDefined();
      if (!winner) return;

      const stored = await database
        .selectFrom('capacity_reservations')
        .selectAll()
        .where('id', '=', winner.id)
        .executeTakeFirstOrThrow();
      const replay = await repository.reserveAtomically(command(stored.idempotency_key));
      expect(replay.id).toBe(winner.id);
      await expect(
        repository.reserveAtomically({
          ...command(stored.idempotency_key),
          metadata: {
            ...command(stored.idempotency_key).metadata,
            payloadHash: createHash('sha256').update('different-payload').digest('hex'),
          },
        }),
      ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
      const reservedUnit = await repository.findUnit(fixture.unitId);
      expect(reservedUnit?.reservedQuantity).toBe(1n);
      expect(reservedUnit?.consumedQuantity).toBe(0n);

      await database
        .updateTable('capacity_reservations')
        .set({ expires_at: new Date(0) })
        .where('capacity_unit_id', '=', fixture.unitId)
        .execute();
      const releaseMetadata = command(`ttl-${randomUUID()}`).metadata;
      expect(await repository.releaseExpired(toUtcInstant(new Date()), 10, releaseMetadata)).toBe(
        1,
      );
      expect(await repository.releaseExpired(toUtcInstant(new Date()), 10, releaseMetadata)).toBe(
        0,
      );
      const releasedUnit = await repository.findUnit(fixture.unitId);
      expect(releasedUnit?.reservedQuantity).toBe(0n);
      const [audit, outbox] = await Promise.all([
        database
          .selectFrom('audit_events')
          .select(({ fn }) => fn.countAll<number>().as('count'))
          .where('resource_type', '=', 'CapacityReservation')
          .where('action', '=', 'CAPACITY_CHANGED')
          .executeTakeFirstOrThrow(),
        database
          .selectFrom('outbox_events')
          .select(({ fn }) => fn.countAll<number>().as('count'))
          .where('aggregate_type', '=', 'CapacityReservation')
          .executeTakeFirstOrThrow(),
      ]);
      expect(audit.count).toBeGreaterThanOrEqual(2);
      expect(outbox.count).toBeGreaterThanOrEqual(2);
    });

    it('accepts an allocated offer atomically and rejects a changed replay payload', async () => {
      const repository = new PostgresOfferAcceptanceRepository(database);
      const actor: ActorContext = {
        ...fixture.actor,
        userId: fixture.buyerId,
        sessionId: parseEntityId<'UserSession'>(randomUUID()),
      };
      const metadata = {
        actor,
        idempotencyKey: `accept-${randomUUID()}`,
        payloadHash: createHash('sha256').update(`${fixture.offerId}:1`).digest('hex'),
        requestedAt: toUtcInstant(new Date()),
      };
      await expect(
        repository.acceptAtomically(fixture.offerId, fixture.buyerId, 1, {
          ...metadata,
          actor: fixture.actor,
        }),
      ).rejects.toMatchObject({ code: 'AUTHORIZATION_DENIED' });
      const first = await repository.acceptAtomically(
        fixture.offerId,
        fixture.buyerId,
        1,
        metadata,
      );
      const replay = await repository.acceptAtomically(
        fixture.offerId,
        fixture.buyerId,
        1,
        metadata,
      );
      expect(first.offer.status).toBe('ACCEPTED');
      expect(replay.reservationId).toBe(first.reservationId);
      await expect(
        repository.acceptAtomically(fixture.offerId, fixture.buyerId, 1, {
          ...metadata,
          payloadHash: createHash('sha256').update('changed-offer-accept-payload').digest('hex'),
        }),
      ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });

      const [offer, unit, history, audit, outbox] = await Promise.all([
        sql<{
          readonly status: string;
        }>`select status from offers where id = ${fixture.offerId}`.execute(database),
        new PostgresCapacityRepository(database).findUnit(fixture.unitId),
        sql<{ readonly count: number }>`
          select count(*)::integer as count from offer_status_history
          where offer_id = ${fixture.offerId} and to_status = 'ACCEPTED'
        `.execute(database),
        sql<{ readonly count: number }>`
          select count(*)::integer as count from audit_events
          where resource_type = 'Offer' and resource_id = ${fixture.offerId} and action = 'OFFER_ACCEPTED'
        `.execute(database),
        sql<{ readonly count: number }>`
          select count(*)::integer as count from outbox_events
          where aggregate_type = 'Offer' and aggregate_id = ${fixture.offerId} and event_type = 'OfferAccepted'
        `.execute(database),
      ]);
      expect(offer.rows[0]?.status).toBe('ACCEPTED');
      expect(unit?.reservedQuantity).toBe(1n);
      expect(history.rows[0]?.count).toBe(1);
      expect(audit.rows[0]?.count).toBe(1);
      expect(outbox.rows[0]?.count).toBe(1);
    });

    it('rejects a second active booking for the same slot', async () => {
      const setup = await sql<{
        first_offer_id: string;
        first_reservation_id: string;
        second_offer_id: string;
        second_reservation_id: string;
        second_buyer_id: string;
        organization_id: string;
        slot_id: string;
      }>`
      with context as (
        select o.id first_offer_id, r.id first_reservation_id, ac.allocation_run_id,
          ac.bid_version_id, ac.capacity_unit_id, d.category_version_id, d.city_id,
          b.organization_id
        from offers o
        join capacity_reservations r on r.offer_id = o.id
        join allocation_candidates ac on ac.id = o.allocation_candidate_id
        join buyer_demands d on d.id = o.buyer_demand_id
        join bid_versions bv on bv.id = ac.bid_version_id
        join bids b on b.id = bv.bid_id
        where o.id = ${fixture.offerId}
        limit 1
      ), buyer_two as (
        insert into users(status) values ('ACTIVE') returning id
      ), demand_two as (
        insert into buyer_demands(
          buyer_id, category_version_id, city_id, intent_level, status,
          attributes, purchase_window_end
        )
        select buyer_two.id, context.category_version_id, context.city_id,
          'COMMITTED', 'VERIFIED', '{}'::jsonb, now() + interval '30 days'
        from buyer_two, context returning id, buyer_id
      ), candidate_two as (
        insert into allocation_candidates(
          allocation_run_id, buyer_demand_id, bid_version_id, capacity_unit_id,
          score, rank, explanation, eligible
        )
        select context.allocation_run_id, demand_two.id, context.bid_version_id,
          context.capacity_unit_id, 7900, 1, '{}'::jsonb, true
        from context, demand_two returning id, buyer_demand_id
      ), offer_two as (
        insert into offers(buyer_demand_id, buyer_id, allocation_candidate_id, status, expires_at)
        select candidate_two.buyer_demand_id, demand_two.buyer_id, candidate_two.id,
          'ACCEPTED', now() + interval '1 hour'
        from candidate_two, demand_two returning id, buyer_id
      ), reservation_two as (
        insert into capacity_reservations(
          capacity_unit_id, offer_id, buyer_id, quantity, status, idempotency_key
        )
        select context.capacity_unit_id, offer_two.id, offer_two.buyer_id, 1,
          'EXPIRED', ${`booking-test-${randomUUID()}`}
        from context, offer_two returning id
      ), branch_address as (
        insert into addresses(city_id, normalized_address)
        select context.city_id, 'DEV ONLY: integration test address'
        from context returning id
      ), branch as (
        insert into supplier_branches(organization_id, address_id, display_name, timezone)
        select context.organization_id, branch_address.id, 'DEV TEST BRANCH', 'UTC'
        from context, branch_address returning id
      ), slot as (
        insert into booking_slots(capacity_unit_id, branch_id, starts_at, ends_at)
        select context.capacity_unit_id, branch.id, now() + interval '1 day',
          now() + interval '1 day 1 hour'
        from context, branch returning id
      )
      select context.first_offer_id, context.first_reservation_id,
        offer_two.id second_offer_id, reservation_two.id second_reservation_id,
        offer_two.buyer_id second_buyer_id, context.organization_id, slot.id slot_id
      from context, offer_two, reservation_two, slot
    `.execute(database);
      const row = setup.rows[0];
      if (!row) throw new Error('Failed to create booking uniqueness fixture');
      await sql`
      insert into bookings(offer_id, buyer_id, organization_id, slot_id, reservation_id, status)
      values (${row.first_offer_id}, ${fixture.buyerId}, ${row.organization_id},
        ${row.slot_id}, ${row.first_reservation_id}, 'CONFIRMED')
    `.execute(database);
      const duplicate = sql`
      insert into bookings(offer_id, buyer_id, organization_id, slot_id, reservation_id, status)
      values (${row.second_offer_id}, ${row.second_buyer_id}, ${row.organization_id},
        ${row.slot_id}, ${row.second_reservation_id}, 'CONFIRMED')
    `.execute(database);
      await expect(duplicate).rejects.toMatchObject({ code: '23505' });
    });
  },
);
