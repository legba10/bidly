import { Catalog } from '@bidly/domain';
import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../i18n/messages/ru-RU';

export function categoryRequirements(
  category: Catalog.CategoryFixtureDefinition,
): readonly string[] {
  const requirements = [
    category.requiresCoverage
      ? 'Проверим возможность оказать услугу по вашему адресу.'
      : 'Уточним город и важные условия выбора.',
    category.requiresAppointmentSlot
      ? 'После выбора потребуется выбрать доступное время.'
      : 'Следующий шаг зависит от условий выбранного предложения.',
    category.multiWinner
      ? 'Подходящие варианты могут предложить несколько компаний.'
      : 'Подходящий вариант зависит от индивидуальных условий и доступности.',
  ];
  return requirements;
}

function categoryIcon(category: Catalog.CategoryFixtureDefinition) {
  if (category.marketType === 'CAPACITY') return 'calendar';
  if (category.marketType === 'SWITCH') return 'location';
  return 'building';
}

export function MarketCatalog({ query }: { readonly query: string }) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
  const categories = Catalog.developmentCategoryFixtures.filter((category) => {
    if (!normalizedQuery) return true;
    return category.name.toLocaleLowerCase('ru-RU').includes(normalizedQuery);
  });

  return (
    <div className="bidly-market-catalog">
      <p aria-live="polite" className="bidly-market-catalog__count">
        {ruRU.market.resultCount}: {categories.length}
      </p>
      {categories.length === 0 ? (
        <p className="bidly-market-catalog__empty">{ruRU.market.noResults}</p>
      ) : null}
      <div className="bidly-market-catalog__grid">
        {categories.map((category) => {
          const copy = ruRU.landing.categories.bySlug[category.slug];
          return (
            <article className="bidly-market-card" key={category.slug}>
              <span aria-hidden="true" className="bidly-market-card__icon">
                <BidlyIcon name={categoryIcon(category)} />
              </span>
              <div>
                <p>{copy.tag}</p>
                <h2>{category.name}</h2>
                <span>{ruRU.market.status}</span>
              </div>
              <Link href={`/market/${category.slug}`}>
                {ruRU.market.action}
                <BidlyIcon name="arrow-right" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
