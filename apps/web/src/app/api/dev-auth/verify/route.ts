import { NextResponse } from 'next/server';

import {
  DEV_SESSION_COOKIE,
  devAuthAvailable,
  verifyDevChallenge,
} from '../../../../demo/dev-auth';

export async function POST(request: Request) {
  if (!devAuthAvailable()) return new NextResponse(null, { status: 404 });
  const origin = request.headers.get('origin');
  if (origin !== null && origin !== new URL(request.url).origin)
    return NextResponse.json({ message: 'Запрос отклонён.' }, { status: 403 });
  const body: unknown = await request.json().catch(() => undefined);
  const requestId =
    typeof body === 'object' &&
    body !== null &&
    'requestId' in body &&
    typeof body.requestId === 'string'
      ? body.requestId
      : '';
  const code =
    typeof body === 'object' && body !== null && 'code' in body && typeof body.code === 'string'
      ? body.code
      : '';
  const sessionId = verifyDevChallenge(requestId, code);
  if (!sessionId)
    return NextResponse.json({ message: 'Код неверен или уже истёк.' }, { status: 400 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 8 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    secure: false,
  });
  return response;
}
