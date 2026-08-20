import { z } from 'zod';

import type {
  ActorContext,
  EntityId,
  PlatformRole,
  UtcInstant,
  UserId,
} from '../../shared/index.js';

export type ContactKind = 'EMAIL' | 'PHONE';
export type ConsentType = 'TERMS' | 'PRIVACY' | 'SUPPLIER_CONTACT' | 'MARKETING';

export interface User {
  readonly id: UserId;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  readonly createdAt: UtcInstant;
}

export interface UserProfile {
  readonly userId: UserId;
  readonly locale: string;
  readonly timezone: string;
}

export interface UserContact {
  readonly id: EntityId<'UserContact'>;
  readonly userId: UserId;
  readonly kind: ContactKind;
  readonly normalizedValue: string;
  readonly verifiedAt?: UtcInstant;
}

export interface ConsentRecord {
  readonly id: EntityId<'ConsentRecord'>;
  readonly userId: UserId;
  readonly type: ConsentType;
  readonly policyVersion: string;
  readonly source: string;
  readonly grantedAt: UtcInstant;
  readonly revokedAt?: UtcInstant;
}

export interface UserSession {
  readonly id: EntityId<'UserSession'>;
  readonly userId: UserId;
  readonly expiresAt: UtcInstant;
  readonly revokedAt?: UtcInstant;
}

export interface UserPreference {
  readonly userId: UserId;
  readonly locale: string;
  readonly timezone: string;
  readonly notificationChannels: readonly string[];
}

export const consentCommandSchema = z.object({
  type: z.enum(['TERMS', 'PRIVACY', 'SUPPLIER_CONTACT', 'MARKETING']),
  policyVersion: z.string().min(1).max(64),
  source: z.string().min(1).max(64),
});

export interface IdentityRepository {
  findUser(userId: UserId): Promise<User | undefined>;
  rolesForUser(userId: UserId): Promise<ReadonlySet<PlatformRole>>;
  appendConsent(consent: ConsentRecord): Promise<void>;
  revokeSessions(userId: UserId, exceptSessionId?: EntityId<'UserSession'>): Promise<number>;
}

export interface IdentityService {
  actorForSession(sessionId: EntityId<'UserSession'>, requestId: string): Promise<ActorContext>;
  recordConsent(consent: ConsentRecord): Promise<void>;
}
