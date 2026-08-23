import type { ComponentPropsWithoutRef } from 'react';

import { BrandMark } from './brand-mark.js';

export type BrandLogoVariant =
  'lockup-on-dark' | 'lockup-on-light' | 'mark' | 'on-dark' | 'on-light';

export type BrandLogoProps = ComponentPropsWithoutRef<'span'> & {
  /** The surface is part of the variant name so the contrast choice cannot be ambiguous. */
  readonly variant?: BrandLogoVariant;
};

const assets = {
  'lockup-on-dark': {
    height: 865,
    png: '/brand/bidly-lockup-on-dark.png',
    width: 2875,
  },
  'lockup-on-light': {
    height: 865,
    png: '/brand/bidly-lockup-on-light.png',
    width: 2875,
  },
  'on-dark': {
    height: 610,
    png: '/brand/bidly-logo-on-dark.png',
    width: 1935,
  },
  'on-light': {
    height: 610,
    png: '/brand/bidly-logo-on-light.png',
    width: 1935,
  },
} as const;

export function BrandLogo({ className, variant = 'on-light', ...spanProps }: BrandLogoProps) {
  const classes = ['bidly-brand-logo', className].filter(Boolean).join(' ');
  const asset = variant === 'mark' ? null : assets[variant];

  return (
    <span {...spanProps} aria-label="Bidly" className={classes} data-variant={variant} role="img">
      {asset === null ? (
        <BrandMark />
      ) : (
        // The approved transparent PNG is rendered directly. No CSS recolouring or backing plate.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          aria-hidden="true"
          className="bidly-brand-logo__image"
          height={asset.height}
          src={asset.png}
          width={asset.width}
        />
      )}
    </span>
  );
}

export function BrandLogoOnLight(props: Omit<BrandLogoProps, 'variant'>) {
  return <BrandLogo {...props} variant="on-light" />;
}

export function BrandLogoOnDark(props: Omit<BrandLogoProps, 'variant'>) {
  return <BrandLogo {...props} variant="on-dark" />;
}

export function BrandLogoCompact(props: Omit<BrandLogoProps, 'variant'>) {
  return <BrandLogo {...props} variant="mark" />;
}
