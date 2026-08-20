# ADR-0009: Lightweight transactional outbox

- Status: accepted
- Date: 2026-08-20

## Context

Notifications, analytics, provider calls, and future integrations must not be lost when a domain commit succeeds or be emitted when it rolls back.

## Decision

Write versioned, non-PII domain event envelopes to `outbox_events` in the same PostgreSQL transaction as state/audit changes. A future worker claims bounded rows with `FOR UPDATE SKIP LOCKED`, records attempts/next time, and marks completion. Event IDs are unique and consumers remain idempotent.

No Kafka/broker is installed. In-process handlers may improve latency but never replace the durable outbox. Payloads use allowlisted identifiers/safe facts, not request bodies, contacts, tokens, or documents.
