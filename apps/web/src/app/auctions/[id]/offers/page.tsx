import { BidlyIcon, OfferCard } from '@bidly/ui';
import Link from 'next/link';

import { BuyerShell } from '../../../../components/buyer-shell';
import { UnavailableRoutePage } from '../../../../components/unavailable-route-page';
import { requireDemoBuyerAccess } from '../../../../demo/buyer-access';
import { demoOffers, findDemoCategory } from '../../../../demo/marketplace-demo';

export default async function AuctionOffersPage({
  params,
}: {
  readonly params: Promise<{ readonly id: string }>;
}) {
  const { id } = await params;
  if (!(await requireDemoBuyerAccess(`/auctions/${id}/offers`)))
    return <UnavailableRoutePage area="buyer" />;
  const category = findDemoCategory(id) ?? findDemoCategory('home_internet');
  return (
    <BuyerShell>
      <main className="p5-detail-page">
        <Link href={`/auctions/${id}`}>← Назад к торгам</Link>
        <header className="p5-list-header">
          <div>
            <p className="bidly-eyebrow">Предложения готовы</p>
            <h1>Сравните полные условия</h1>
            <p>{category?.name} · ни одно предложение не выбирается автоматически.</p>
          </div>
          <aside>
            <strong>{demoOffers.length}</strong>
            <span>подходящих варианта</span>
          </aside>
        </header>
        <div className="p5-offer-grid">
          {demoOffers.map((offer) => (
            <OfferCard
              action={
                <Link className="p5-card-action" href={`/offers/${offer.id}`}>
                  Подробнее и выбор <BidlyIcon name="arrow-right" />
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
        <section className="p5-comparison-note">
          <BidlyIcon name="shield" />
          <div>
            <h2>Почему первая карточка не «победитель»</h2>
            <p>
              Bidly показывает допустимые предложения. Вы выбираете по цене, условиям, репутации и
              доступности — итог индивидуален.
            </p>
          </div>
        </section>
      </main>
    </BuyerShell>
  );
}
