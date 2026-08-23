import { BidlyIcon, type BidlyIconName } from '@bidly/ui';
import Link from 'next/link';

import { ruRU } from '../../i18n/messages/ru-RU';

const stepIcons: readonly BidlyIconName[] = [
  'calendar',
  'users',
  'building',
  'check-circle',
  'shield',
];

export function HowItWorks() {
  const copy = ruRU.landing.how;

  return (
    <section className="bidly-home-section bidly-home-how" id="home-how-it-works">
      <header className="bidly-home-section__heading">
        <div>
          <p className="bidly-home-eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <p>{copy.lead}</p>
      </header>
      <ol className="bidly-home-steps">
        {copy.steps.map((step, index) => (
          <li key={step.label}>
            <span className="bidly-home-steps__number">0{index + 1}</span>
            <span className="bidly-home-steps__icon">
              <BidlyIcon name={stepIcons[index] ?? 'check-circle'} />
            </span>
            <h3>{step.label}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
      <Link className="bidly-home-text-link" href="/how-it-works">
        Подробнее о механике Bidly <BidlyIcon name="arrow-right" />
      </Link>
    </section>
  );
}
