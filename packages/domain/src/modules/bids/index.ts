import { z } from 'zod';

import type { EntityId, Money, OrganizationId, UtcInstant } from '../../shared/index.js';

import { addMoney, DomainError, money } from '../../shared/index.js';

export type BidStatus =
  'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'LOCKED';
export type FeeCadence = 'ONE_TIME' | 'MONTHLY';

export interface Bid {
  readonly id: EntityId<'Bid'>;
  readonly auctionId: EntityId<'Auction'>;
  readonly organizationId: OrganizationId;
  readonly currentVersionId: EntityId<'BidVersion'>;
  readonly status: BidStatus;
}

export interface BidFee {
  readonly code: string;
  readonly amount: Money;
  readonly cadence: FeeCadence;
  readonly mandatory: boolean;
  readonly startsAtMonth?: number;
  readonly endsAfterMonth?: number;
}

export interface BidVersion {
  readonly id: EntityId<'BidVersion'>;
  readonly bidId: EntityId<'Bid'>;
  readonly version: number;
  readonly headlinePrice: Money;
  readonly headlineCadence: FeeCadence;
  readonly pricingComplete: boolean;
  readonly capacityQuantity: bigint;
  readonly fulfillmentStart: UtcInstant;
  readonly fulfillmentEnd: UtcInstant;
  readonly geographyIds: readonly EntityId<'CoverageArea'>[];
  readonly conditions: readonly string[];
  readonly inclusions: readonly string[];
  readonly exclusions: readonly string[];
  readonly fees: readonly BidFee[];
  readonly categoryAttributes: Readonly<Record<string, unknown>>;
  readonly lockedAt?: UtcInstant;
}

export interface BidRevision {
  readonly id: EntityId<'BidRevision'>;
  readonly bidId: EntityId<'Bid'>;
  readonly fromVersionId: EntityId<'BidVersion'>;
  readonly toVersionId: EntityId<'BidVersion'>;
  readonly reason: string;
  readonly createdAt: UtcInstant;
}

export interface BidCommitment {
  readonly bidVersionId: EntityId<'BidVersion'>;
  readonly validFrom: UtcInstant;
  readonly validUntil: UtcInstant;
  readonly maxCapacity: bigint;
  readonly cancellationPolicyReference: string;
  readonly slaReference: string;
}

export interface BidValidationIssue {
  readonly code: string;
  readonly field?: string;
  readonly severity: 'ERROR' | 'WARNING';
}

export interface BidValidationResult {
  readonly valid: boolean;
  readonly issues: readonly BidValidationIssue[];
}

export interface TotalCostResult {
  readonly headlinePrice: Money;
  readonly effectiveMonthlyPrice: Money;
  readonly totalCost: Money;
  readonly comparisonMonths: number;
  readonly components: readonly { readonly code: string; readonly amount: Money }[];
}

export const bidSubmissionSchema = z.object({
  auctionId: z.uuid(),
  organizationId: z.uuid(),
  headlineMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  headlineCadence: z.enum(['ONE_TIME', 'MONTHLY']),
  pricingComplete: z.literal(true),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/u)
    .default('RUB'),
  capacityQuantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  fulfillmentStart: z.iso.datetime({ offset: true }),
  fulfillmentEnd: z.iso.datetime({ offset: true }),
  geographyIds: z.array(z.uuid()).min(1).max(10_000),
  categoryAttributes: z.record(z.string(), z.unknown()),
});

export class TotalCostCalculator {
  calculate(
    headlinePrice: Money,
    headlineCadence: FeeCadence,
    fees: readonly BidFee[],
    comparisonMonths: number,
  ): TotalCostResult {
    if (!Number.isInteger(comparisonMonths) || comparisonMonths <= 0 || comparisonMonths > 120) {
      throw new DomainError('VALIDATION_FAILED', 'Comparison period must be from 1 to 120 months');
    }
    const headlineOccurrences = headlineCadence === 'MONTHLY' ? comparisonMonths : 1;
    const headlineTotal = money(
      headlinePrice.minorUnits * BigInt(headlineOccurrences),
      headlinePrice.currency,
    );
    let total = headlineTotal;
    const components: { code: string; amount: Money }[] = [
      { code: 'headline', amount: headlineTotal },
    ];
    for (const fee of fees.filter((item) => item.mandatory)) {
      const firstMonth = fee.startsAtMonth ?? 1;
      const lastMonth = Math.min(fee.endsAfterMonth ?? comparisonMonths, comparisonMonths);
      const occurrences = fee.cadence === 'ONE_TIME' ? 1 : Math.max(0, lastMonth - firstMonth + 1);
      const component = money(fee.amount.minorUnits * BigInt(occurrences), fee.amount.currency);
      total = addMoney(total, component);
      components.push({ code: fee.code, amount: component });
    }
    return {
      headlinePrice,
      effectiveMonthlyPrice: money(total.minorUnits / BigInt(comparisonMonths), total.currency),
      totalCost: total,
      comparisonMonths,
      components,
    };
  }
}

export interface BidValidationContext {
  readonly requiredAttributeKeys: ReadonlySet<string>;
  readonly supplierVerified: boolean;
  readonly supplierCapacityLimit: bigint;
}

export class BidValidationService {
  validate(version: BidVersion, context: BidValidationContext): BidValidationResult {
    const issues: BidValidationIssue[] = [];
    if (version.capacityQuantity <= 0n)
      issues.push({
        code: 'CAPACITY_MUST_BE_POSITIVE',
        field: 'capacityQuantity',
        severity: 'ERROR',
      });
    if (version.capacityQuantity > context.supplierCapacityLimit)
      issues.push({
        code: 'CAPACITY_LIMIT_EXCEEDED',
        field: 'capacityQuantity',
        severity: 'ERROR',
      });
    if (Date.parse(version.fulfillmentStart) >= Date.parse(version.fulfillmentEnd))
      issues.push({
        code: 'INVALID_FULFILLMENT_RANGE',
        field: 'fulfillmentEnd',
        severity: 'ERROR',
      });
    if (version.geographyIds.length === 0)
      issues.push({ code: 'GEOGRAPHY_REQUIRED', field: 'geographyIds', severity: 'ERROR' });
    if (!context.supplierVerified)
      issues.push({ code: 'SUPPLIER_NOT_VERIFIED', severity: 'ERROR' });
    const feeCodes = new Set<string>();
    for (const fee of version.fees) {
      if (fee.amount.minorUnits < 0n)
        issues.push({ code: 'NEGATIVE_FEE', field: fee.code, severity: 'ERROR' });
      if (feeCodes.has(fee.code))
        issues.push({ code: 'DUPLICATE_FEE', field: fee.code, severity: 'ERROR' });
      feeCodes.add(fee.code);
    }
    for (const key of context.requiredAttributeKeys) {
      if (!(key in version.categoryAttributes))
        issues.push({ code: 'REQUIRED_CATEGORY_FIELD', field: key, severity: 'ERROR' });
    }
    if (!version.pricingComplete)
      issues.push({ code: 'TOTAL_COST_INPUTS_MISSING', field: 'fees', severity: 'ERROR' });
    return { valid: !issues.some((issue) => issue.severity === 'ERROR'), issues };
  }
}

export interface BidRepository {
  findOwned(id: EntityId<'Bid'>, organizationId: OrganizationId): Promise<Bid | undefined>;
  appendVersion(
    version: BidVersion,
    revision: BidRevision,
    expectedCurrentVersionId: EntityId<'BidVersion'>,
  ): Promise<void>;
  saveValidation(versionId: EntityId<'BidVersion'>, result: BidValidationResult): Promise<void>;
  withdraw(
    id: EntityId<'Bid'>,
    organizationId: OrganizationId,
    reason: string,
    requiresApproval: boolean,
  ): Promise<void>;
}
