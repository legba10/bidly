import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const supportedTools = new Set(['gitleaks', 'osv-scanner', 'semgrep', 'trivy']);
const [tool, ...toolArguments] = process.argv.slice(2);

if (!tool || !supportedTools.has(tool)) {
  process.stderr.write('Expected one of: gitleaks, osv-scanner, semgrep, trivy.\n');
  process.exit(2);
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const localCandidates =
  process.platform === 'win32'
    ? [
        path.join(repositoryRoot, '.tools/security/bin', `${tool}.exe`),
        path.join(repositoryRoot, '.tools/security/semgrep/Scripts', `${tool}.exe`),
      ]
    : [];
const localTool = localCandidates.find((candidate) => existsSync(candidate));
const command = localTool ?? tool;
const result = spawnSync(command, toolArguments, {
  cwd: repositoryRoot,
  shell: false,
  stdio: 'inherit',
});

if (result.error) {
  const guidance =
    process.platform === 'win32'
      ? 'Run `pnpm security:tools:windows` first.'
      : 'Install the pinned official security CLI versions documented in ENVIRONMENT.md.';
  process.stderr.write(`Unable to start ${tool}. ${guidance}\n`);
  process.exit(1);
}

process.exit(result.status ?? 1);
