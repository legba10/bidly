import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonLoadingState =
  | {
      readonly loading: true;
      readonly loadingLabel: string;
    }
  | {
      readonly loading?: false;
      readonly loadingLabel?: never;
    };

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
  ButtonLoadingState & {
    readonly children: ReactNode;
    readonly disabled?: boolean;
    readonly fullWidth?: boolean;
    readonly size?: 'small' | 'medium' | 'large';
    readonly variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled = false,
    fullWidth = false,
    loading = false,
    loadingLabel,
    size = 'medium',
    type = 'button',
    variant = 'primary',
    ...buttonProps
  },
  ref,
) {
  const classes = ['bidly-button', className].filter(Boolean).join(' ');

  return (
    <button
      {...buttonProps}
      ref={ref}
      aria-busy={loading || undefined}
      className={classes}
      data-full-width={fullWidth}
      data-size={size}
      data-variant={variant}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span aria-hidden="true" className="bidly-button__spinner" /> : null}
      <span>{children}</span>
      {loading ? <span className="bidly-sr-only">{loadingLabel}</span> : null}
    </button>
  );
});
