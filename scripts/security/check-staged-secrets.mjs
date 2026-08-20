import { spawnSync } from 'node:child_process';

const diff = spawnSync(
  'git',
  ['diff', '--cached', '--no-ext-diff', '--unified=0', '--diff-filter=ACMR'],
  { encoding: 'utf8', shell: false },
);

if (diff.status !== 0) {
  process.stderr.write('Unable to inspect staged changes for high-signal secrets.\n');
  process.exit(diff.status ?? 1);
}

const addedLines = diff.stdout
  .split(/\r?\n/)
  .filter((line) => line.startsWith('+') && !line.startsWith('+++'));
const detectors = [
  {
    name: 'private key header',
    pattern: /^\+\s*-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----/,
  },
  {
    name: 'credential assignment',
    pattern:
      /^\+\s*(?:api[_-]?key|client[_-]?secret|password|private[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"']{16,}["']/i,
  },
  {
    name: 'authorization bearer value',
    pattern: /^\+.*authorization\s*[:=]\s*["']bearer\s+[a-z0-9._~+/-]{16,}["']/i,
  },
];

const findings = detectors.filter(({ pattern }) =>
  addedLines.some((line) => !line.includes('BIDLY_PLACEHOLDER') && pattern.test(line)),
);

if (findings.length > 0) {
  process.stderr.write(
    `Commit stopped: possible ${findings.map(({ name }) => name).join(', ')} in staged changes. Run Gitleaks and replace or rotate real credentials.\n`,
  );
  process.exit(1);
}
