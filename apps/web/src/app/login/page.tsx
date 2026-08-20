import { BidlyIcon, BrandLogo, IntegrationUnavailable } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../../i18n/messages/ru-RU';

export default function LoginPage() {
  const auth = ruRU.auth;
  const unavailable = ruRU.unavailable.login;

  return (
    <main className="bidly-auth-page">
      <section className="bidly-auth-page__story">
        <Link className="bidly-auth-page__brand" href="/">
          <BrandLogo />
        </Link>
        <p className="bidly-eyebrow">{auth.context}</p>
        <h1>{auth.headline}</h1>
        <p>{auth.lead}</p>
        <ul>
          {auth.points.map((point) => (
            <li key={point}>
              <BidlyIcon name="check-circle" />
              {point}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Вход в Bidly" className="bidly-auth-page__panel">
        <Link className="bidly-text-link" href="/">
          {ruRU.shared.backToHome}
        </Link>
        <IntegrationUnavailable
          detail={unavailable.detail}
          title={unavailable.title}
          titleAs="h2"
        />
      </section>
    </main>
  );
}
