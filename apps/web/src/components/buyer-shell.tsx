import { BidlyIcon, BrandLogo } from '@bidly/ui';
import Link from 'next/link';

import type { ReactNode } from 'react';

import { ThemeAwareBrandLogo } from './theme-aware-brand-logo';
import { ThemeToggle } from './theme-toggle';

const navigation = [
  { href: '/app', icon: 'location', label: 'Главная' },
  { href: '/market', icon: 'users', label: 'Рынок' },
  { href: '/my/auctions', icon: 'building', label: 'Мои торги' },
  { href: '/offers/svyaz-plus', icon: 'check-circle', label: 'Предложения' },
  { href: '/bookings/hygiene-25-08', icon: 'calendar', label: 'Записи' },
  { href: '/my/savings', icon: 'shield', label: 'Экономия' },
] as const;

export function BuyerShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="p5-buyer-shell">
      <aside className="p5-buyer-sidebar">
        <Link href="/">
          <ThemeAwareBrandLogo className="p5-buyer-logo-full" />
          <BrandLogo className="p5-buyer-logo-mark" variant="mark" />
        </Link>
        <nav aria-label="Кабинет покупателя">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              <BidlyIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p5-buyer-sidebar__help">
          <BidlyIcon name="shield" />
          <strong>Нужна помощь?</strong>
          <Link href="/support">Центр поддержки</Link>
        </div>
      </aside>
      <div className="p5-buyer-main">
        <header className="p5-appbar">
          <div>
            <strong>Сургут</strong>
          </div>
          <form action="/market" method="get">
            <label className="bidly-sr-only" htmlFor="app-search">
              Поиск
            </label>
            <input
              id="app-search"
              name="q"
              placeholder="Поиск по торгам и категориям"
              type="search"
            />
          </form>
          <div>
            <ThemeToggle />
            <Link href="/support" aria-label="Поддержка">
              <BidlyIcon name="shield" />
            </Link>
            <span className="p5-avatar">АП</span>
            <strong>Алексей</strong>
          </div>
        </header>
        {children}
      </div>
      <nav aria-label="Мобильная навигация" className="p5-buyer-bottom-nav">
        {navigation.slice(0, 5).map((item) => (
          <Link href={item.href} key={item.href}>
            <BidlyIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
