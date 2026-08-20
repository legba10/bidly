import type { ComponentPropsWithoutRef } from 'react';

export type BrandWordmarkProps = ComponentPropsWithoutRef<'span'>;

export function BrandWordmark({ className, ...spanProps }: BrandWordmarkProps) {
  return (
    <span {...spanProps} className={['bidly-brand-wordmark', className].filter(Boolean).join(' ')}>
      BIDLY
    </span>
  );
}
