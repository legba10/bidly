export const DEFAULT_LOCALE = 'ru-RU' as const;

export type SupportedLocale = typeof DEFAULT_LOCALE;
export type SupportedCurrency = 'RUB';

const NON_BREAKING_SPACE = '\u00A0';
const MINOR_UNITS_PER_RUBLE = 100n;

function absolute(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function decimalSeparator(locale: SupportedLocale): string {
  return (
    new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')
      ?.value ?? ','
  );
}

export function formatInteger(
  value: bigint | number,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    throw new RangeError('Integer formatting requires a safe integer or bigint.');
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

export function formatMoneyMinor(
  amountMinor: bigint,
  currency: SupportedCurrency = 'RUB',
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const magnitude = absolute(amountMinor);
  const whole = magnitude / MINOR_UNITS_PER_RUBLE;
  const fraction = magnitude % MINOR_UNITS_PER_RUBLE;
  const sign = amountMinor < 0n ? '−' : '';
  const formattedWhole = formatInteger(whole, locale);
  const formattedFraction =
    fraction === 0n ? '' : `${decimalSeparator(locale)}${fraction.toString().padStart(2, '0')}`;

  const currencySymbol: Record<SupportedCurrency, string> = { RUB: '₽' };

  return `${sign}${formattedWhole}${formattedFraction}${NON_BREAKING_SPACE}${currencySymbol[currency]}`;
}

export function formatPercentageBasisPoints(
  basisPoints: bigint,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const magnitude = absolute(basisPoints);
  const whole = magnitude / 100n;
  const fraction = magnitude % 100n;
  const sign = basisPoints < 0n ? '−' : basisPoints > 0n ? '+' : '';
  const formattedFraction =
    fraction === 0n
      ? ''
      : `${decimalSeparator(locale)}${fraction.toString().padStart(2, '0').replace(/0+$/, '')}`;

  return `${sign}${formatInteger(whole, locale)}${formattedFraction}%`;
}

export function formatDateTime(
  instant: Date | string,
  timeZone: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const value = instant instanceof Date ? instant : new Date(instant);

  if (Number.isNaN(value.getTime())) {
    throw new RangeError('Invalid date-time value.');
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(value);
}
