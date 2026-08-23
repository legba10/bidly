import { NextResponse } from 'next/server';

import { devAuthAvailable, requestDevChallenge } from '../../../../demo/dev-auth';

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return origin === null || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!devAuthAvailable()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request))
    return NextResponse.json({ message: 'Запрос отклонён.' }, { status: 403 });
  const body: unknown = await request.json().catch(() => undefined);
  const phone =
    typeof body === 'object' && body !== null && 'phone' in body && typeof body.phone === 'string'
      ? body.phone
      : '';
  const challenge = requestDevChallenge(phone);
  if (!challenge)
    return NextResponse.json({ message: 'Проверьте номер или попробуйте позже.' }, { status: 400 });
  return NextResponse.json({
    requestId: challenge.requestId,
    devCode: challenge.devCode,
    message: 'Код готов.',
  });
}
