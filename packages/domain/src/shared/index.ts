import { z } from 'zod';

declare const idBrand: unique symbol;
declare const utcBrand: unique symbol;

export type EntityId<T extends string> = string & { readonly [idBrand]: T };
export type UtcInstant = string & { readonly [utcBrand]: 'UtcInstant' };

export const entityIdSchema = z.uuid();
export const utcInstantSchema = z.iso.datetime({ offset: true });
export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/u);
export const idempotencyKeySchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/u);

export function parseEntityId<T extends string>(value: string): EntityId<T> {
  return entityIdSchema.parse(value) as EntityId<T>;
}

export function toUtcInstant(value: Date | string): UtcInstant {
  const parsed = value instanceof Date ? value.toISOString() : utcInstantSchema.parse(value);
  return parsed as UtcInstant;
}

export interface Clock {
  now(): UtcInstant;
}

export interface IdGenerator {
  next<T extends string>(): EntityId<T>;
}

export class SystemClock implements Clock {
  now(): UtcInstant {
    return toUtcInstant(new Date());
  }
}

export interface Money {
  readonly minorUnits: bigint;
  readonly currency: string;
}

export function money(minorUnits: bigint, currency: string): Money {
  return { minorUnits, currency: currencyCodeSchema.parse(currency) };
}

export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) {
    throw new DomainError('CURRENCY_MISMATCH', 'Money currencies must match');
  }
  return money(left.minorUnits + right.minorUnits, left.currency);
}

export type DomainErrorCode =
  | 'AUTHORIZATION_DENIED'
  | 'CAPACITY_UNAVAILABLE'
  | 'CURRENCY_MISMATCH'
  | 'IDEMPOTENCY_CONFLICT'
  | 'INVALID_STATE_TRANSITION'
  | 'OFFER_EXPIRED'
  | 'VALIDATION_FAILED';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export type PlatformRole =
  | 'BUYER'
  | 'SUPPLIER_MEMBER'
  | 'SUPPLIER_ADMIN'
  | 'BIDLY_SUPPORT'
  | 'BIDLY_MODERATOR'
  | 'BIDLY_ADMIN';

export type UserId = EntityId<'User'>;
export type OrganizationId = EntityId<'SupplierOrganization'>;

export interface ActorContext {
  readonly userId: UserId;
  readonly roles: ReadonlySet<PlatformRole>;
  readonly activeOrganizationId?: OrganizationId;
  readonly supplierRoles?: ReadonlySet<'MEMBER' | 'BID_MANAGER' | 'FULFILLMENT' | 'ADMIN'>;
  readonly sessionId: EntityId<'UserSession'>;
  readonly requestId: string;
}

export interface CommandMetadata {
  readonly actor: ActorContext;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly requestedAt: UtcInstant;
}

export interface PageRequest {
  readonly limit: number;
  readonly cursor?: string;
}

export const pageRequestSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).max(512).optional(),
});

export interface DomainEvent<TPayload extends Readonly<Record<string, unknown>>> {
  readonly eventId: EntityId<'DomainEvent'>;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: UtcInstant;
  readonly payload: TPayload;
  readonly schemaVersion: number;
}
