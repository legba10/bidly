import { BidlyIcon } from '../icons/bidly-icon.js';

export interface DemandPulseProps {
  readonly detail: string;
  readonly label: string;
}

export function DemandPulse({ detail, label }: DemandPulseProps) {
  return (
    <section aria-label={label} className="bidly-demand-pulse">
      <span aria-hidden="true" className="bidly-demand-pulse__network">
        <span />
        <span />
        <span />
        <span />
      </span>
      <div>
        <p className="bidly-demand-pulse__label">{label}</p>
        <p className="bidly-demand-pulse__detail">{detail}</p>
      </div>
      <BidlyIcon className="bidly-demand-pulse__icon" name="users" />
    </section>
  );
}
