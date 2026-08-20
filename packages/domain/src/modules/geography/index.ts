import type { EntityId } from '../../shared/index.js';

export interface Country {
  readonly id: EntityId<'Country'>;
  readonly isoCode: string;
  readonly name: string;
}

export interface Region {
  readonly id: EntityId<'Region'>;
  readonly countryId: EntityId<'Country'>;
  readonly code: string;
  readonly name: string;
}

export interface City {
  readonly id: EntityId<'City'>;
  readonly regionId: EntityId<'Region'>;
  readonly name: string;
  readonly timezone: string;
}

export interface GeoPoint {
  readonly latitudeMicrodegrees: number;
  readonly longitudeMicrodegrees: number;
}

export interface Address {
  readonly id: EntityId<'Address'>;
  readonly cityId: EntityId<'City'>;
  readonly normalizedAddress: string;
  readonly point?: GeoPoint;
}

export interface CoverageArea {
  readonly id: EntityId<'CoverageArea'>;
  readonly cityId?: EntityId<'City'>;
  readonly kind: 'CITY' | 'RADIUS' | 'POLYGON' | 'ADDRESS_SET';
  readonly definitionVersion: number;
}

export interface GeographyRepository {
  findCity(id: EntityId<'City'>): Promise<City | undefined>;
  findAddress(id: EntityId<'Address'>): Promise<Address | undefined>;
  coverageContains(
    areaId: EntityId<'CoverageArea'>,
    addressId: EntityId<'Address'>,
  ): Promise<boolean>;
}
