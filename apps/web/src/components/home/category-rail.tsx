import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { demoCategories } from '../../demo/marketplace-demo';
import { ruRU } from '../../i18n/messages/ru-RU';

export function CategoryRail() {
  const copy = ruRU.landing.categories;

  return (
    <section className="bidly-home-section bidly-home-categories" id="market-directions">
      <header className="bidly-home-section__heading">
        <div>
          <p className="bidly-home-eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <p>{copy.lead}</p>
      </header>
      <div className="bidly-home-category-grid">
        {demoCategories.map((category) => {
          const categoryCopy = copy.bySlug[category.slug];
          return (
            <Link href={`/market/${category.slug}`} key={category.slug}>
              <span className="bidly-home-category-grid__icon">
                <BidlyIcon name={category.icon} />
              </span>
              <span>
                <strong>{category.shortName}</strong>
                <small>{categoryCopy.summary}</small>
              </span>
              <BidlyIcon className="bidly-home-category-grid__arrow" name="arrow-right" />
            </Link>
          );
        })}
        <Link className="bidly-home-category-grid__more" href="/market">
          <span className="bidly-home-category-grid__icon">•••</span>
          <span>
            <strong>Другие услуги</strong>
            <small>Посмотреть все доступные направления</small>
          </span>
          <BidlyIcon className="bidly-home-category-grid__arrow" name="arrow-right" />
        </Link>
      </div>
    </section>
  );
}
