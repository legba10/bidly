# Dependency and supply-chain policy

Every dependency is maintained code running with Bidly's privileges. “Popular” is not a sufficient reason.

## Admission checklist

Before adding a runtime package, build plugin, action, binary, skill, or repository-derived source, record as applicable:

1. exact capability gap and why local/platform code is insufficient;
2. official source/maintainer and registry/repository identity;
3. current stable release, release recency/activity, runtime/peer compatibility;
4. license and commercial/distribution implications;
5. security policy/advisories/incidents and meaningful open blockers;
6. transitive dependency/build/lifecycle script surface;
7. lockfile, checksums/signatures/provenance availability;
8. permissions, network/data access, production residency, and vendor lock-in;
9. maintenance/upgrade/exit owner;
10. accepted or rejected decision in [`THIRD_PARTY_REVIEW.md`](../engineering/THIRD_PARTY_REVIEW.md).

Do not clone boilerplates, run `curl | bash`, execute third-party skill scripts, or add large “awesome” collections. Read source-distributed UI before it becomes Bidly code.

## npm/pnpm rules

- Use one committed `pnpm-lock.yaml`, exact direct versions, public HTTPS registry, and `pnpm install --frozen-lockfile` in CI.
- pnpm dependency build scripts are denied by default. First install with scripts disabled, inspect package manifests and delegated script source plus published provenance/checksum where available; then add only exact reviewed package versions to `allowBuilds` in `pnpm-workspace.yaml`.
- Never use a root `postinstall` to fetch tools, mutate developer machines, or hide setup.
- Keep `auto-install-peers=false` and strict peers so compatibility is explicit.
- Use Node LTS only. Do not select TypeScript or ESLint majors outside their declared compatibility ranges.
- Remove unused dependencies and imports. A transitive package must not be imported without becoming an explicit direct dependency.

## CI actions and binaries

- Pin every GitHub Action to a full commit SHA and include the human version in a comment. Dependabot may propose action updates; they require review/tests.
- Prefer official foundation/vendor actions. If licensing or permissions are unsuitable, use the official CLI release with a pinned version and checksum/provenance verification rather than an unofficial wrapper.
- Local binary bootstrap downloads only official HTTPS release assets, verifies a repository-pinned SHA-256, and never executes remote scripts.
- CI permissions are minimum and job-scoped. Third-party actions never receive write tokens or production secrets unless explicitly reviewed.

## Scanning and updates

- Gitleaks: working tree and Git history in CI; any real secret triggers rotation, not only removal.
- OSV-Scanner: lockfile/source scan on pull requests, pushes, and schedule; high/critical exploitable findings block.
- Semgrep/CodeQL: rational application-security baseline; suppressions are narrow, owned, evidenced, and expiring.
- Trivy: filesystem/IaC now and both OCI images in CI; high/critical findings block unless an approved exception exists.
- Dependabot opens weekly npm and GitHub Actions updates. No automatic merge.

Patch releases still require compatibility/build/test/security gates. Emergency security updates may be expedited but not made unreviewed.

## Exceptions and compromise response

An exception records package/version/advisory, reachable usage analysis, severity, owner, compensating controls, expiry, and removal/upgrade plan. If compromise is suspected: stop new builds/releases, preserve evidence, rotate affected credentials, identify artifact/lockfile commits, rebuild from trusted sources, notify incident owners, and document the decision. Do not silently pin a known-vulnerable version indefinitely.
