# ADR-0006: OpenTofu for infrastructure as code

- Status: accepted for the skeleton; provider proof required
- Date: 2026-08-20

## Context

Infrastructure must be reproducible and portable across Russian providers. Terraform changed to the BUSL license for current releases; OpenTofu is a community-governed, MPL-2.0-compatible fork with Terraform configuration compatibility goals.

## Decision

Use OpenTofu configuration/module conventions. Keep provider-specific modules behind environment composition and pin provider versions/checksums in a committed lockfile when real resources are introduced. Before adopting a provider plugin, verify its official source, license, OpenTofu compatibility, release/signature/checksum path, and required credentials.

No production resources, remote state, account identifiers, or secrets are created during bootstrap.

## Alternatives and exit

- Current HashiCorp Terraform may remain operationally compatible, but its BUSL terms require legal review; rejected as the default.
- Provider templates/consoles are useful references but cannot be the reproducibility source.
- Exit is standard HCL/module state migration plus provider replacement; never use proprietary resources without ADR-0004's exit analysis.

Reference: [OpenTofu project](https://opentofu.org/docs/intro/), [OpenTofu GitHub](https://github.com/opentofu/opentofu).
