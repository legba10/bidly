import { BidlyIcon, BrandLogoOnDark } from '@bidly/ui';
import Link from 'next/link';

import type { ReactNode } from 'react';

export const businessNavigation = [
  ['business', 'location', 'Главная'],
  ['business/demand', 'users', 'Доступный спрос'],
  ['business/auctions', 'building', 'Торги'],
  ['business/offers', 'check-circle', 'Мои предложения'],
  ['business/bookings', 'calendar', 'Заявки и подключения'],
  ['business/capacity', 'calendar', 'Календарь и квоты'],
  ['business/clients', 'users', 'Клиенты'],
  ['business/analytics', 'location', 'Аналитика'],
  ['business/finance', 'shield', 'Финансы'],
  ['business/reviews', 'check-circle', 'Отзывы'],
  ['business/team', 'users', 'Команда'],
  ['business/documents', 'building', 'Документы'],
  ['business/settings', 'shield', 'Настройки'],
] as const;

export function BusinessShell({
  active,
  children,
}: {
  readonly active: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="p5-business-shell">
      <aside className="p5-business-sidebar">
        <Link href="/">
          <BrandLogoOnDark />
        </Link>
        <span className="p5-business-label">Бизнес</span>
        <div className="p5-business-company">
          <span>С+</span>
          <div>
            <strong>Связь+</strong>
            <small>Проверенная компания</small>
          </div>
        </div>
        <nav aria-label="Бизнес-навигация">
          {businessNavigation.map(([path, icon, label]) => (
            <Link data-active={active === path.split('/').at(-1)} href={`/${path}`} key={path}>
              <BidlyIcon name={icon} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p5-business-manager">
          <span>МИ</span>
          <div>
            <small>Ваш менеджер Bidly</small>
            <strong>Мария Иванова</strong>
            <a href="mailto:business@bidly.ru">Написать</a>
          </div>
        </div>
      </aside>
      <div className="p5-business-main">
        <header className="p5-business-topbar">
          <form action="/business/demand" method="get">
            <label className="bidly-sr-only" htmlFor="business-search">
              Поиск
            </label>
            <input
              id="business-search"
              name="q"
              placeholder="Поиск по спросу, торгам, клиентам…"
              type="search"
            />
          </form>
          <div>
            <Link aria-label="Поддержка" href="/support">
              <BidlyIcon name="shield" />
            </Link>
            <span className="p5-avatar">С+</span>
            <div>
              <strong>Связь+</strong>
              <small>Алексей Петров</small>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
