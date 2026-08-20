# Bidly HTTP API v1

The external boundary is `/api/v1`. Runtime Zod schemas in `@bidly/validation` are the single contract source and generate [`openapi.v1.json`](openapi.v1.json) via `pnpm api:generate`.

Implemented transport handlers:

- `GET /api/v1/me` — authenticated actor and roles;
- `GET /api/v1/categories` — bounded cursor list;
- `POST /api/v1/offers/{id}/accept` — authenticated, rate-limit-ready, idempotent command boundary.

Reserved typed contracts exist for demand creation, auction transitions, supplier bids, bookings, fulfillment confirmation, and audited admin overrides. They are deliberately not registered until their transaction repositories and authorization policies are wired; returning a successful placeholder would be unsafe.

Every external input is parsed at runtime. Command resource IDs in path and body must agree. Mutating retries use `Idempotency-Key`; the server stores actor, operation, key, and payload hash so a key cannot be reused for different input.

Errors use:

```json
{
  "code": "STABLE_MACHINE_CODE",
  "message": "Non-sensitive developer message",
  "details": { "field": "safe-code" },
  "request_id": "correlation-id"
}
```

No response includes stack traces, SQL, credentials, raw PII, or internal implementation details. User-facing Russian localization belongs to the future presentation layer.

Authentication and organization scope are resolved server-side. RBAC is combined with organization membership, ownership, and resource state as documented in [RBAC](../security/RBAC.md).
