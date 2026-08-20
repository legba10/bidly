import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildOpenApiV1Document } from '../api-contracts.js';

const destination = fileURLToPath(new URL('../../../../docs/api/openapi.v1.json', import.meta.url));
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(buildOpenApiV1Document(), null, 2)}\n`, 'utf8');
process.stdout.write(`Generated ${destination}\n`);
