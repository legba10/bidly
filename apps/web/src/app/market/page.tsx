import { BidlyIcon } from '@bidly/ui';

import { MarketCatalog } from '../../components/market-catalog';
import { PublicFooter, PublicHeader } from '../../components/public-navigation';
import { isBidlyDemoMode } from '../../demo/marketplace-demo';
import { ruRU } from '../../i18n/messages/ru-RU';

export default async function MarketPage({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly city?: string | readonly string[];
    readonly q?: string | readonly string[];
    readonly stage?: string | readonly string[];
  }>;
}) {
  const values = await searchParams;
  const searchValue = typeof values.q === 'string' ? values.q : '';
  const city = typeof values.city === 'string' ? values.city : 'ALL';
  const stage = typeof values.stage === 'string' ? values.stage : 'ALL';
  const demoMode = isBidlyDemoMode();

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="p5-market-page" id="main-content">
        <section className="p5-market-hero">
          <div>
            <div className="p5-hero__meta">
              <p className="bidly-eyebrow">Рынок Bidly</p>
            </div>
            <h1>Спрос уже есть. Выберите, где усилить его своим запросом</h1>
            <p>
              {demoMode
                ? 'Фильтруйте по городу и этапу. Внутри каждой карточки — участники, подтверждённый спрос, сопоставимая цена и реальная доступность.'
                : 'Выберите направление. Проверенные показатели спроса, условия и доступность появятся только после подключения серверных данных.'}
            </p>
          </div>
          <form className="p5-market-filters" method="get">
            <label>
              <span>Что нужно</span>
              <input
                defaultValue={searchValue}
                name="q"
                placeholder="Интернет, спортзал, колёса…"
                type="search"
              />
            </label>
            <label>
              <span>Город</span>
              <select defaultValue={city} name="city">
                <option value="ALL">Все города</option>
                <option>Сургут</option>
                <option>Тюмень</option>
                <option>Нижневартовск</option>
              </select>
            </label>
            <label>
              <span>Этап</span>
              <select defaultValue={stage} name="stage">
                <option value="ALL">Все этапы</option>
                <option value="COLLECTING">Собираем спрос</option>
                <option value="PROPOSING">Компании предлагают</option>
                <option value="READY">Предложения готовы</option>
                <option value="BOOKING">Доступна запись</option>
              </select>
            </label>
            <button type="submit">
              Показать <BidlyIcon name="arrow-right" />
            </button>
          </form>
        </section>
        <section className="p5-market-content">
          <MarketCatalog city={city} query={searchValue} stage={stage} />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
