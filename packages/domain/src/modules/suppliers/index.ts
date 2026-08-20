import type { EntityId, OrganizationId } from '../../shared/index.js';

export interface Supplier {
  readonly organizationId: OrganizationId;
  readonly performanceProfileId: EntityId<'SupplierPerformanceProfile'>;
  readonly capacityLimitIds: readonly EntityId<'SupplierCapacityLimit'>[];
}

export interface SupplierRepository {
  find(organizationId: OrganizationId): Promise<Supplier | undefined>;
  eligibilityForAuction(
    organizationId: OrganizationId,
    auctionId: EntityId<'Auction'>,
  ): Promise<{ readonly eligible: boolean; readonly reasons: readonly string[] }>;
}

export class SupplierService {
  constructor(private readonly repository: SupplierRepository) {}

  find(organizationId: OrganizationId): Promise<Supplier | undefined> {
    return this.repository.find(organizationId);
  }
}
