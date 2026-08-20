import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = fileURLToPath(new URL('../', import.meta.url));
const nextDirectory = join(appDirectory, '.next');
const standaloneDirectory = join(nextDirectory, 'standalone', 'apps', 'web');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function copyRuntimeDirectory(source, destination) {
  if (!(await exists(source))) {
    throw new Error(`Expected Next.js build output is missing: ${source}. Run pnpm build first.`);
  }
  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

await copyRuntimeDirectory(
  join(nextDirectory, 'static'),
  join(standaloneDirectory, '.next', 'static'),
);

const publicDirectory = join(appDirectory, 'public');
if (await exists(publicDirectory)) {
  await copyRuntimeDirectory(publicDirectory, join(standaloneDirectory, 'public'));
}
