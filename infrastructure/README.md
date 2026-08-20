# Infrastructure skeleton

This directory reserves the reviewed OpenTofu layout. It intentionally creates no provider account, state backend, network, or production resource.

```text
infrastructure/
  modules/                 provider-specific implementations behind portable inputs/outputs
  environments/
    development/
    staging/
    production/
```

Before the first resource: select a provider through ADR/procurement, verify the official provider and OpenTofu compatibility, design remote state/locking in Russia, pin provider versions and checksums, define least-privilege identities, and add secret/misconfiguration scanning. Secrets and `.tfstate` are forbidden in Git.
