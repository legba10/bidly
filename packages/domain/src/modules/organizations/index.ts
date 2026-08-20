import { z } from 'zod';

import type {
  ActorContext,
  EntityId,
  OrganizationId,
  UtcInstant,
  UserId,
} from '../../shared/index.js';

import { DomainError } from '../../shared/index.js';

export type SupplierLegalStatus = 'LEGAL_ENTITY' | 'INDIVIDUAL_ENTREPRENEUR';
export type SupplierVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type SupplierModerationStatus = 'PENDING' | 'APPROVED' | 'RESTRICTED' | 'BLOCKED';
export type SupplierRole = 'MEMBER' | 'BID_MANAGER' | 'FULFILLMENT' | 'ADMIN';

export interface SupplierOrganization {
  readonly id: OrganizationId;
  readonly legalName: string;
  readonly displayName: string;
  readonly inn: string;
  readonly kpp?: string;
  readonly ogrnOrOgrnip: string;
  readonly legalStatus: SupplierLegalStatus;
  readonly verificationStatus: SupplierVerificationStatus;
  readonly moderationStatus: SupplierModerationStatus;
  readonly createdAt: UtcInstant;
}

export interface SupplierBranch {
  readonly id: EntityId<'SupplierBranch'>;
  readonly organizationId: OrganizationId;
  readonly displayName: string;
  readonly timezone: string;
  readonly addressId: EntityId<'Address'>;
  readonly active: boolean;
}

export interface SupplierMember {
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly roles: ReadonlySet<SupplierRole>;
  readonly status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
}

export interface SupplierVerification {
  readonly id: EntityId<'SupplierVerification'>;
  readonly organizationId: OrganizationId;
  readonly status: SupplierVerificationStatus;
  readonly source: 'MANUAL' | 'PROVIDER_ADAPTER';
  readonly checkedAt?: UtcInstant;
}

export interface SupplierDocument {
  readonly id: EntityId<'SupplierDocument'>;
  readonly organizationId: OrganizationId;
  readonly objectKey: string;
  readonly documentType: string;
}

export interface SupplierCapability {
  readonly organizationId: OrganizationId;
  readonly categoryId: EntityId<'Category'>;
  readonly status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export interface SupplierCoverage {
  readonly organizationId: OrganizationId;
  readonly coverageAreaId: EntityId<'CoverageArea'>;
  readonly source: 'SUPPLIER_UPLOAD' | 'ADMIN_IMPORT' | 'ADAPTER';
}

export const supplierOrganizationSchema = z.object({
  legalName: z.string().trim().min(1).max(300),
  displayName: z.string().trim().min(1).max(160),
  inn: z.string().regex(/^(?:\d{10}|\d{12})$/u),
  kpp: z
    .string()
    .regex(/^\d{9}$/u)
    .optional(),
  ogrnOrOgrnip: z.string().regex(/^(?:\d{13}|\d{15})$/u),
  legalStatus: z.enum(['LEGAL_ENTITY', 'INDIVIDUAL_ENTREPRENEUR']),
});

export interface OrganizationRepository {
  findOrganization(id: OrganizationId): Promise<SupplierOrganization | undefined>;
  findActiveMembership(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<SupplierMember | undefined>;
  saveVerification(verification: SupplierVerification): Promise<void>;
}

export interface SupplierVerificationProvider {
  verify(
    organization: SupplierOrganization,
  ): Promise<{ readonly reference: string; readonly verified: boolean }>;
}

export class OrganizationScopeService {
  constructor(private readonly repository: OrganizationRepository) {}

  async requireMembership(
    actor: ActorContext,
    organizationId: OrganizationId,
  ): Promise<SupplierMember> {
    if (actor.activeOrganizationId !== organizationId) {
      throw new DomainError('AUTHORIZATION_DENIED', 'Organization scope is not active');
    }
    const membership = await this.repository.findActiveMembership(actor.userId, organizationId);
    if (membership?.status !== 'ACTIVE') {
      throw new DomainError('AUTHORIZATION_DENIED', 'Active organization membership is required');
    }
    return membership;
  }
}
