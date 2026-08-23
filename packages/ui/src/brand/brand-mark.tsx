import type { ComponentPropsWithoutRef } from 'react';

export type BrandMarkProps = Omit<ComponentPropsWithoutRef<'img'>, 'src'> & {
  readonly src?: string;
};

/**
 * Bidly's approved raster ribbon mark. It is decorative by default; consumers
 * that render the mark without `BrandLogo` can provide an accessible name.
 */
export function BrandMark({
  alt = '',
  className,
  height = 1024,
  src = '/brand/bidly-mark.png',
  width = 1024,
  ...imageProps
}: BrandMarkProps) {
  const hasAccessibleName = alt.length > 0 || imageProps['aria-label'] !== undefined;

  return (
    // The shared UI package is framework-agnostic; importing next/image here would couple it to Next.js.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...imageProps}
      alt={alt}
      aria-hidden={hasAccessibleName ? undefined : true}
      className={['bidly-brand-mark', className].filter(Boolean).join(' ')}
      height={height}
      role={hasAccessibleName ? 'img' : undefined}
      src={src}
      width={width}
    />
  );
}
