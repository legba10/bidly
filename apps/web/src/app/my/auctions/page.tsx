import { AuctionCard, BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { BuyerShell } from '../../../components/buyer-shell';
import { UnavailableRoutePage } from '../../../components/unavailable-route-page';
import { requireDemoBuyerAccess } from '../../../demo/buyer-access';
import { demoCategories } from '../../../demo/marketplace-demo';

export default async function MyAuctionsPage() {
  if (!(await requireDemoBuyerAccess('/my/auctions'))) return <UnavailableRoutePage area="buyer" />;
  return (
    <BuyerShell>
      <main className="p5-detail-page">
        <header className="p5-list-header">
          <div>
            <p className="bidly-eyebrow">Мои торги</p>
            <h1>Запросы и их текущий этап</h1>
            <p>В каждом рынке сохраняются ваши индивидуальные условия выбора.</p>
          </div>
          <Link className="bidly-link-button bidly-link-button--primary" href="/market">
            Новый запрос <BidlyIcon name="arrow-right" />
          </Link>
        </header>
        <div className="p5-auction-grid p5-auction-grid--all">
          {demoCategories.slice(0, 4).map((category, index) => (
            <AuctionCard
              action={
                <Link className="p5-card-action" href={`/auctions/${category.slug}`}>
                  Открыть <BidlyIcon name="arrow-right" />
                </Link>
              }
              category={category.name}
              deadline={`Следующий этап: ${category.deadline}`}
              key={category.slug}
              offerCount={category.supplierCount}
              participants={`${category.participants.toLocaleString('ru-RU')} участников`}
              progress={Math.min(3, index + 1)}
              status={category.stageLabel}
            />
          ))}
        </div>
      </main>
    </BuyerShell>
  );
}
