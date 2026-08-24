import { BidlyIcon, BrandMark, IntegrationUnavailable } from '@bidly/ui';
import Link from 'next/link';
import { Suspense } from 'react';

import { DevLoginForm } from '../../components/dev-login-form';
import { ThemeAwareBrandLogo } from '../../components/theme-aware-brand-logo';
import { ThemeToggle } from '../../components/theme-toggle';
import { devAuthAvailable } from '../../demo/dev-auth';
import { ruRU } from '../../i18n/messages/ru-RU';

export default function LoginPage() {
  const auth = ruRU.auth;
  const devMode = devAuthAvailable();
  return (
    <main className="p5-auth-page">
      <section className="p5-auth-story">
        <Link className="p5-auth-brand" href="/">
          <ThemeAwareBrandLogo surface="dark" />
        </Link>
        <div>
          <p className="bidly-eyebrow">{auth.context}</p>
          <h1>{auth.headline}</h1>
          <p>{auth.lead}</p>
        </div>
        <ul>
          {auth.points.map((point) => (
            <li key={point}>
              <BidlyIcon name="check-circle" />
              {point}
            </li>
          ))}
        </ul>
        <div className="p5-auth-visual">
          <BrandMark />
          {devMode ? (
            <>
              <div>
                <span>Сопоставимое предложение</span>
                <strong>
                  549 ₽<small>/мес</small>
                </strong>
                <em>–27%</em>
              </div>
              <div>
                <span>Доступность</span>
                <strong>116 мест</strong>
                <small>проверяется до выбора</small>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>Сравнение</span>
                <strong>Полная стоимость</strong>
                <small>до принятия решения</small>
              </div>
              <div>
                <span>Доступность</span>
                <strong>Проверяется</strong>
                <small>до вашего действия</small>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="p5-auth-panel">
        <div className="p5-auth-panel__controls">
          <ThemeToggle />
        </div>
        <Link aria-label="Bidly — на главную" className="p5-auth-panel-brand" href="/">
          <ThemeAwareBrandLogo />
        </Link>
        <Link className="bidly-text-link" href="/">
          ← Вернуться на сайт
        </Link>
        {devMode ? (
          <Suspense fallback={<p>Загружаем безопасную форму…</p>}>
            <DevLoginForm />
          </Suspense>
        ) : (
          <IntegrationUnavailable
            detail="Безопасный вход появится после подключения проверенного SMS-провайдера, серверной сессии и защиты от перебора."
            title="Подключаем защищённый вход"
            titleAs="h2"
          />
        )}
      </section>
    </main>
  );
}
