import type { ComponentPropsWithoutRef } from 'react';

export type BrandLogoProps = ComponentPropsWithoutRef<'span'> & {
  readonly compact?: boolean;
};

export function BrandLogo({ className, compact = false, ...spanProps }: BrandLogoProps) {
  const classes = ['bidly-brand-logo', className].filter(Boolean).join(' ');

  return (
    <span {...spanProps} aria-label="Bidly" className={classes} data-compact={compact} role="img">
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 6.5h10.2a4 4 0 0 1 0 8H5v-8Z" fill="currentColor" opacity="0.94" />
        <path d="M5 14.5h12.4a3.6 3.6 0 0 1 0 7.2H5v-7.2Z" fill="currentColor" opacity="0.7" />
        <path d="M8.5 9.2h4.8M8.5 18.1h7" stroke="white" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
      {compact ? null : <span className="bidly-brand-logo__word">BIDLY</span>}
    </span>
  );
}
