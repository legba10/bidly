'use client';

import { BidlyIcon } from '@bidly/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function DevLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedNext = params.get('next');
  const next =
    requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/app';
  const [phone, setPhone] = useState('+7 ');
  const [requestId, setRequestId] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestCode() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/dev-auth/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const result = (await response.json()) as {
        devCode?: string;
        message?: string;
        requestId?: string;
      };
      if (!response.ok || !result.requestId) {
        setMessage(result.message ?? 'Не удалось получить код.');
        return;
      }
      setRequestId(result.requestId);
      setDevCode(result.devCode ?? '');
      setMessage('Код готов. В этой локальной версии он показан прямо в форме.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/dev-auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, requestId }),
      });
      const result = (await response.json()) as { message?: string; ok?: boolean };
      if (!response.ok || !result.ok) {
        setMessage(result.message ?? 'Не удалось войти.');
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p5-login-card">
      <div>
        <h2>Вход по телефону</h2>
        <p>Введите номер и подтвердите вход одноразовым кодом.</p>
      </div>
      {requestId ? (
        <>
          <label>
            <span>Код подтверждения</span>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => {
                setCode(event.target.value.replaceAll(/\D/gu, ''));
              }}
              placeholder="6 цифр"
              value={code}
            />
          </label>
          <div className="p5-dev-code">
            <BidlyIcon name="shield" />
            <span>
              Код для входа: <strong>{devCode}</strong>
            </span>
          </div>
          <button
            className="bidly-link-button bidly-link-button--primary"
            disabled={busy || code.length !== 6}
            onClick={verifyCode}
            type="button"
          >
            {busy ? 'Проверяем…' : 'Войти в кабинет'}
            <BidlyIcon name="arrow-right" />
          </button>
          <button
            className="p5-inline-button"
            onClick={() => {
              setRequestId('');
              setCode('');
              setMessage('');
            }}
            type="button"
          >
            Изменить номер
          </button>
        </>
      ) : (
        <>
          <label>
            <span>Номер телефона</span>
            <input
              autoComplete="tel"
              inputMode="tel"
              onChange={(event) => {
                setPhone(event.target.value);
              }}
              placeholder="+7 999 000-00-00"
              value={phone}
            />
          </label>
          <button
            className="bidly-link-button bidly-link-button--primary"
            disabled={busy}
            onClick={requestCode}
            type="button"
          >
            {busy ? 'Готовим код…' : 'Получить код'}
            <BidlyIcon name="arrow-right" />
          </button>
        </>
      )}
      {message ? (
        <p aria-live="polite" className="p5-form-message">
          {message}
        </p>
      ) : null}
      <small>В локальной версии код показывается в форме и не отправляется по SMS.</small>
    </div>
  );
}
