import { describe, expect, it } from 'vitest';

import { parseApiEnvironment, parseWebEnvironment } from './environment.js';

describe('runtime environment validation', () => {
  it('supplies safe local API defaults', () => {
    expect(parseApiEnvironment({})).toEqual({
      API_HOST: '127.0.0.1',
      API_PORT: 3001,
      LOG_LEVEL: 'info',
      NODE_ENV: 'development',
    });
  });

  it('rejects an invalid port before startup', () => {
    expect(() => parseApiEnvironment({ API_PORT: '70000' })).toThrow();
  });

  it('rejects an invalid public origin', () => {
    expect(() => parseWebEnvironment({ NEXT_PUBLIC_API_ORIGIN: 'not-a-url' })).toThrow();
  });
});
