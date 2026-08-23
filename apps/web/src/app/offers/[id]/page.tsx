import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { BuyerShell } from '../../../components/buyer-shell';
import { UnavailableRoutePage } from '../../../components/unavailable-route-page';
import { requireDemoBuyerAccess } from '../../../demo/buyer-access';
import { demoOffers } from '../../../demo/marketplace-demo';

export default async function OfferDetailsPage({
  params,
}: {
  readonly params: Promise<{ readonly id: string }>;
}) {
  const { id } = await params;
  if (!(await requireDemoBuyerAccess(`/offers/${id}`)))
    return <UnavailableRoutePage area="buyer" />;
  const offer = demoOffers.find((item) => item.id === id) ?? demoOffers[0];
  if (!offer) return null;
  return (
    <BuyerShell>
      <main className="p5-detail-page">
        <Link href="/auctions/home_internet/offers">← К сравнению</Link>
        <header className="p5-offer-detail">
          <div>
            <p className="bidly-eyebrow">Предложение поставщика</p>
            <h1>{offer.supplier}</h1>
            <p>
              ★ {offer.rating} · {offer.reviews.toLocaleString('ru-RU')} подтверждённых отзывов
            </p>
          </div>
          <div>
            <span>Условия предложения</span>
            <strong>
              {offer.price}
              <small>{offer.period}</small>
            </strong>
            <em>{offer.saving}</em>
          </div>
        </header>
        <div className="p5-offer-detail-grid">
          <section>
            <h2>Что входит</h2>
            <ul>
              {offer.conditions.map((condition) => (
                <li key={condition}>
                  <BidlyIcon name="check-circle" />
                  {condition}
                </li>
              ))}
            </ul>
            <h2>Полная стоимость</h2>
            <div className="p5-total-cost">
              <strong>{offer.totalCost}</strong>
              <p>
                Ежемесячная плата, обязательные разовые платежи и постпромо-условия учтены в
                расчёте.
              </p>
            </div>
            <h2>Доступность</h2>
            <p>{offer.availability}. Наличие будет проверено ещё раз при подтверждении.</p>
          </section>
          <aside>
            <h2>Подходит?</h2>
            <p>
              После продолжения Bidly проверит версию условий и доступность. Контакты поставщику
              передаются только после вашего информированного действия.
            </p>
            <Link
              className="bidly-link-button bidly-link-button--primary"
              href={`/bookings/connection-confirmation?offer=${offer.id}`}
            >
              Выбрать предложение <BidlyIcon name="arrow-right" />
            </Link>
            <Link
              className="bidly-link-button bidly-link-button--secondary"
              href="/auctions/home_internet/offers"
            >
              Сравнить ещё раз
            </Link>
          </aside>
        </div>
      </main>
    </BuyerShell>
  );
}
