import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  devAuthAvailable,
  isValidDevSession,
  requestDevChallenge,
  revokeDevSession,
  verifyDevChallenge,
} from './dev-auth';

describe('DEV authentication adapter', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('BIDLY_DEMO_MODE', '1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is explicitly gated to local development', () => {
    expect(devAuthAvailable()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(devAuthAvailable()).toBe(false);
  });

  it('rejects invalid phone input without creating a challenge', () => {
    expect(requestDevChallenge('123')).toBeUndefined();
  });

  it('creates a bounded one-time challenge and revocable session', () => {
    const challenge = requestDevChallenge('+7 999 111-22-33');
    expect(challenge?.requestId).toMatch(/^[A-Za-z0-9_-]{32}$/u);
    expect(challenge?.devCode).toBe('111111');

    const sessionId = verifyDevChallenge(challenge?.requestId ?? '', challenge?.devCode ?? '');
    expect(sessionId).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(isValidDevSession(sessionId)).toBe(true);
    expect(
      verifyDevChallenge(challenge?.requestId ?? '', challenge?.devCode ?? ''),
    ).toBeUndefined();

    revokeDevSession(sessionId);
    expect(isValidDevSession(sessionId)).toBe(false);
  });

  it('bounds verification attempts', () => {
    const challenge = requestDevChallenge('+7 999 222-33-44');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(verifyDevChallenge(challenge?.requestId ?? '', '000000')).toBeUndefined();
    }
    expect(verifyDevChallenge(challenge?.requestId ?? '', '111111')).toBeUndefined();
  });
});
