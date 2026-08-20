export interface MarketProgressStep {
  readonly label: string;
  readonly state: 'complete' | 'current' | 'upcoming';
}

export interface MarketProgressProps {
  readonly steps: readonly MarketProgressStep[];
  readonly title: string;
}

export function MarketProgress({ steps, title }: MarketProgressProps) {
  return (
    <section aria-label={title} className="bidly-market-progress">
      <p className="bidly-market-progress__title">{title}</p>
      <ol className="bidly-market-progress__list">
        {steps.map((step, index) => (
          <li className="bidly-market-progress__step" data-state={step.state} key={step.label}>
            <span aria-hidden="true" className="bidly-market-progress__index">
              {index + 1}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
