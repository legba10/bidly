import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../i18n/messages/ru-RU';

import { PublicHeaderScrollState } from './public-header-scroll-state';
import { ThemeAwareBrandLogo } from './theme-aware-brand-logo';
import { ThemeToggle } from './theme-toggle';

export function PublicHeader({ tone = 'dark' }: { readonly tone?: 'dark' | 'light' }) {
  const messages = ruRU.shared;
  const navigation = [
    { href: '/how-it-works', label: messages.howItWorks },
    { href: '/market', label: messages.market },
    { href: '/business-info', label: messages.business },
    { href: '/about', label: messages.about },
    { href: '/support', label: messages.support },
  ];

  return (
    <header className="bidly-public-header" data-tone={tone} id="bidly-public-header">
      <PublicHeaderScrollState headerId="bidly-public-header" />
      <div className="bidly-public-header__inner">
        <Link className="bidly-public-header__brand" href="/">
          <ThemeAwareBrandLogo />
        </Link>
        <nav aria-label="Основная навигация" className="bidly-public-header__nav">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="bidly-public-header__actions">
          <ThemeToggle />
          <Link className="bidly-link-button bidly-link-button--quiet" href="/login">
            {messages.signIn}
          </Link>
          <Link className="bidly-link-button bidly-link-button--primary" href="/market">
            {ruRU.landing.primaryAction}
          </Link>
          <details className="bidly-public-header__menu">
            <summary aria-label={messages.menu}>
              <BidlyIcon name="chevron-right" />
              <span>{messages.menu}</span>
            </summary>
            <nav aria-label="Мобильная навигация">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/login">{messages.signIn}</Link>
              <Link className="bidly-public-header__mobile-cta" href="/market">
                {ruRU.landing.primaryAction}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({ tone = 'dark' }: { readonly tone?: 'dark' | 'light' }) {
  const legalLinks = [
    { href: '/legal/terms', label: 'Пользовательское соглашение' },
    { href: '/legal/privacy', label: 'Политика конфиденциальности' },
    { href: '/legal/rules', label: 'Правила площадки' },
  ];

  return (
    <footer className="bidly-public-footer" data-tone={tone}>
      <div className="bidly-public-footer__brand">
        <ThemeAwareBrandLogo />
        <p>{ruRU.landing.footer}</p>
      </div>
      <nav aria-label="Покупателям" className="bidly-public-footer__links">
        <p>Покупателям</p>
        <Link href="/market">Рынок</Link>
        <Link href="/how-it-works">Как это работает</Link>
        <Link href="/support">Поддержка</Link>
      </nav>
      <nav aria-label="Бизнесу" className="bidly-public-footer__links">
        <p>Бизнесу</p>
        <Link href="/business-info">Для компаний</Link>
        <Link href="/business">Бизнес-вход</Link>
        <Link href="/about">О Bidly</Link>
      </nav>
      <nav aria-label="Документы" className="bidly-public-footer__links">
        <p>Документы</p>
        {legalLinks.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
