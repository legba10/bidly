import { formatMoneyMinor, type SupportedCurrency } from '@bidly/config';

export interface MoneyValueProps {
  readonly amountMinor: bigint;
  readonly currency?: SupportedCurrency;
  readonly periodLabel?: string;
  readonly tone?: 'default' | 'positive';
}

export function MoneyValue({
  amountMinor,
  currency = 'RUB',
  periodLabel,
  tone = 'default',
}: MoneyValueProps) {
  const formattedAmount = formatMoneyMinor(amountMinor, currency);

  return (
    <data className="bidly-money" data-tone={tone} value={amountMinor.toString()}>
      <span>{formattedAmount}</span>
      {periodLabel ? <span className="bidly-money__period">/ {periodLabel}</span> : null}
    </data>
  );
}
