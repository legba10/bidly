import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

interface Challenge {
  readonly expiresAt: number;
  readonly phoneHash: string;
  attempts: number;
}
interface Session {
  readonly expiresAt: number;
}

interface DevAuthState {
  readonly challenges: Map<string, Challenge>;
  readonly requestWindows: Map<string, { count: number; resetAt: number }>;
  readonly sessions: Map<string, Session>;
}

const globalDevAuth = globalThis as typeof globalThis & {
  __bidlyDevAuthState?: DevAuthState;
};
const devAuthState = globalDevAuth.__bidlyDevAuthState ?? {
  challenges: new Map<string, Challenge>(),
  requestWindows: new Map<string, { count: number; resetAt: number }>(),
  sessions: new Map<string, Session>(),
};
globalDevAuth.__bidlyDevAuthState = devAuthState;
const { challenges, requestWindows, sessions } = devAuthState;
const DEV_CODE = '111111';
const CHALLENGE_TTL_MS = 5 * 60 * 1_000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1_000;

export const DEV_SESSION_COOKIE = 'bidly_dev_session';

export function devAuthAvailable(): boolean {
  return process.env.NODE_ENV === 'development' && process.env['BIDLY_DEMO_MODE'] !== '0';
}

function cleanup(now: number): void {
  for (const [key, value] of challenges) if (value.expiresAt <= now) challenges.delete(key);
  for (const [key, value] of sessions) if (value.expiresAt <= now) sessions.delete(key);
  for (const [key, value] of requestWindows) if (value.resetAt <= now) requestWindows.delete(key);
}

function phoneHash(phone: string): string | undefined {
  const normalized = phone.replaceAll(/\D/gu, '');
  if (normalized.length !== 11 || !['7', '8'].includes(normalized[0] ?? '')) return undefined;
  return createHash('sha256')
    .update(`bidly-dev:${normalized.slice(1)}`)
    .digest('hex');
}

export function requestDevChallenge(
  phone: string,
): { readonly devCode: string; readonly requestId: string } | undefined {
  if (!devAuthAvailable()) return undefined;
  const hash = phoneHash(phone);
  if (!hash) return undefined;
  const now = Date.now();
  cleanup(now);
  const window = requestWindows.get(hash);
  if (window && window.resetAt > now && window.count >= 5) return undefined;
  requestWindows.set(
    hash,
    window && window.resetAt > now
      ? { count: window.count + 1, resetAt: window.resetAt }
      : { count: 1, resetAt: now + 10 * 60 * 1_000 },
  );
  const requestId = randomBytes(24).toString('base64url');
  challenges.set(requestId, { attempts: 0, expiresAt: now + CHALLENGE_TTL_MS, phoneHash: hash });
  return { devCode: DEV_CODE, requestId };
}

export function verifyDevChallenge(requestId: string, code: string): string | undefined {
  if (!devAuthAvailable()) return undefined;
  const challenge = challenges.get(requestId);
  if (!challenge || challenge.expiresAt <= Date.now() || challenge.attempts >= 5) return undefined;
  challenge.attempts += 1;
  const supplied = Buffer.from(code);
  const expected = Buffer.from(DEV_CODE);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return undefined;
  challenges.delete(requestId);
  const sessionId = randomBytes(32).toString('base64url');
  sessions.set(sessionId, { expiresAt: Date.now() + SESSION_TTL_MS });
  return sessionId;
}

export function isValidDevSession(sessionId: string | undefined): boolean {
  if (!devAuthAvailable() || !sessionId) return false;
  const session = sessions.get(sessionId);
  return session !== undefined && session.expiresAt > Date.now();
}

export function revokeDevSession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId);
}
