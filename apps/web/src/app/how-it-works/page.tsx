import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { JourneyExplorer } from '../../components/journey-explorer';
import { PublicFooter, PublicHeader } from '../../components/public-navigation';
import { isBidlyDemoMode } from '../../demo/marketplace-demo';

export default function HowItWorksPage() {
  const demoMode = isBidlyDemoMode();
  return (
    <>
      <PublicHeader />
      <main className="p5-info-page">
        <section className="p5-info-hero">
          <p className="bidly-eyebrow">Как работает Bidly</p>
          <h1>От одного запроса — к условиям, за которые конкурируют компании</h1>
          <p>
            Семь шагов показывают путь покупателя. Внутри система проверяет совместимость спроса,
            версии условий, конечную доступность и согласия.
          </p>
          <Link className="bidly-link-button bidly-link-button--primary" href="/market">
            Найти направление <BidlyIcon name="arrow-right" />
          </Link>
        </section>
        <JourneyExplorer demoMode={demoMode} />
        <section className="p5-trust p5-info-trust">
          <div>
            <p className="bidly-eyebrow">Что остаётся неизменным</p>
            <h2>Ваш выбор важнее алгоритма</h2>
            <p className="p5-trust__intro">
              Bidly помогает сравнивать условия и проверять доступность, но не выбирает поставщика
              за покупателя.
            </p>
          </div>
          <div className="p5-trust__grid">
            <article>
              <BidlyIcon name="users" />
              <h3>Не один победитель</h3>
              <p>
                В рынке могут быть несколько допустимых поставщиков; каждый покупатель выбирает сам.
              </p>
            </article>
            <article>
              <BidlyIcon name="shield" />
              <h3>Данные по действию</h3>
              <p>
                Поставщик получает персональные данные только после соответствующего выбора и
                согласия.
              </p>
            </article>
            <article>
              <BidlyIcon name="calendar" />
              <h3>Capacity конечна</h3>
              <p>Подключение или слот резервируется с повторной проверкой доступности.</p>
            </article>
            <article>
              <BidlyIcon name="check-circle" />
              <h3>Полная стоимость</h3>
              <p>Скрытые доплаты и подмена рекламной ценой запрещены.</p>
            </article>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
