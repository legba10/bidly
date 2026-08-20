import { z } from 'zod';

import type { ActorContext, EntityId } from '../../shared/index.js';

import { DomainError } from '../../shared/index.js';

export const adminOverrideSchema = z.object({
  resourceType: z.string().min(1).max(80),
  resourceId: z.uuid(),
  reason: z.string().trim().min(10).max(1000),
  expectedVersion: z.number().int().nonnegative(),
  newValue: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export type AdminOverrideCommand = z.infer<typeof adminOverrideSchema>;

export interface AdminRepository {
  applyOverride(
    command: AdminOverrideCommand,
    actor: ActorContext,
  ): Promise<{
    readonly previousValue: Readonly<Record<string, unknown>>;
    readonly auditEventId: EntityId<'AuditEvent'>;
  }>;
}

export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  async override(
    actor: ActorContext,
    input: unknown,
  ): Promise<{
    readonly previousValue: Readonly<Record<string, unknown>>;
    readonly auditEventId: EntityId<'AuditEvent'>;
  }> {
    if (!actor.roles.has('BIDLY_ADMIN')) {
      throw new DomainError('AUTHORIZATION_DENIED', 'Admin role is required');
    }
    return this.repository.applyOverride(adminOverrideSchema.parse(input), actor);
  }
}
