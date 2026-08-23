import { Catalog } from '@bidly/domain';
import { BidlyIcon, OfferCard } from '@bidly/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { categoryRequirements } from '../../../components/market-catalog';
import { PublicFooter, PublicHeader } from '../../../components/public-navigation';
import { demoOffers, findDemoCategory, isBidlyDemoMode } from '../../../demo/marketplace-demo';
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
  const demoMode = isBidlyDemoMode();
  const demo = demoMode ? findDemoCategory(slug) : undefined;

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="p5-category-page" id="main-content">
        <Link className="bidly-text-link" href="/market">
          ← Все направления
        </Link>
        <section className="p5-category-hero">
          <div>
            <div className="p5-hero__meta">
              <p className="bidly-eyebrow">{copy.tag}</p>
            </div>
            <h1>{category.name}</h1>
            <p>{copy.summary}</p>
            <div className="p5-actions">
              <Link
                className="bidly-link-button bidly-link-button--primary bidly-link-button--large"
                href={`/login?next=/app&category=${category.slug}`}
              >
                Создать запрос <BidlyIcon name="arrow-right" />
              </Link>
              <a
                className="bidly-link-button bidly-link-button--secondary bidly-link-button--large"
                href="#conditions"
              >
                Что сравниваем
              </a>
            </div>
          </div>
          {demo ? (
            <aside>
              <span>{demo.stageLabel}</span>
              <strong>{demo.participants.toLocaleString('ru-RU')}</strong>
              <p>участников · {demo.verified.toLocaleString('ru-RU')} подтверждено</p>
              <hr />
              <strong>{demo.comparableOffer}</strong>
              <p>
                {demo.saving} · {demo.availability}
              </p>
              <small>До следующего этапа: {demo.deadline}</small>
            </aside>
          ) : (
            <aside>
              <BidlyIcon name="shield" />
              <h2>Данные рынка подключаются</h2>
              <p>В production здесь появится только проверенный спрос и реальная доступность.</p>
            </aside>
          )}
        </section>
        <section className="p5-category-mechanics" id="conditions">
          <div>
            <p className="bidly-eyebrow">Условия направления</p>
            <h2>Что останется частью вашего выбора</h2>
          </div>
          <ul>
            {categoryRequirements(category).map((requirement) => (
              <li key={requirement}>
                <BidlyIcon name="check-circle" />
                {requirement}
              </li>
            ))}
            <li>
              <BidlyIcon name="check-circle" />
              Сравнение использует полную стоимость: {category.comparisonFields.join(', ')}.
            </li>
            <li>
              <BidlyIcon name="check-circle" />
              Тип рынка {category.marketType}; доступность измеряется как {category.capacityMeasure}
              .
            </li>
          </ul>
        </section>
        {demoMode ? (
          <section className="p5-category-offers">
            <header className="p5-section__heading">
              <div>
                <p className="bidly-eyebrow">Пример сравнения</p>
                <h2>Предложения с полной стоимостью</h2>
                <p>
                  Сравнивайте полную стоимость, условия и доступность. Решение остаётся за
                  покупателем.
                </p>
              </div>
            </header>
            <div>
              {demoOffers.map((offer) => (
                <OfferCard
                  action={
                    <Link className="p5-card-action" href={`/offers/${offer.id}`}>
                      Смотреть детали <BidlyIcon name="arrow-right" />
                    </Link>
                  }
                  availability={offer.availability}
                  badge={offer.badge}
                  conditions={offer.conditions}
                  key={offer.id}
                  period={offer.period}
                  price={offer.price}
                  rating={offer.rating}
                  reviews={`${offer.reviews.toLocaleString('ru-RU')} отзывов`}
                  saving={offer.saving}
                  supplier={offer.supplier}
                  totalCost={offer.totalCost}
                />
              ))}
            </div>
          </section>
        ) : null}
        <section className="p5-faq p5-category-faq">
          <header>
            <p className="bidly-eyebrow">Частые вопросы</p>
            <h2>Перед запросом</h2>
          </header>
          <div>
            {ruRU.market.category.faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
