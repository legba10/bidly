import { parseApiEnvironment } from '@bidly/validation';

import { createApp } from './app.js';

const environment = parseApiEnvironment(process.env);
const app = await createApp({ logLevel: environment.LOG_LEVEL });
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  app.log.info({ signal }, 'API shutdown requested');

  try {
    await app.close();
  } catch (error: unknown) {
    app.log.error({ error }, 'API shutdown failed');
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});
process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

try {
  await app.listen({ host: environment.API_HOST, port: environment.API_PORT });
} catch (error: unknown) {
  app.log.fatal({ error }, 'API startup failed');
  process.exitCode = 1;
  await app.close();
}
