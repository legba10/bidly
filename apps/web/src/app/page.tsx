import { Catalog } from '@bidly/domain';
import { BidlyIcon, DemandPulse, MarketProgress } from '@bidly/ui';
import Link from 'next/link';

import { PublicFooter, PublicHeader } from '../components/public-navigation';
import { ruRU } from '../i18n/messages/ru-RU';

const categoryCopy = ruRU.landing.categories.bySlug;

export default function LandingPage() {
  const messages = ruRU.landing;

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main id="main-content">
        <section className="bidly-landing-hero">
          <div className="bidly-landing-hero__content">
            <p className="bidly-eyebrow">{messages.eyebrow}</p>
            <h1 className="bidly-landing-hero__title">
              {messages.titleStart} <span>{messages.titleAccent}</span>
            </h1>
            <p className="bidly-landing-hero__lead">{messages.lead}</p>
            <div className="bidly-landing-hero__actions">
              <Link
                className="bidly-link-button bidly-link-button--primary bidly-link-button--large"
                href="/market"
              >
                {messages.primaryAction}
                <BidlyIcon name="arrow-right" />
              </Link>
              <a
                className="bidly-link-button bidly-link-button--secondary bidly-link-button--large"
                href="#how-it-works"
              >
                {messages.secondaryAction}
              </a>
            </div>
            <DemandPulse detail={messages.demandPulse.detail} label={messages.demandPulse.label} />
          </div>
          <div aria-label={messages.visual.title} className="bidly-landing-hero__visual">
            <div className="bidly-landing-orbit" />
            <div className="bidly-landing-orbit__node bidly-landing-orbit__node--one" />
            <div className="bidly-landing-orbit__node bidly-landing-orbit__node--two" />
            <div className="bidly-landing-orbit__node bidly-landing-orbit__node--three" />
            <div className="bidly-landing-hero__visual-core">
              <span className="bidly-landing-hero__visual-mark">
                <BidlyIcon name="users" />
              </span>
              <p>{messages.visual.eyebrow}</p>
              <strong>{messages.visual.title}</strong>
            </div>
            <ul className="bidly-landing-hero__visual-cards">
              {messages.visual.items.map((item) => (
                <li key={item}>
                  <BidlyIcon name="check-circle" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label="Принципы Bidly" className="bidly-landing-proof">
          {messages.proof.map((item, index) => (
            <article className="bidly-landing-proof__item" key={item.title}>
              <span aria-hidden="true" className="bidly-landing-proof__number">
                0{index + 1}
              </span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </section>

        <section className="bidly-landing-section" id="how-it-works">
          <div className="bidly-landing-section__heading">
            <p className="bidly-eyebrow">{messages.how.eyebrow}</p>
            <h2>{messages.how.title}</h2>
            <p>{messages.how.lead}</p>
          </div>
          <MarketProgress
            steps={messages.how.steps.map((label) => ({ label, state: 'upcoming' as const }))}
            title="Путь покупателя"
          />
        </section>

        <section
          className="bidly-landing-section bidly-landing-section--categories"
          id="categories"
        >
          <div className="bidly-landing-section__heading">
            <p className="bidly-eyebrow">{messages.categories.eyebrow}</p>
            <h2>{messages.categories.title}</h2>
            <p>{messages.categories.lead}</p>
          </div>
          <div className="bidly-category-grid">
            {Catalog.developmentCategoryFixtures.map((category) => {
              const copy = categoryCopy[category.slug];

              return (
                <article className="bidly-category-card" key={category.slug}>
                  <span className="bidly-category-card__icon">
                    <BidlyIcon
                      name={
                        category.marketType === 'CAPACITY'
                          ? 'calendar'
                          : category.marketType === 'SWITCH'
                            ? 'location'
                            : 'building'
                      }
                    />
                  </span>
                  <p className="bidly-category-card__tag">{copy.tag}</p>
                  <h3>{category.name}</h3>
                  <p>{copy.summary}</p>
                  <Link href={`/market/${category.slug}`}>
                    {messages.categories.action}
                    <BidlyIcon name="chevron-right" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bidly-business-cta">
          <div className="bidly-business-cta__copy">
            <p className="bidly-eyebrow">{messages.business.eyebrow}</p>
            <h2>{messages.business.title}</h2>
            <p>{messages.business.lead}</p>
            <Link className="bidly-link-button bidly-link-button--on-dark" href="/business">
              {messages.business.action}
              <BidlyIcon name="arrow-right" />
            </Link>
          </div>
          <ul className="bidly-business-cta__points">
            {messages.business.points.map((point) => (
              <li key={point}>
                <BidlyIcon name="check-circle" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
