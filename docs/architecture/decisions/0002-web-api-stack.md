# ADR-0002: Next.js web and Fastify API

- Status: accepted
- Date: 2026-08-20

## Context

The consumer web needs React, server-first rendering, accessibility, and an OCI/VM deployment path not tied to Vercel. The API needs a small, testable, schema-driven HTTP boundary independent of the web runtime.

## Decision

Use React 19 + Next.js 16 for web and Fastify 5 for a separate Node API. Default to versioned JSON REST over standard HTTPS. Use Zod at runtime boundaries. Next standalone output and the Fastify process are packaged as OCI targets and can run behind any Russian load balancer.

Next route handlers may serve framework-specific technical needs but do not replace the domain API by convenience. React Server Components/server rendering are preferred where suitable; client components require an interaction need.

## Alternatives

- **NestJS:** strong structure but rejected now because decorators/DI/module abstraction and dependency surface add cost before domain modules exist.
- **Next-only API:** rejected as the main boundary because it couples backend scaling/lifecycle to web deployment.
- **GraphQL:** deferred; no demonstrated query/composition need offsets authorization, complexity, caching, and abuse-control cost.

## Consequences

- Web and API scale independently but share one language/lockfile.
- Security headers and validation are configured in both boundaries.
- Realtime, queues, auth, and persistence remain unselected until their requirements exist.

Official references: [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [Fastify principles](https://fastify.dev/docs/latest/Reference/Principles/), [Zod](https://zod.dev/).
