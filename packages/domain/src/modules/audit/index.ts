import { z } from 'zod';

import type { EntityId, OrganizationId, UtcInstant, UserId } from '../../shared/index.js';

export type AuditAction =
  | 'ROLE_CHANGED'
  | 'SUPPLIER_VERIFICATION_CHANGED'
  | 'BID_VERSION_CREATED'
  | 'BID_VALIDATED'
  | 'AUCTION_TRANSITIONED'
  | 'ALLOCATION_CREATED'
  | 'CAPACITY_CHANGED'
  | 'OFFER_ACCEPTED'
  | 'FULFILLMENT_CONFIRMED'
  | 'ADMIN_OVERRIDE';

export interface AuditEvent {
  readonly id: EntityId<'AuditEvent'>;
  readonly action: AuditAction;
  readonly actorId: UserId;
  readonly organizationId?: OrganizationId;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly requestId: string;
  readonly reason?: string;
  readonly safeChanges: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: UtcInstant;
}

export const auditEventSchema = z.object({
  action: z.enum([
    'ROLE_CHANGED',
    'SUPPLIER_VERIFICATION_CHANGED',
    'BID_VERSION_CREATED',
    'BID_VALIDATED',
    'AUCTION_TRANSITIONED',
    'ALLOCATION_CREATED',
    'CAPACITY_CHANGED',
    'OFFER_ACCEPTED',
    'FULFILLMENT_CONFIRMED',
    'ADMIN_OVERRIDE',
  ]),
  resourceType: z.string().min(1).max(80),
  resourceId: z.string().min(1).max(128),
  requestId: z.string().min(8).max(128),
  reason: z.string().min(3).max(1000).optional(),
});

export interface AuditRepository {
  append(event: AuditEvent): Promise<void>;
  listForResource(
    resourceType: string,
    resourceId: string,
    limit: number,
  ): Promise<readonly AuditEvent[]>;
}

export interface OutboxRepository {
  append(
    eventType: string,
    aggregateType: string,
    aggregateId: string,
    safePayload: Readonly<Record<string, unknown>>,
  ): Promise<void>;
}
