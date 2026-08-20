export type BidlyFeatureFlag =
  | 'category.home_internet'
  | 'category.dental_hygiene'
  | 'category.fitness'
  | 'auction.multi_winner'
  | 'allocation.experimental_policy';

const knownFlags: ReadonlySet<string> = new Set<BidlyFeatureFlag>([
  'category.home_internet',
  'category.dental_hygiene',
  'category.fitness',
  'auction.multi_winner',
  'allocation.experimental_policy',
]);

export interface FeatureFlags {
  enabled(flag: BidlyFeatureFlag): boolean;
}

export class LocalFeatureFlags implements FeatureFlags {
  private constructor(private readonly enabledFlags: ReadonlySet<BidlyFeatureFlag>) {}

  static parse(commaSeparated: string | undefined): LocalFeatureFlags {
    const values = (commaSeparated ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const unknown = values.filter((value) => !knownFlags.has(value));
    if (unknown.length > 0) throw new Error(`Unknown Bidly feature flags: ${unknown.join(', ')}`);
    return new LocalFeatureFlags(new Set(values as BidlyFeatureFlag[]));
  }

  enabled(flag: BidlyFeatureFlag): boolean {
    return this.enabledFlags.has(flag);
  }
}
