import { NextResponse } from 'next/server';

import { DEV_SESSION_COOKIE, devAuthAvailable, revokeDevSession } from '../../../../demo/dev-auth';

export async function POST(request: Request) {
  if (!devAuthAvailable()) return new NextResponse(null, { status: 404 });
  const origin = request.headers.get('origin');
  if (origin !== null && origin !== new URL(request.url).origin)
    return NextResponse.json({ message: 'Запрос отклонён.' }, { status: 403 });
  const cookie = request.headers.get('cookie')?.match(/(?:^|; )bidly_dev_session=([^;]+)/u)?.[1];
  revokeDevSession(cookie);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
