import { BidlyIcon, BrandLogo } from '@bidly/ui';
import Link from 'next/link';

import { PublicFooter, PublicHeader } from '../../components/public-navigation';

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main className="p5-info-page">
        <section className="p5-about-hero">
          <div>
            <p className="bidly-eyebrow">О Bidly</p>
            <h1>Рынок должен слышать реальную потребность, а не угадывать её по кликам</h1>
            <p>
              Bidly помогает покупателям объединять совместимый спрос, а компаниям — конкурировать
              полными условиями и качеством исполнения.
            </p>
          </div>
          <div>
            <BrandLogo variant="lockup-on-dark" />
          </div>
        </section>
        <section className="p5-about-story">
          <article>
            <span>01</span>
            <h2>Проблема</h2>
            <p>
              Покупатель видит рекламные цены и разрозненные условия. Поставщик тратит бюджет, не
              понимая, кто действительно готов выбрать услугу.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>Новый сигнал</h2>
            <p>
              Запрос начинается с потребности. Совместимый спрос формирует понятный объём, но не
              стирает личные условия и право выбора.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>Честный результат</h2>
            <p>
              Предложения сопоставимы по полной стоимости и доступности. Bidly получает комиссию
              поставщика только после подтверждённого исполнения.
            </p>
          </article>
        </section>
        <section className="p5-section p5-section--tinted p5-about-principles">
          <header className="p5-section__heading">
            <div>
              <p className="bidly-eyebrow">Наши принципы</p>
              <h2>Механика важнее обещаний</h2>
            </div>
          </header>
          <div className="p5-trust__grid">
            <article>
              <BidlyIcon name="users" />
              <h3>Выбор за человеком</h3>
              <p>Алгоритм не назначает поставщика. Подходящих предложений может быть несколько.</p>
            </article>
            <article>
              <BidlyIcon name="shield" />
              <h3>Приватность по умолчанию</h3>
              <p>Личные данные не становятся лидом до информированного действия покупателя.</p>
            </article>
            <article>
              <BidlyIcon name="check-circle" />
              <h3>Полная стоимость</h3>
              <p>Доплаты, срок и постпромо-цена входят в сравнение.</p>
            </article>
            <article>
              <BidlyIcon name="calendar" />
              <h3>Реальный объём</h3>
              <p>Capacity конечна и резервируется атомарно; перепродажа мест недопустима.</p>
            </article>
          </div>
        </section>
        <section className="p5-about-model">
          <div>
            <p className="bidly-eyebrow">Бизнес-модель</p>
            <h2>Покупатель платит поставщику напрямую</h2>
            <p>
              Договор на основную услугу заключается между покупателем и поставщиком. Bidly не
              удерживает деньги покупателя: комиссия CPA начисляется поставщику только после
              атрибутированного подтверждённого исполнения.
            </p>
          </div>
          <Link className="bidly-link-button bidly-link-button--primary" href="/how-it-works">
            Посмотреть механику <BidlyIcon name="arrow-right" />
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
