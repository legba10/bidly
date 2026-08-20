import type { ComponentPropsWithoutRef } from 'react';

import { BrandMark } from './brand-mark.js';
import { BrandWordmark } from './brand-wordmark.js';

export type BrandLogoProps = ComponentPropsWithoutRef<'span'> & {
  readonly compact?: boolean;
  readonly tone?: 'brand' | 'light';
};

export function BrandLogo({
  className,
  compact = false,
  tone = 'brand',
  ...spanProps
}: BrandLogoProps) {
  const classes = ['bidly-brand-logo', className].filter(Boolean).join(' ');

  return (
    <span
      {...spanProps}
      aria-label="Bidly"
      className={classes}
      data-compact={compact}
      data-tone={tone}
      role="img"
    >
      <BrandMark />
      {compact ? null : <BrandWordmark />}
    </span>
  );
}
