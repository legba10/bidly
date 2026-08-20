import type { EntityId, Money, OrganizationId, UtcInstant } from '../../shared/index.js';

export type BillingLedgerEntryType = 'CPA_ACCRUED' | 'CPA_REVERSED' | 'CPA_ADJUSTED';

export interface BillingAccount {
  readonly id: EntityId<'BillingAccount'>;
  readonly organizationId: OrganizationId;
  readonly currency: string;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export interface CpaRule {
  readonly id: EntityId<'CpaRule'>;
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly amount: Money;
  readonly validFrom: UtcInstant;
  readonly validUntil?: UtcInstant;
  readonly version: number;
}

export interface CpaEvent {
  readonly id: EntityId<'CpaEvent'>;
  readonly conversionId: EntityId<'Conversion'>;
  readonly ruleId: EntityId<'CpaRule'>;
  readonly amount: Money;
  readonly status: 'ELIGIBLE' | 'ACCRUED' | 'REVERSED';
}

export interface SupplierInvoiceRecord {
  readonly id: EntityId<'SupplierInvoiceRecord'>;
  readonly billingAccountId: EntityId<'BillingAccount'>;
  readonly periodStart: UtcInstant;
  readonly periodEnd: UtcInstant;
  readonly status: 'DRAFT' | 'ISSUED' | 'CANCELLED';
}

export interface BillingLedgerEntry {
  readonly id: EntityId<'BillingLedgerEntry'>;
  readonly billingAccountId: EntityId<'BillingAccount'>;
  readonly cpaEventId: EntityId<'CpaEvent'>;
  readonly type: BillingLedgerEntryType;
  readonly amount: Money;
  readonly occurredAt: UtcInstant;
  readonly reversesEntryId?: EntityId<'BillingLedgerEntry'>;
}

export interface BillingRepository {
  appendLedgerEntry(entry: BillingLedgerEntry): Promise<void>;
  findCpaEventForConversion(conversionId: EntityId<'Conversion'>): Promise<CpaEvent | undefined>;
}
