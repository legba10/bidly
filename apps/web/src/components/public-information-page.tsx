import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../i18n/messages/ru-RU';

import { PublicFooter, PublicHeader } from './public-navigation';

export interface PublicInformationPageProps {
  readonly eyebrow: string;
  readonly lead: string;
  readonly points?: readonly string[];
  readonly title: string;
}

export function PublicInformationPage({
  eyebrow,
  lead,
  points,
  title,
}: PublicInformationPageProps) {
  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="bidly-information-page" id="main-content">
        <section className="bidly-information-page__intro">
          <p className="bidly-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </section>
        {points ? (
          <section aria-label="Ключевые принципы" className="bidly-information-page__points">
            {points.map((point) => (
              <article key={point}>
                <BidlyIcon name="check-circle" />
                <p>{point}</p>
              </article>
            ))}
          </section>
        ) : null}
        <Link className="bidly-link-button bidly-link-button--primary" href="/market">
          {ruRU.landing.primaryAction}
          <BidlyIcon name="arrow-right" />
        </Link>
      </main>
      <PublicFooter />
    </>
  );
}
