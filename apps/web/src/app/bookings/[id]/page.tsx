import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { BuyerShell } from '../../../components/buyer-shell';
import { UnavailableRoutePage } from '../../../components/unavailable-route-page';
import { requireDemoBuyerAccess } from '../../../demo/buyer-access';

export default async function BookingPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams: Promise<{ readonly offer?: string }>;
}) {
  const { id } = await params;
  const { offer = 'svyaz-plus' } = await searchParams;
  if (!(await requireDemoBuyerAccess(`/bookings/${id}`)))
    return <UnavailableRoutePage area="buyer" />;
  const hygiene = id.includes('hygiene');
  return (
    <BuyerShell>
      <main className="p5-detail-page">
        <Link href="/app">← В кабинет</Link>
        <header className="p5-booking-hero">
          <span>
            <BidlyIcon name="check-circle" />
          </span>
          <div>
            <p className="bidly-eyebrow">{hygiene ? 'Запись подтверждена' : 'Следующий шаг'}</p>
            <h1>{hygiene ? 'Профессиональная гигиена' : 'Подключение домашнего интернета'}</h1>
            <p>
              {hygiene
                ? '25 августа · 12:00 · Клиника «Белая линия»'
                : `Предложение ${offer}: выберите удобное окно подключения`}
            </p>
          </div>
        </header>
        <section className="p5-booking-grid">
          <div>
            <h2>{hygiene ? 'Детали записи' : 'Доступные окна'}</h2>
            {hygiene ? (
              <dl>
                <div>
                  <dt>Адрес</dt>
                  <dd>Сургут, проспект Ленина, 38</dd>
                </div>
                <div>
                  <dt>Полная стоимость</dt>
                  <dd>2 490 ₽</dd>
                </div>
                <div>
                  <dt>Включено</dt>
                  <dd>Осмотр, AirFlow, ультразвук</dd>
                </div>
                <div>
                  <dt>Контакт</dt>
                  <dd>будет доступен после подтверждения</dd>
                </div>
              </dl>
            ) : (
              <div className="p5-slot-grid">
                {[
                  '22 августа · 10:00–12:00',
                  '22 августа · 14:00–16:00',
                  '23 августа · 12:00–14:00',
                  '24 августа · 16:00–18:00',
                ].map((slot, index) => (
                  <button className={index === 1 ? 'is-selected' : ''} key={slot} type="button">
                    {slot}
                    <span>{index === 1 ? 'выбрано' : 'доступно'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <aside>
            <BidlyIcon name="shield" />
            <h2>Перед подтверждением</h2>
            <p>
              Реальная запись появится после подключения атомарного резервирования и повторной
              проверки доступности.
            </p>
            <Link className="bidly-link-button bidly-link-button--primary" href="/app">
              Вернуться в кабинет
              <BidlyIcon name="arrow-right" />
            </Link>
          </aside>
        </section>
      </main>
    </BuyerShell>
  );
}
