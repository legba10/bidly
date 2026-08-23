import { BidlyIcon, MarketProgress } from '@bidly/ui';
import Link from 'next/link';

import { BuyerShell } from '../../../components/buyer-shell';
import { UnavailableRoutePage } from '../../../components/unavailable-route-page';
import { requireDemoBuyerAccess } from '../../../demo/buyer-access';
import { findDemoCategory } from '../../../demo/marketplace-demo';

export default async function AuctionPage({
  params,
}: {
  readonly params: Promise<{ readonly id: string }>;
}) {
  const { id } = await params;
  if (!(await requireDemoBuyerAccess(`/auctions/${id}`)))
    return <UnavailableRoutePage area="buyer" />;
  const category = findDemoCategory(id) ?? findDemoCategory('home_internet');
  if (!category) return null;
  const steps = [
    'Запрос создан',
    'Спрос подтверждён',
    'Компании предлагают',
    'Сравнение',
    'Результат',
  ].map((label, index) => ({
    label,
    state:
      index < 2
        ? ('complete' as const)
        : index === 2
          ? ('current' as const)
          : ('upcoming' as const),
  }));
  return (
    <BuyerShell>
      <main className="p5-detail-page">
        <Link href="/app">← В кабинет</Link>
        <header className="p5-detail-hero">
          <div>
            <p className="bidly-eyebrow">Активные торги</p>
            <h1>{category.name}</h1>
            <p>
              {category.city} · {category.summary}
            </p>
          </div>
          <div>
            <span>До конца этапа</span>
            <strong>{category.deadline}</strong>
            <small>{category.stageLabel}</small>
          </div>
        </header>
        <MarketProgress steps={steps} title="Ход торгов" />
        <section className="p5-auction-stats">
          <article>
            <span>Участников</span>
            <strong>{category.participants.toLocaleString('ru-RU')}</strong>
          </article>
          <article>
            <span>Подтверждено</span>
            <strong>{category.verified.toLocaleString('ru-RU')}</strong>
          </article>
          <article>
            <span>Компаний</span>
            <strong>{category.supplierCount}</strong>
          </article>
          <article>
            <span>Сопоставимая цена</span>
            <strong>{category.comparableOffer}</strong>
          </article>
        </section>
        <section className="p5-detail-card">
          <div>
            <p className="bidly-eyebrow">Ваши условия</p>
            <h2>Что учитывается в предложениях</h2>
            <ul>
              <li>
                <BidlyIcon name="check-circle" />
                {category.summary}
              </li>
              <li>
                <BidlyIcon name="check-circle" />
                Полная стоимость без скрытых обязательных платежей
              </li>
              <li>
                <BidlyIcon name="check-circle" />
                Доступность проверяется до подтверждения
              </li>
            </ul>
          </div>
          <aside>
            <strong>{category.saving}</strong>
            <span>изменение относительно исходных условий</span>
            <Link
              className="bidly-link-button bidly-link-button--primary"
              href={`/auctions/${id}/offers`}
            >
              Смотреть {category.supplierCount} предложений <BidlyIcon name="arrow-right" />
            </Link>
          </aside>
        </section>
      </main>
    </BuyerShell>
  );
}
