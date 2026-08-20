import { Catalog } from '@bidly/domain';
import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { categoryRequirements } from '../../../components/market-catalog';
import { PublicFooter, PublicHeader } from '../../../components/public-navigation';
import { ruRU } from '../../../i18n/messages/ru-RU';

export default async function CategoryMarketPage({
  params,
}: {
  readonly params: Promise<{ readonly category: string }>;
}) {
  const { category: slug } = await params;
  const category = Catalog.developmentCategoryFixtures.find((item) => item.slug === slug);
  if (!category) notFound();
  const copy = ruRU.landing.categories.bySlug[category.slug];

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="bidly-market-page" id="main-content">
        <Link className="bidly-text-link" href="/market">
          ← {ruRU.shared.market}
        </Link>
        <section className="bidly-market-page__intro bidly-market-page__intro--category">
          <p className="bidly-eyebrow">{copy.tag}</p>
          <h1>{category.name}</h1>
          <p>{copy.summary}</p>
        </section>
        <section aria-labelledby="category-flow" className="bidly-category-detail">
          <div>
            <h2 id="category-flow">{ruRU.market.category.title}</h2>
            <ul>
              {categoryRequirements(category).map((requirement) => (
                <li key={requirement}>
                  <BidlyIcon name="check-circle" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <p>{ruRU.market.category.activePools}</p>
            <Link className="bidly-link-button bidly-link-button--primary" href="/login">
              {ruRU.shared.signIn}
              <BidlyIcon name="arrow-right" />
            </Link>
          </aside>
        </section>
        <section aria-labelledby="category-faq" className="bidly-category-faq">
          <h2 id="category-faq">{ruRU.market.category.FAQ}</h2>
          {ruRU.market.category.faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
