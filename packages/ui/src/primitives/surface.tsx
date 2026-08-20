import type { ComponentPropsWithoutRef } from 'react';

export type SurfaceProps = ComponentPropsWithoutRef<'section'> & {
  readonly elevation?: 'flat' | 'raised';
};

export function Surface({ className, elevation = 'flat', ...sectionProps }: SurfaceProps) {
  const classes = ['bidly-surface', className].filter(Boolean).join(' ');

  return <section {...sectionProps} className={classes} data-elevation={elevation} />;
}
