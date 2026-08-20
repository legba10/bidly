import { BidlyIcon } from '@bidly/ui';

import { MarketCatalog } from '../../components/market-catalog';
import { PublicFooter, PublicHeader } from '../../components/public-navigation';
import { ruRU } from '../../i18n/messages/ru-RU';

export default async function MarketPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly q?: string | readonly string[] }>;
}) {
  const query = (await searchParams).q;
  const searchValue = typeof query === 'string' ? query : '';

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="bidly-market-page" id="main-content">
        <section className="bidly-market-page__intro">
          <p className="bidly-eyebrow">{ruRU.market.eyebrow}</p>
          <h1>{ruRU.market.title}</h1>
          <p>{ruRU.market.lead}</p>
          <form className="bidly-market-search" method="get">
            <label htmlFor="market-search">{ruRU.market.searchLabel}</label>
            <div>
              <input
                defaultValue={searchValue}
                id="market-search"
                name="q"
                placeholder={ruRU.market.searchPlaceholder}
                type="search"
              />
              <button type="submit">
                {ruRU.market.searchAction}
                <BidlyIcon name="arrow-right" />
              </button>
            </div>
          </form>
        </section>
        <MarketCatalog query={searchValue} />
      </main>
      <PublicFooter />
    </>
  );
}
