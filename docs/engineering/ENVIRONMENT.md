# Bootstrap environment

**Audit date:** 2026-08-20  
**Workspace at audit:** empty directory, no Git metadata or prior application files

## Detected local environment

| Component             | Detected                                                                              | Project requirement / decision                                                                              | Result                                                     |
| --------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| OS                    | Windows 10 Home Single Language 10.0.19045 x64                                        | Local development supported; CI uses Linux                                                                  | Supported with documented tool gaps                        |
| PowerShell            | 7.6.4                                                                                 | PowerShell 7 for Windows bootstrap script                                                                   | Pass                                                       |
| Codex desktop app     | 26.818.2441.0                                                                         | Use official app updates only                                                                               | Detected                                                   |
| Codex CLI             | packaged executable path found, but direct execution returned Windows `Access denied` | A reliable CLI semantic version is required before any CLI update decision                                  | Not verifiable locally; not changed                        |
| OpenAI Codex upstream | official `openai/codex` latest release observed as `rust-v0.148.0` (2026-08-18)       | Do not equate Rust CLI tag with desktop package version                                                     | Reference only                                             |
| Node.js               | 24.15.0                                                                               | Node 24 LTS; `.node-version` pins current audited 24.19.0, engine floor stays 24.15 for local compatibility | Local patch behind project pin; commands remain compatible |
| npm                   | 11.12.1                                                                               | Used only for registry metadata/system bootstrap where documented                                           | Detected                                                   |
| Corepack              | 0.34.6                                                                                | pnpm activation in CI                                                                                       | Detected                                                   |
| pnpm                  | 11.19.0; update notice showed 11.22.0                                                 | Exactly audited `pnpm@11.19.0`; review release notes before changing                                        | Pass; no blind update                                      |
| Git                   | 2.53.0.windows.3                                                                      | Modern Git                                                                                                  | Pass                                                       |
| Docker                | not found                                                                             | Required for local OCI build/image scan, but not application/unit development                               | Local container validation unavailable                     |
| Python                | 3.12.10                                                                               | Used only by Semgrep and official skill validation                                                          | Pass                                                       |
| GitHub CLI            | not found                                                                             | Optional; GitHub remote/PR operations are not part of bootstrap                                             | Unavailable, no impact on local code gates                 |

Node's official release page identifies v24 as LTS and showed 24.19.0 as the current v24 patch at audit time: [Node.js releases](https://nodejs.org/en/about/previous-releases). The local runtime was not modified because system-wide updates were not authorized and 24.15.0 satisfies package engines, including jsdom's minimum.

## Codex capabilities reviewed

- Official Codex documentation confirms root/nested `AGENTS.md` discovery and project skills at `.agents/skills/<name>/SKILL.md`: [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [skills](https://learn.chatgpt.com/docs/build-skills), [plugins](https://learn.chatgpt.com/docs/build-plugins).
- The session exposed official `openai-docs` and `skill-creator` system skills, a curated plugin-management skill, and the curated GitHub plugin skill. The official skill instructions were read before use.
- No dedicated exposed shadcn, accessibility, Playwright, Bidly application-security, or Bidly review skill met the project-specific need. Six local, non-executable project skills were created instead of installing an unverified collection.
- The installed curated GitHub capability can be used after a remote exists. No GitHub remote or credentials were created.
- “Codex Security” appeared only in the recommended-but-not-installed catalogue. Plugin installation was not requested for that specific plugin, no additional callable capability was required to complete the local baseline, and repository-enforced controls are preferable to an optional memory aid. It was not installed.
- A bundled Codex manual helper returned HTTP 403 during the audit; official OpenAI web documentation was used as fallback. This is recorded rather than hidden.

## Required developer setup

1. Install Node 24.19.0 (or a later reviewed Node 24 LTS patch) and activate pnpm 11.19.0 through Corepack or the official pnpm method.
2. Run `pnpm install --frozen-lockfile`; never use a second package manager.
3. Run `pnpm exec playwright install` once for local browser testing.
4. On Windows, run `pnpm security:tools:windows` to install pinned, checksum-verified Gitleaks/OSV-Scanner/Trivy releases and an isolated Semgrep environment under ignored `.tools/`.
5. Optionally run `pnpm hooks:install`; hooks are convenience checks, while CI is authoritative.
6. Install Docker Desktop or another compatible Docker engine only when local OCI build/image validation is needed. Do not install it implicitly from project scripts.

## CI baseline

GitHub-hosted Linux runners install the pinned Node/pnpm versions, use the frozen lockfile, install Playwright browsers with OS dependencies, and run tool/action versions pinned in workflows. CI action SHAs were resolved from official GitHub repositories on the audit date.

## Known environment limitations

- The embedded Codex CLI could not be executed independently, so no CLI version comparison or update was performed.
- Docker and GitHub CLI are absent locally; OCI build/image scan and remote branch-protection behavior must be proven in GitHub CI or after explicit local installation.
- Provider accounts, production contracts, credentials, DNS, state backends, and infrastructure were intentionally not created.
