import type { ActorContext, OrganizationId, UserId } from '../../shared/index.js';

export type Action =
  | 'buyer_demand:create'
  | 'buyer_demand:read'
  | 'bid:create'
  | 'bid:update'
  | 'bid:withdraw'
  | 'offer:accept'
  | 'booking:create'
  | 'fulfillment:confirm_supplier'
  | 'auction:moderate'
  | 'admin:override';

export interface PolicyResource {
  readonly type: string;
  readonly ownerUserId?: UserId;
  readonly organizationId?: OrganizationId;
  readonly state?: string;
  readonly locked?: boolean;
}

export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly reasonCode: string;
}

export interface AuthorizationService {
  can(actor: ActorContext, action: Action, resource: PolicyResource): AuthorizationDecision;
}

export class DefaultAuthorizationService implements AuthorizationService {
  can(actor: ActorContext, action: Action, resource: PolicyResource): AuthorizationDecision {
    if (action === 'admin:override') {
      return actor.roles.has('BIDLY_ADMIN')
        ? { allowed: true, reasonCode: 'ADMIN_ROLE' }
        : { allowed: false, reasonCode: 'ADMIN_ROLE_REQUIRED' };
    }
    if (action === 'auction:moderate') {
      return actor.roles.has('BIDLY_MODERATOR') || actor.roles.has('BIDLY_ADMIN')
        ? { allowed: true, reasonCode: 'MODERATION_ROLE' }
        : { allowed: false, reasonCode: 'MODERATION_ROLE_REQUIRED' };
    }
    if (
      action.startsWith('buyer_demand:') ||
      action === 'offer:accept' ||
      action === 'booking:create'
    ) {
      return resource.ownerUserId === actor.userId
        ? { allowed: true, reasonCode: 'RESOURCE_OWNER' }
        : { allowed: false, reasonCode: 'RESOURCE_OWNER_REQUIRED' };
    }
    if (action.startsWith('bid:') || action === 'fulfillment:confirm_supplier') {
      if (!resource.organizationId || actor.activeOrganizationId !== resource.organizationId) {
        return { allowed: false, reasonCode: 'ORGANIZATION_SCOPE_MISMATCH' };
      }
      if (!actor.supplierRoles || actor.supplierRoles.size === 0) {
        return { allowed: false, reasonCode: 'ACTIVE_MEMBERSHIP_REQUIRED' };
      }
      if (resource.locked && (action === 'bid:update' || action === 'bid:withdraw')) {
        return { allowed: false, reasonCode: 'RESOURCE_LOCKED' };
      }
      return { allowed: true, reasonCode: 'ORGANIZATION_MEMBER' };
    }
    return { allowed: false, reasonCode: 'DENY_BY_DEFAULT' };
  }
}
