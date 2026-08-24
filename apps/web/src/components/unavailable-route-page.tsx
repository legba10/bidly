import { IntegrationUnavailable } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../i18n/messages/ru-RU';

import { PublicHeader } from './public-navigation';
import { ThemeAwareBrandLogo } from './theme-aware-brand-logo';
import { ThemeToggle } from './theme-toggle';

type UnavailableArea = keyof typeof ruRU.unavailable;

export interface UnavailableRoutePageProps {
  readonly area: UnavailableArea;
  readonly businessFrame?: boolean;
}

export function UnavailableRoutePage({ area, businessFrame = false }: UnavailableRoutePageProps) {
  const message = ruRU.unavailable[area];

  if (businessFrame) {
    return (
      <div className="bidly-business-unavailable">
        <aside className="bidly-business-unavailable__rail">
          <div className="bidly-business-unavailable__brand-row">
            <ThemeAwareBrandLogo />
            <ThemeToggle />
          </div>
          <p>Бизнес</p>
          <nav aria-label="Разделы бизнеса">
            <span>Обзор</span>
            <span>Доступный спрос</span>
            <span>Торги</span>
            <span>Мои предложения</span>
            <span>Заявки и подключения</span>
            <span>Квоты</span>
            <span>Клиенты</span>
            <span>Аналитика</span>
            <span>Финансы</span>
            <span>Отзывы</span>
            <span>Команда</span>
            <span>Документы</span>
            <span>Настройки</span>
          </nav>
        </aside>
        <main className="bidly-unavailable-main" id="main-content">
          <IntegrationUnavailable detail={message.detail} title={message.title} />
          <Link className="bidly-text-link" href="/">
            {ruRU.shared.backToHome}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="bidly-unavailable-main" id="main-content">
        <IntegrationUnavailable detail={message.detail} title={message.title} />
        <Link className="bidly-text-link" href="/">
          {ruRU.shared.backToHome}
        </Link>
      </main>
    </>
  );
}
