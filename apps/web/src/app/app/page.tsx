import { AuctionCard, BidlyIcon, DemandCard } from '@bidly/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BuyerShell } from '../../components/buyer-shell';
import { UnavailableRoutePage } from '../../components/unavailable-route-page';
import { DEV_SESSION_COOKIE, isValidDevSession } from '../../demo/dev-auth';
import {
  demoBuyer,
  demoCategories,
  demoOffers,
  isBidlyDemoMode,
} from '../../demo/marketplace-demo';

export default async function BuyerHomePage() {
  if (!isBidlyDemoMode()) return <UnavailableRoutePage area="buyer" />;
  const sessionId = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
  if (!isValidDevSession(sessionId)) redirect('/login?next=/app');
  return (
    <BuyerShell>
      <main className="p5-buyer-dashboard">
        <section className="p5-buyer-welcome">
          <div>
            <p>
              Добрый день, {demoBuyer.name}! <span aria-hidden="true">👋</span>
            </p>
            <h1>
              У вас {demoBuyer.activeAuctions} активных торга и {demoBuyer.pendingOffers}{' '}
              предложение ждёт решения
            </h1>
          </div>
          <article>
            <span>Ваша экономия</span>
            <strong>{demoBuyer.savedTotal}</strong>
            <small>{demoBuyer.savedMonth} за последний месяц</small>
            <i aria-hidden="true">⌁⌁╱╲╱╲</i>
          </article>
        </section>
        <section className="p5-dashboard-section">
          <header>
            <h2>Активные торги</h2>
            <Link href="/my/auctions">Смотреть все</Link>
          </header>
          <div className="p5-auction-grid">
            {demoCategories.slice(0, 3).map((category, index) => (
              <AuctionCard
                action={
                  <Link className="p5-card-action" href={`/auctions/${category.slug}`}>
                    {index === 1 ? 'Смотреть предложения' : 'Открыть торги'}
                    <BidlyIcon name="arrow-right" />
                  </Link>
                }
                category={category.name}
                deadline={`До конца: ${category.deadline}`}
                key={category.slug}
                offerCount={category.supplierCount}
                participants={`${category.participants.toLocaleString('ru-RU')} участников`}
                progress={index + 1}
                status={category.stageLabel}
              />
            ))}
          </div>
        </section>
        <div className="p5-buyer-columns">
          <section className="p5-dashboard-section">
            <header>
              <h2>Предложения, требующие решения</h2>
              <Link href="/auctions/home_internet/offers">Все предложения</Link>
            </header>
            <div className="p5-decision-list">
              {demoOffers.slice(0, 2).map((offer) => (
                <article key={offer.id}>
                  <div>
                    <strong>{offer.supplier}</strong>
                    <span>Домашний интернет · Сургут</span>
                  </div>
                  <div>
                    <strong>
                      {offer.price}
                      <small>{offer.period}</small>
                    </strong>
                    <span>Полная: {offer.totalCost}</span>
                  </div>
                  <span>{offer.saving}</span>
                  <Link href={`/offers/${offer.id}`}>Сравнить</Link>
                </article>
              ))}
            </div>
          </section>
          <aside className="p5-dashboard-aside">
            <section>
              <header>
                <h2>Экономия по категориям</h2>
                <Link href="/my/savings">Подробнее</Link>
              </header>
              {demoBuyer.savings.map(([name, value, saving]) => (
                <div key={name}>
                  <span>{name}</span>
                  <strong>{value}</strong>
                  <em>{saving}</em>
                </div>
              ))}
            </section>
            <section>
              <header>
                <h2>Ближайшая запись</h2>
              </header>
              <p>
                <BidlyIcon name="calendar" />
                <strong>{demoBuyer.booking.title}</strong>
                <span>{demoBuyer.booking.date} · время подтверждено</span>
              </p>
              <Link href={`/bookings/${demoBuyer.booking.id}`}>Открыть запись</Link>
            </section>
          </aside>
        </div>
        <section className="p5-dashboard-section">
          <header>
            <h2>Может подойти вам</h2>
            <Link href="/market">Ещё направления</Link>
          </header>
          <div className="p5-recommendations">
            {demoCategories.slice(3).map((category) => (
              <DemandCard
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
        </section>
      </main>
    </BuyerShell>
  );
}
