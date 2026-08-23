import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { BuyerShell } from '../../../components/buyer-shell';
import { UnavailableRoutePage } from '../../../components/unavailable-route-page';
import { requireDemoBuyerAccess } from '../../../demo/buyer-access';
import { demoBuyer } from '../../../demo/marketplace-demo';

export default async function SavingsPage() {
  if (!(await requireDemoBuyerAccess('/my/savings'))) return <UnavailableRoutePage area="buyer" />;
  return (
    <BuyerShell>
      <main className="p5-detail-page">
        <header className="p5-savings-hero">
          <div>
            <p className="bidly-eyebrow">Экономия</p>
            <h1>{demoBuyer.savedTotal}</h1>
            <p>
              Расчётная разница между прежними условиями и выбранными полными предложениями за год.
            </p>
          </div>
          <span>
            +{demoBuyer.savedMonth}
            <small>за последний месяц</small>
          </span>
        </header>
        <section className="p5-savings-breakdown">
          <h2>По категориям</h2>
          {demoBuyer.savings.map(([name, value, saving], index) => (
            <article key={name}>
              <span>
                <BidlyIcon name={index === 0 ? 'location' : index === 1 ? 'users' : 'building'} />
                {name}
              </span>
              <i>
                <b style={{ width: `${String(88 - index * 18)}%` }} />
              </i>
              <strong>{value}</strong>
              <em>{saving}</em>
            </article>
          ))}
        </section>
        <section className="p5-comparison-note">
          <BidlyIcon name="check-circle" />
          <div>
            <h2>Как считается экономия</h2>
            <p>
              Мы сравниваем полную стоимость сопоставимого периода, включая обязательные разовые
              платежи. Значение не является гарантией будущей цены.
            </p>
          </div>
          <Link href="/market">Посмотреть направления</Link>
        </section>
      </main>
    </BuyerShell>
  );
}
