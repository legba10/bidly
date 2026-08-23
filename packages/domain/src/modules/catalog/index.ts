import { z } from 'zod';

import type { EntityId, UtcInstant } from '../../shared/index.js';

export type CategoryMarketType = 'SWITCH' | 'CAPACITY' | 'BULK' | 'LEAD';
export type CapacityMeasure = 'CONNECTION' | 'APPOINTMENT_SLOT' | 'INVENTORY_UNIT' | 'LEAD';

export interface CategoryDefinition {
  readonly categoryId: EntityId<'Category'>;
  readonly versionId: EntityId<'CategoryVersion'>;
  readonly slug: string;
  readonly marketType: CategoryMarketType;
  readonly capacityMeasure: CapacityMeasure;
  readonly multiWinner: boolean;
  readonly requiresCoverage: boolean;
  readonly requiresAppointmentSlot: boolean;
  readonly requiresSku: boolean;
  readonly buyerSchema: z.ZodType;
  readonly offerSchema: z.ZodType;
  readonly comparisonFields: readonly string[];
  readonly activeFrom: UtcInstant;
}

export interface CategoryRequirementDefinition {
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly field: string;
  readonly required: boolean;
}

export interface CategoryOfferDefinition extends CategoryRequirementDefinition {
  readonly comparisonField: boolean;
}

export const homeInternetBuyerSchema = z.object({
  addressId: z.uuid(),
  minimumSpeedMbps: z.number().int().positive().max(100_000),
  preferredMaxMonthlyMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  purchaseWindowEnd: z.iso.datetime({ offset: true }),
});

export const homeInternetOfferSchema = z.object({
  monthlyMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  speedMbps: z.number().int().positive().max(100_000),
  installationMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  routerMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  routerBilling: z.enum(['ONE_TIME', 'MONTHLY', 'INCLUDED']),
  contractMonths: z.number().int().positive().max(120),
  promoMonths: z.number().int().nonnegative().max(120),
  postPromoMonthlyMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  coverageAreaId: z.uuid(),
});

export const dentalHygieneBuyerSchema = z.object({
  cityId: z.uuid(),
  radiusMeters: z.number().int().positive().max(100_000),
  dateFrom: z.iso.datetime({ offset: true }),
  dateTo: z.iso.datetime({ offset: true }),
  preferredTimeRanges: z.array(z.object({ from: z.string(), to: z.string() })).max(14),
});

export const dentalHygieneOfferSchema = z.object({
  finalPriceMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  includedProcedures: z.array(z.string().min(1).max(100)).min(1).max(30),
  exclusions: z.array(z.string().min(1).max(160)).max(30),
  branchId: z.uuid(),
  slotIds: z.array(z.uuid()).min(1).max(500),
});

export const fitnessBuyerSchema = z.object({
  cityId: z.uuid(),
  preferredCoverageAreaId: z.uuid().optional(),
  membershipMonths: z.number().int().positive().max(36),
});

export const fitnessOfferSchema = z.object({
  finalPriceMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  activationFeeMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  membershipMonths: z.number().int().positive().max(36),
  branchIds: z.array(z.uuid()).min(1).max(100),
  freezeDays: z.number().int().nonnegative().max(365),
  availableMemberships: z.number().int().positive().max(100_000),
});

export const mobileConnectionBuyerSchema = z.object({
  cityId: z.uuid(),
  dataGb: z.number().int().positive().max(10_000),
  minutes: z.number().int().nonnegative().max(100_000),
  keepNumber: z.boolean(),
});

export const mobileConnectionOfferSchema = z.object({
  monthlyMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  activationMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  dataGb: z.number().int().positive().max(10_000),
  minutes: z.number().int().nonnegative().max(100_000),
  contractMonths: z.number().int().nonnegative().max(120),
  coverageAreaId: z.uuid(),
});

export const tireServiceBuyerSchema = z.object({
  cityId: z.uuid(),
  wheelDiameterInches: z.number().int().min(10).max(30),
  vehicleType: z.enum(['PASSENGER', 'SUV', 'VAN']),
  dateFrom: z.iso.datetime({ offset: true }),
  dateTo: z.iso.datetime({ offset: true }),
});

export const tireServiceOfferSchema = z.object({
  totalMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  includedServices: z.array(z.string().min(1).max(100)).min(1).max(20),
  branchId: z.uuid(),
  slotIds: z.array(z.uuid()).min(1).max(500),
});

export interface CategoryFixtureDefinition {
  readonly slug:
    'home_internet' | 'mobile_connection' | 'fitness' | 'dental_hygiene' | 'tire_service';
  readonly name: string;
  readonly marketType: CategoryMarketType;
  readonly capacityMeasure: CapacityMeasure;
  readonly multiWinner: boolean;
  readonly requiresCoverage: boolean;
  readonly requiresAppointmentSlot: boolean;
  readonly requiresSku: boolean;
  readonly buyerSchema: z.ZodType;
  readonly offerSchema: z.ZodType;
  readonly comparisonFields: readonly string[];
}

export const developmentCategoryFixtures: readonly CategoryFixtureDefinition[] = [
  {
    slug: 'home_internet',
    name: 'Домашний интернет',
    marketType: 'SWITCH',
    capacityMeasure: 'CONNECTION',
    multiWinner: false,
    requiresCoverage: true,
    requiresAppointmentSlot: false,
    requiresSku: false,
    buyerSchema: homeInternetBuyerSchema,
    offerSchema: homeInternetOfferSchema,
    comparisonFields: ['totalCost', 'speedMbps', 'postPromoMonthlyMinor', 'contractMonths'],
  },
  {
    slug: 'mobile_connection',
    name: 'Мобильная связь',
    marketType: 'SWITCH',
    capacityMeasure: 'CONNECTION',
    multiWinner: false,
    requiresCoverage: true,
    requiresAppointmentSlot: false,
    requiresSku: false,
    buyerSchema: mobileConnectionBuyerSchema,
    offerSchema: mobileConnectionOfferSchema,
    comparisonFields: ['totalCost', 'dataGb', 'minutes', 'contractMonths'],
  },
  {
    slug: 'dental_hygiene',
    name: 'Профессиональная гигиена зубов',
    marketType: 'CAPACITY',
    capacityMeasure: 'APPOINTMENT_SLOT',
    multiWinner: true,
    requiresCoverage: false,
    requiresAppointmentSlot: true,
    requiresSku: false,
    buyerSchema: dentalHygieneBuyerSchema,
    offerSchema: dentalHygieneOfferSchema,
    comparisonFields: ['finalPriceMinor', 'includedProcedures', 'branchId', 'slotIds'],
  },
  {
    slug: 'fitness',
    name: 'Фитнес',
    marketType: 'BULK',
    capacityMeasure: 'INVENTORY_UNIT',
    multiWinner: true,
    requiresCoverage: false,
    requiresAppointmentSlot: false,
    requiresSku: false,
    buyerSchema: fitnessBuyerSchema,
    offerSchema: fitnessOfferSchema,
    comparisonFields: ['finalPriceMinor', 'activationFeeMinor', 'membershipMonths', 'freezeDays'],
  },
  {
    slug: 'tire_service',
    name: 'Шиномонтаж',
    marketType: 'CAPACITY',
    capacityMeasure: 'APPOINTMENT_SLOT',
    multiWinner: true,
    requiresCoverage: false,
    requiresAppointmentSlot: true,
    requiresSku: false,
    buyerSchema: tireServiceBuyerSchema,
    offerSchema: tireServiceOfferSchema,
    comparisonFields: ['totalMinor', 'includedServices', 'branchId', 'slotIds'],
  },
] as const;

export function categoryJsonSchema(schema: z.ZodType): Readonly<Record<string, unknown>> {
  return z.toJSONSchema(schema);
}

export interface CategoryRepository {
  findActiveBySlug(slug: string, at: UtcInstant): Promise<CategoryDefinition | undefined>;
  findVersion(versionId: EntityId<'CategoryVersion'>): Promise<CategoryDefinition | undefined>;
  listActive(limit: number, cursor?: string): Promise<readonly CategoryDefinition[]>;
}

export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  validateBuyerInput(definition: CategoryDefinition, input: unknown): unknown {
    return definition.buyerSchema.parse(input);
  }

  validateOfferInput(definition: CategoryDefinition, input: unknown): unknown {
    return definition.offerSchema.parse(input);
  }
}
