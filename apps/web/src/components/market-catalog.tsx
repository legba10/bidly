import { Catalog } from '@bidly/domain';
import { BidlyIcon, DemandCard } from '@bidly/ui';
import Link from 'next/link';

import { findDemoCategories, isBidlyDemoMode } from '../demo/marketplace-demo';
import { ruRU } from '../i18n/messages/ru-RU';

export function categoryRequirements(
  category: Catalog.CategoryFixtureDefinition,
): readonly string[] {
  return [
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
}

export function MarketCatalog({
  city,
  query,
  stage,
}: {
  readonly city: string;
  readonly query: string;
  readonly stage: string;
}) {
  const demoMode = isBidlyDemoMode();
  const demoResults = demoMode
    ? findDemoCategories(query, stage).filter((item) => city === 'ALL' || item.city === city)
    : [];
  const normalized = query.trim().toLocaleLowerCase('ru-RU');
  const catalogResults = Catalog.developmentCategoryFixtures.filter(
    (category) => !normalized || category.name.toLocaleLowerCase('ru-RU').includes(normalized),
  );

  if (!demoMode) {
    return (
      <div className="bidly-market-catalog">
        <p className="bidly-market-catalog__count">Направлений найдено: {catalogResults.length}</p>
        <div className="bidly-market-catalog__grid">
          {catalogResults.map((category) => {
            const copy = ruRU.landing.categories.bySlug[category.slug];
            return (
              <article className="bidly-market-card" key={category.slug}>
                <span aria-hidden="true" className="bidly-market-card__icon">
                  <BidlyIcon
                    name={
                      category.requiresAppointmentSlot
                        ? 'calendar'
                        : category.requiresCoverage
                          ? 'location'
                          : 'building'
                    }
                  />
                </span>
                <div>
                  <p>{copy.tag}</p>
                  <h2>{category.name}</h2>
                  <span>Живые данные появятся только из проверенного API</span>
                </div>
                <Link href={`/market/${category.slug}`}>
                  Условия направления <BidlyIcon name="arrow-right" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p5-market-results">
      <p aria-live="polite">
        Найдено рынков: <strong>{demoResults.length}</strong>
      </p>
      {demoResults.length === 0 ? (
        <div className="p5-market-empty">
          <BidlyIcon name="location" />
          <h2>Такого активного спроса пока нет</h2>
          <p>
            Попробуйте другой город, этап или более короткий запрос. Например: «интернет»,
            «спортзал» или «колёса».
          </p>
          <Link href="/market">Сбросить фильтры</Link>
        </div>
      ) : null}
      {demoResults.length > 0 ? (
        <div className="p5-demand-grid">
          {demoResults.map((category) => (
            <DemandCard
              action={
                <Link className="p5-card-action" href={`/market/${category.slug}`}>
                  {category.nextAction}
                  <BidlyIcon name="arrow-right" />
                </Link>
              }
              availability={category.availability}
              city={category.city}
              comparableOffer={category.comparableOffer}
              deadline={category.deadline}
              icon={category.icon}
              key={category.slug}
              participants={category.participants.toLocaleString('ru-RU')}
              saving={category.saving}
              stage={category.stageLabel}
              summary={category.summary}
              title={category.name}
              verified={category.verified.toLocaleString('ru-RU')}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
