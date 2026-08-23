import { BidlyIcon } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../../i18n/messages/ru-RU';

export function HeroCopy() {
  const copy = ruRU.landing;

  return (
    <div className="bidly-home-hero__copy">
      <p className="bidly-home-eyebrow">{copy.eyebrow}</p>
      <h1>
        {copy.titleLines.map((line, index) => (
          <span
            className={index === copy.titleLines.length - 1 ? 'is-accent' : undefined}
            key={line}
          >
            {line}
          </span>
        ))}
      </h1>
      <p className="bidly-home-hero__lead">{copy.lead}</p>
      <div className="bidly-home-actions">
        <Link className="bidly-home-button bidly-home-button--primary" href="/market">
          {copy.primaryAction}
          <BidlyIcon name="arrow-right" />
        </Link>
        <Link className="bidly-home-button bidly-home-button--secondary" href="/how-it-works">
          {copy.secondaryAction}
        </Link>
      </div>
      <ul aria-label="Ключевые принципы Bidly" className="bidly-home-hero__proof">
        {copy.proof.map((item, index) => (
          <li key={item.title}>
            <BidlyIcon name={index === 0 ? 'users' : index === 1 ? 'building' : 'shield'} />
            <span>
              <strong>{item.title}</strong>
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
