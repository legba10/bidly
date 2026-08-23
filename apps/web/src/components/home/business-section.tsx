import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../../i18n/messages/ru-RU';

export function BusinessSection() {
  const { business, trust } = ruRU.landing;

  return (
    <>
      <section className="bidly-home-section bidly-home-trust">
        <div className="bidly-home-trust__copy">
          <p className="bidly-home-eyebrow">{trust.eyebrow}</p>
          <h2>{trust.title}</h2>
        </div>
        <ul>
          {trust.points.map((point) => (
            <li key={point}>
              <BidlyIcon name="check-circle" />
              {point}
            </li>
          ))}
        </ul>
      </section>
      <section className="bidly-home-section bidly-home-business">
        <div>
          <p className="bidly-home-eyebrow">{business.eyebrow}</p>
          <h2>{business.title}</h2>
          <p>{business.lead}</p>
          <Link className="bidly-home-button bidly-home-button--light" href="/business-info">
            {business.action}
            <BidlyIcon name="arrow-right" />
          </Link>
        </div>
        <ul>
          {business.points.map((point) => (
            <li key={point}>
              <BidlyIcon name="check-circle" />
              {point}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
