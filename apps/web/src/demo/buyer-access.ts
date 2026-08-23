import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DEV_SESSION_COOKIE, isValidDevSession } from './dev-auth';
import { isBidlyDemoMode } from './marketplace-demo';

export async function requireDemoBuyerAccess(nextPath: string): Promise<boolean> {
  if (!isBidlyDemoMode()) return false;
  const sessionId = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
  if (!isValidDevSession(sessionId)) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return true;
}
