import type { EntityId, UserId } from '../../shared/index.js';

export interface Buyer {
  readonly userId: UserId;
  readonly reliabilityProfileId: EntityId<'BuyerReliabilityProfile'>;
}

export interface BuyerRepository {
  find(userId: UserId): Promise<Buyer | undefined>;
  activeDemandCount(userId: UserId): Promise<number>;
}

export class BuyerService {
  constructor(private readonly repository: BuyerRepository) {}

  find(userId: UserId): Promise<Buyer | undefined> {
    return this.repository.find(userId);
  }
}
