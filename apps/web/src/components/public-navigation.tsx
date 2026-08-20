import { BrandLogo } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../i18n/messages/ru-RU';

export function PublicHeader() {
  const messages = ruRU.shared;

  return (
    <header className="bidly-public-header">
      <div className="bidly-public-header__inner">
        <Link className="bidly-public-header__brand" href="/">
          <BrandLogo />
        </Link>
        <nav aria-label="Основная навигация" className="bidly-public-header__nav">
          <Link href="/#how-it-works">{messages.howItWorks}</Link>
          <Link href="/market">{messages.market}</Link>
          <Link href="/business">{messages.business}</Link>
          <Link href="/#support">{messages.support}</Link>
        </nav>
        <div className="bidly-public-header__actions">
          <Link className="bidly-link-button bidly-link-button--quiet" href="/login">
            {messages.signIn}
          </Link>
          <Link className="bidly-link-button bidly-link-button--primary" href="/market">
            {ruRU.landing.primaryAction}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bidly-public-footer" id="support">
      <div>
        <BrandLogo />
        <p>{ruRU.landing.footer}</p>
      </div>
      <Link href="/login">{ruRU.shared.signIn}</Link>
    </footer>
  );
}
