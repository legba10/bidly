import type { ReactNode } from 'react';

import { BidlyIcon, type BidlyIconName } from '../icons/bidly-icon.js';

import { StatusIndicator } from './status-indicator.js';

export interface DemandCardProps {
  readonly action?: ReactNode;
  readonly availability: string;
  readonly city: string;
  readonly comparableOffer: string;
  readonly deadline: string;
  readonly icon?: BidlyIconName;
  readonly participants: string;
  readonly saving: string;
  readonly stage: string;
  readonly summary: string;
  readonly title: string;
  readonly verified: string;
}

export function DemandCard({
  action,
  availability,
  city,
  comparableOffer,
  deadline,
  icon = 'users',
  participants,
  saving,
  stage,
  summary,
  title,
  verified,
}: DemandCardProps) {
  return (
    <article className="bidly-demand-card">
      <header>
        <span aria-hidden="true" className="bidly-demand-card__icon">
          <BidlyIcon name={icon} />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{city}</p>
        </div>
        <StatusIndicator label={stage} tone="info" />
      </header>
      <div className="bidly-demand-card__numbers">
        <div>
          <strong>{participants}</strong>
          <span>участников</span>
        </div>
        <div>
          <strong>{verified}</strong>
          <span>подтверждено</span>
        </div>
        <div>
          <strong>{comparableOffer}</strong>
          <span>сравнимая цена</span>
        </div>
      </div>
      <p className="bidly-demand-card__summary">{summary}</p>
      <footer>
        <span>
          {saving} · {availability}
        </span>
        <span>До конца: {deadline}</span>
        {action}
      </footer>
    </article>
  );
}
