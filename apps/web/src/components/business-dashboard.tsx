import { BidlyIcon, BusinessMetric, CapacityChart, DemandCard, OfferCard } from '@bidly/ui';
import Link from 'next/link';

import { demoBusiness, demoCategories, demoOffers } from '../demo/marketplace-demo';

const sectionTitles: Readonly<Record<string, readonly [string, string]>> = {
  business: ['Главная', 'Обзор вашей деятельности на платформе'],
  demand: ['Доступный спрос', 'Подтверждённые рынки, где организация может предложить условия'],
  auctions: ['Торги', 'Этапы рынков и сроки следующего действия'],
  offers: ['Мои предложения', 'Версии условий, полная стоимость и остаток квоты'],
  bookings: ['Заявки и подключения', 'Работа с выбранными предложениями до исполнения'],
  capacity: ['Календарь и квоты', 'Конечная доступность организации без перепродажи мест'],
  clients: ['Клиенты', 'Только покупатели, выполнившие соответствующее действие и согласие'],
  analytics: ['Аналитика', 'Конверсия по подтверждённым этапам без скрытых метрик'],
  finance: ['Финансы', 'CPA начисляется только после атрибутированного исполнения'],
  reviews: ['Отзывы', 'Подтверждённая обратная связь по оказанным услугам'],
  team: ['Команда', 'Роли организации и область доступа'],
  documents: ['Документы', 'Версии договорных и операционных документов'],
  settings: ['Настройки', 'Профиль организации, уведомления и безопасность'],
};

function Header({ section }: { readonly section: string }) {
  const fallback = ['Главная', 'Обзор вашей деятельности на платформе'] as const;
  const [title, detail] = sectionTitles[section] ?? fallback;
  return (
    <header className="p5-business-page-header">
      <div>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
    </header>
  );
}

function BusinessFunnel({ compact = false }: { readonly compact?: boolean }) {
  const maximum = Math.max(...demoBusiness.funnel.map((item) => item.value), 1);

  return (
    <ol
      className={compact ? 'p5-business-funnel p5-business-funnel--compact' : 'p5-business-funnel'}
    >
      {demoBusiness.funnel.map((item, index) => {
        const previous = demoBusiness.funnel[index - 1]?.value;
        const conversion = previous === undefined ? 100 : (item.value / previous) * 100;
        const loss = previous === undefined ? 0 : previous - item.value;
        return (
          <li key={item.label}>
            <div className="p5-business-funnel__label">
              <span>{index + 1}</span>
              <strong>{item.label}</strong>
            </div>
            <div
              aria-label={`${item.label}: ${item.value.toLocaleString('ru-RU')}`}
              className="p5-business-funnel__track"
            >
              <i style={{ width: `${String(Math.max(5, (item.value / maximum) * 100))}%` }} />
            </div>
            <strong className="p5-business-funnel__value">
              {item.value.toLocaleString('ru-RU')}
            </strong>
            <small>
              {index === 0
                ? 'база'
                : `${conversion.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}% · −${loss.toLocaleString('ru-RU')}`}
            </small>
          </li>
        );
      })}
    </ol>
  );
}

function WeeklyTrend() {
  // These are the existing eight weekly values from the former chart, now with a readable scale.
  const values = [38, 52, 47, 66, 72, 64, 84, 91] as const;
  const maximum = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = 8 + index * 12;
      const y = 86 - (value / maximum) * 66;
      return `${String(x)},${String(y)}`;
    })
    .join(' ');

  return (
    <figure className="p5-trend-chart">
      <figcaption>
        <span>Недели периода</span>
        <strong>{maximum}</strong>
      </figcaption>
      <svg aria-label="Динамика по неделям" role="img" viewBox="0 0 100 100">
        <line x1="4" x2="96" y1="20" y2="20" />
        <line x1="4" x2="96" y1="53" y2="53" />
        <line x1="4" x2="96" y1="86" y2="86" />
        <polyline points={points} />
        {values.map((value, index) => {
          const x = 8 + index * 12;
          const y = 86 - (value / maximum) * 66;
          return (
            <g key={value}>
              <title>{`Неделя ${String(index + 1)}: ${String(value)}`}</title>
              <circle cx={x} cy={y} r="2.6" tabIndex={0} />
              <text x={x} y="96">
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <p>Наведите на точку, чтобы увидеть значение недели.</p>
    </figure>
  );
}

function BusinessHome() {
  return (
    <>
      <section className="p5-business-metrics">
        {demoBusiness.metrics.map((metric, index) => (
          <BusinessMetric
            detail={metric.detail}
            key={metric.label}
            label={metric.label}
            tone={index === 1 || index === 4 ? 'success' : 'brand'}
            value={metric.value}
          />
        ))}
      </section>
      <div className="p5-business-dashboard-grid">
        <section className="p5-business-panel p5-business-demand">
          <header>
            <h2>Актуальный спрос</h2>
            <Link href="/business/demand">Смотреть все</Link>
          </header>
          {demoCategories.slice(0, 3).map((category) => (
            <article key={category.slug}>
              <span>
                <BidlyIcon name={category.icon} />
              </span>
              <div>
                <strong>{category.name}</strong>
                <small>{category.summary}</small>
              </div>
              <div>
                <strong>{category.participants.toLocaleString('ru-RU')}</strong>
                <small>участников</small>
              </div>
              <div>
                <strong>{category.verified.toLocaleString('ru-RU')}</strong>
                <small>подтверждено</small>
              </div>
              <div>
                <span>{category.stageLabel}</span>
                <small>{category.deadline}</small>
              </div>
              <Link href={`/business/auctions?category=${category.slug}`}>Предложить условия</Link>
            </article>
          ))}
        </section>
        <section className="p5-business-panel">
          <header>
            <h2>Конверсия за 30 дней</h2>
            <Link href="/business/analytics">Подробнее</Link>
          </header>
          <BusinessFunnel compact />
          <footer>
            <span>Конверсия в оплату</span>
            <strong>3,4%</strong>
          </footer>
        </section>
        <section className="p5-business-panel">
          <header>
            <h2>Мои активные предложения</h2>
            <Link href="/business/offers">Смотреть все</Link>
          </header>
          <div className="p5-business-offer-table">
            {demoOffers.map((offer, index) => (
              <div key={offer.id}>
                <strong>
                  {offer.supplier === 'Связь+'
                    ? 'Домашний интернет'
                    : index === 1
                      ? 'Мобильная связь'
                      : 'Проф. гигиена'}
                </strong>
                <span>
                  {offer.price}
                  {offer.period}
                </span>
                <span>{offer.availability}</span>
                <em>{index === 0 ? 'Лидер' : index === 1 ? '2 место' : 'Активно'}</em>
              </div>
            ))}
          </div>
        </section>
        <section className="p5-business-panel">
          <header>
            <h2>Отзывы и рейтинг</h2>
            <Link href="/business/reviews">Смотреть все</Link>
          </header>
          <div className="p5-rating">
            <strong>4,8</strong>
            <span>
              ★★★★★<small>1 240 отзывов</small>
            </span>
          </div>
          {demoBusiness.reviews.slice(0, 1).map((review) => (
            <blockquote key={review.author}>
              <strong>{review.author}</strong>
              <p>{review.text}</p>
              <small>{review.date}</small>
            </blockquote>
          ))}
        </section>
        <section className="p5-business-panel">
          <header>
            <h2>Доступные места сегодня</h2>
            <Link href="/business/capacity">Календарь</Link>
          </header>
          <CapacityChart items={demoBusiness.capacity} />
        </section>
        <section className="p5-business-panel">
          <header>
            <h2>Последние заявки</h2>
            <Link href="/business/bookings">Смотреть все</Link>
          </header>
          <div className="p5-request-list">
            {(
              [
                ['Алексей К.', 'Подключение интернета', 'Подтверждено'],
                ['Мария Л.', '25 августа, 12:00', 'Ожидает прихода'],
                ['Игорь П.', 'Подключение интернета', 'В работе'],
                ['Елена В.', '27 августа, 14:00', 'Завершено'],
              ] as const
            ).map(([name, detail, status]) => (
              <div key={name}>
                <span>{name.slice(0, 2)}</span>
                <div>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </div>
                <em>{status}</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function DemandSection() {
  return (
    <div className="p5-business-card-grid">
      {demoCategories.map((category) => (
        <DemandCard
          action={
            <Link className="p5-card-action" href={`/business/auctions?category=${category.slug}`}>
              Подготовить условия <BidlyIcon name="arrow-right" />
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
  );
}

function AuctionsSection() {
  return (
    <div className="p5-business-panel p5-wide-panel">
      <div className="p5-stage-board">
        {(
          [
            ['Собираем спрос', demoCategories.filter((item) => item.stage === 'COLLECTING')],
            ['Компании предлагают', demoCategories.filter((item) => item.stage === 'PROPOSING')],
            [
              'Предложения готовы',
              demoCategories.filter((item) => item.stage === 'READY' || item.stage === 'BOOKING'),
            ],
          ] as const
        ).map(([title, entries]) => (
          <section key={title as string}>
            <header>
              <h2>{title as string}</h2>
              <span>{(entries as typeof demoCategories).length}</span>
            </header>
            {(entries as typeof demoCategories).map((item) => (
              <article key={item.slug}>
                <strong>{item.name}</strong>
                <p>{item.verified.toLocaleString('ru-RU')} подтверждено</p>
                <small>{item.deadline}</small>
                <Link href="/business/offers">Открыть</Link>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function OffersSection() {
  return (
    <div className="p5-business-card-grid p5-business-card-grid--offers">
      {demoOffers.map((offer) => (
        <OfferCard
          action={
            <Link className="p5-card-action" href={`/business/offers?edit=${offer.id}`}>
              Редактировать версию <BidlyIcon name="arrow-right" />
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
  );
}

function CapacitySection() {
  return (
    <div className="p5-business-two-column">
      <section className="p5-business-panel">
        <header>
          <h2>Среда, 20 августа</h2>
          <span>Доступно 24 места</span>
        </header>
        <CapacityChart items={demoBusiness.capacity} />
        <p className="p5-panel-note">
          В production изменение квоты проходит атомарно и не допускает отрицательного остатка.
        </p>
      </section>
      <section className="p5-business-panel">
        <header>
          <h2>Лимиты по направлениям</h2>
        </header>
        {[
          ['Домашний интернет', 116, 200],
          ['Мобильная связь', 47, 150],
          ['Проф. гигиена', 32, 100],
        ].map(([name, used, total]) => (
          <div className="p5-quota" key={name as string}>
            <div>
              <strong>{name}</strong>
              <span>
                {used} / {total}
              </span>
            </div>
            <i>
              <b style={{ width: `${String((Number(used) / Number(total)) * 100)}%` }} />
            </i>
          </div>
        ))}
      </section>
    </div>
  );
}

function BookingsSection() {
  return (
    <section className="p5-business-panel p5-wide-panel">
      <header>
        <h2>Заявки этой недели</h2>
        <button disabled title="Экспорт будет доступен после подключения данных" type="button">
          Экспорт пока недоступен
        </button>
      </header>
      <div className="p5-data-table">
        <div className="p5-data-table__head">
          <span>Клиент</span>
          <span>Услуга</span>
          <span>Время</span>
          <span>Статус</span>
          <span>Следующее действие</span>
        </div>
        {[
          [
            'Алексей К.',
            'Интернет 500 Мбит/с',
            '22 авг · 10:00',
            'Подтверждено',
            'Подготовить подключение',
          ],
          ['Мария Л.', 'Проф. гигиена', '25 авг · 12:00', 'Ожидает', 'Подтвердить приход'],
          [
            'Игорь П.',
            'Интернет 300 Мбит/с',
            '23 авг · 16:00',
            'В работе',
            'Зафиксировать результат',
          ],
          ['Елена В.', 'Проф. гигиена', '27 авг · 14:00', 'Завершено', 'Документы готовы'],
        ].map((row) => (
          <div key={row[0]}>
            {row.map((cell) => (
              <span key={cell}>{cell}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsSection() {
  return (
    <div className="p5-business-two-column">
      <section className="p5-business-panel">
        <header>
          <h2>Воронка за 30 дней</h2>
          <span>3,4% в подтверждённое исполнение</span>
        </header>
        <BusinessFunnel />
      </section>
      <section className="p5-business-panel">
        <header>
          <h2>Динамика по неделям</h2>
        </header>
        <WeeklyTrend />
      </section>
    </div>
  );
}

function FinanceSection() {
  return (
    <>
      <section className="p5-business-metrics">
        {(
          [
            ['Начислено CPA', '24 600 ₽', '+4 800 ₽'],
            ['К оплате', '18 400 ₽', 'до 28 августа'],
            ['Подтверждено исполнений', '117', '97% от завершённых'],
            ['Средний CPA', '210 ₽', 'по текущему периоду'],
          ] as const
        ).map(([label, value, detail]) => (
          <BusinessMetric detail={detail} key={label} label={label} tone="success" value={value} />
        ))}
      </section>
      <section className="p5-business-panel p5-wide-panel">
        <header>
          <h2>Операции</h2>
          <Link href="/business/documents">Документы</Link>
        </header>
        <div className="p5-data-table">
          <div className="p5-data-table__head">
            <span>Период</span>
            <span>Основание</span>
            <span>Исполнения</span>
            <span>Сумма</span>
            <span>Статус</span>
          </div>
          {[
            ['12–18 августа', 'Домашний интернет', '43', '9 030 ₽', 'Подтверждено'],
            ['5–11 августа', 'Мобильная связь', '31', '6 510 ₽', 'Оплачено'],
            ['29 июля–4 августа', 'Проф. гигиена', '22', '4 620 ₽', 'Оплачено'],
          ].map((row) => (
            <div key={row[0]}>
              {row.map((cell) => (
                <span key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ReviewsSection() {
  return (
    <div className="p5-business-two-column">
      <section className="p5-business-panel">
        <div className="p5-rating p5-rating--large">
          <strong>4,8</strong>
          <span>
            ★★★★★<small>1 240 подтверждённых отзывов</small>
          </span>
        </div>
        {[
          ['5', '88%'],
          ['4', '9%'],
          ['3', '2%'],
          ['2', '0,6%'],
          ['1', '0,4%'],
        ].map(([star, percent]) => (
          <div className="p5-rating-row" key={star}>
            <span>{star} ★</span>
            <i>
              <b style={{ width: percent }} />
            </i>
            <strong>{percent}</strong>
          </div>
        ))}
      </section>
      <section className="p5-business-panel">
        <header>
          <h2>Последние отзывы</h2>
        </header>
        {demoBusiness.reviews.map((review) => (
          <blockquote key={review.author}>
            <strong>{review.author}</strong>
            <p>{review.text}</p>
            <small>{review.date}</small>
          </blockquote>
        ))}
      </section>
    </div>
  );
}

function DirectorySection({ section }: { readonly section: string }) {
  const content: Readonly<Record<string, readonly (readonly string[])[]>> = {
    clients: [
      ['Алексей К.', 'Домашний интернет', 'Подключение 22 августа', 'Согласие подтверждено'],
      ['Мария Л.', 'Проф. гигиена', 'Запись 25 августа', 'Согласие подтверждено'],
      ['Игорь П.', 'Мобильная связь', 'В работе', 'Контакт разрешён'],
    ],
    team: [
      ['Алексей Петров', 'Владелец организации', 'Все бизнес-разделы', 'Активен'],
      ['Ольга Смирнова', 'Менеджер предложений', 'Спрос и предложения', 'Активна'],
      ['Денис Орлов', 'Операционный менеджер', 'Заявки и квоты', 'Активен'],
    ],
    documents: [
      ['Условия поставщика v3', 'Операционный документ', '18 августа 2026', 'Действует'],
      ['Акт CPA · июль', 'Финансовый документ', '5 августа 2026', 'Подписан'],
      ['Политика обработки данных', 'Безопасность', '1 августа 2026', 'Действует'],
    ],
    settings: [
      ['Профиль организации', 'Название, реквизиты и подтверждение', 'Проверено'],
      ['Уведомления', 'Новые торги, выбор и исполнение', 'Включены'],
      ['Безопасность', 'Сессии, роли и журнал действий', 'Требует production auth'],
    ],
  };
  const rows = content[section] ?? [];
  return (
    <section className="p5-business-panel p5-wide-panel">
      <header>
        <h2>{sectionTitles[section]?.[0]}</h2>
        <button disabled title="Изменение требует защищённого production API" type="button">
          Добавить — после подключения API
        </button>
      </header>
      <div className="p5-directory-list">
        {rows.map((row) => (
          <article key={row[0]}>
            <span>{row[0]?.slice(0, 2)}</span>
            <div>
              <strong>{row[0]}</strong>
              <small>{row[1]}</small>
            </div>
            <p>{row[2]}</p>
            <em>{row[3] ?? 'Настроено'}</em>
          </article>
        ))}
      </div>
      <p className="p5-panel-note">
        Изменения, права и персональные данные станут доступны только после подключения серверного
        организационного контура.
      </p>
    </section>
  );
}

export function BusinessDashboard({ section }: { readonly section: string }) {
  let content;
  if (section === 'business') content = <BusinessHome />;
  else if (section === 'demand') content = <DemandSection />;
  else if (section === 'auctions') content = <AuctionsSection />;
  else if (section === 'offers') content = <OffersSection />;
  else if (section === 'capacity') content = <CapacitySection />;
  else if (section === 'bookings') content = <BookingsSection />;
  else if (section === 'analytics') content = <AnalyticsSection />;
  else if (section === 'finance') content = <FinanceSection />;
  else if (section === 'reviews') content = <ReviewsSection />;
  else content = <DirectorySection section={section} />;
  return (
    <main className="p5-business-page">
      <Header section={section} />
      {content}
    </main>
  );
}
