import type { ReactNode } from 'react';

import { BidlyIcon } from '../icons/bidly-icon.js';

export interface IntegrationUnavailableProps {
  readonly action?: ReactNode;
  readonly detail: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly titleAs?: 'h1' | 'h2';
}

export function IntegrationUnavailable({
  action,
  detail,
  eyebrow = 'Функция готовится',
  title,
  titleAs = 'h1',
}: IntegrationUnavailableProps) {
  return (
    <section
      aria-labelledby="integration-unavailable-title"
      className="bidly-integration-unavailable"
    >
      <span aria-hidden="true" className="bidly-integration-unavailable__icon">
        <BidlyIcon name="shield" />
      </span>
      <div className="bidly-integration-unavailable__content">
        <p className="bidly-integration-unavailable__eyebrow">{eyebrow}</p>
        {titleAs === 'h1' ? (
          <h1 className="bidly-integration-unavailable__title" id="integration-unavailable-title">
            {title}
          </h1>
        ) : (
          <h2 className="bidly-integration-unavailable__title" id="integration-unavailable-title">
            {title}
          </h2>
        )}
        <p className="bidly-integration-unavailable__detail">{detail}</p>
        {action ? <div className="bidly-integration-unavailable__action">{action}</div> : null}
      </div>
    </section>
  );
}
