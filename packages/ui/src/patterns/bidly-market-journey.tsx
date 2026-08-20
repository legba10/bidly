'use client';

import { useState } from 'react';

export interface BidlyMarketJourneyStep {
  readonly description: string;
  readonly label: string;
}

export interface BidlyMarketJourneyProps {
  readonly steps: readonly BidlyMarketJourneyStep[];
  readonly title: string;
}

/** A product explanation pattern; it has no auction state or business logic. */
export function BidlyMarketJourney({ steps, title }: BidlyMarketJourneyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];

  return (
    <section aria-label={title} className="bidly-market-journey">
      <ol className="bidly-market-journey__steps">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={step.label}>
              <button
                aria-current={isActive ? 'step' : undefined}
                className="bidly-market-journey__step"
                data-active={isActive}
                onClick={() => {
                  setActiveIndex(index);
                }}
                type="button"
              >
                <span aria-hidden="true" className="bidly-market-journey__index">
                  {index + 1}
                </span>
                <span className="bidly-market-journey__label">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {activeStep ? (
        <div aria-live="polite" className="bidly-market-journey__detail">
          <span aria-hidden="true" className="bidly-market-journey__detail-index">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <div>
            <p>{activeStep.label}</p>
            <span>{activeStep.description}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
