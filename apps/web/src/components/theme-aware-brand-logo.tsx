import { BrandLogo } from '@bidly/ui';

type LogoKind = 'lockup' | 'wordmark';
type Surface = 'adaptive' | 'dark' | 'light';

export function ThemeAwareBrandLogo({
  className,
  kind = 'wordmark',
  surface = 'adaptive',
}: {
  readonly className?: string;
  readonly kind?: LogoKind;
  readonly surface?: Surface;
}) {
  const lightVariant = kind === 'lockup' ? 'lockup-on-light' : 'on-light';
  const darkVariant = kind === 'lockup' ? 'lockup-on-dark' : 'on-dark';

  if (surface === 'dark') return <BrandLogo className={className} variant={darkVariant} />;
  if (surface === 'light') return <BrandLogo className={className} variant={lightVariant} />;

  return (
    <span className={['bidly-theme-brand', className].filter(Boolean).join(' ')}>
      <BrandLogo className="bidly-theme-brand__light" variant={lightVariant} />
      <BrandLogo className="bidly-theme-brand__dark" variant={darkVariant} />
    </span>
  );
}
