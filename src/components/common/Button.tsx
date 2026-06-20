import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

// ============================================================
// Types
// ============================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// ============================================================
// Style maps
// ============================================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-gradient text-white font-semibold',
    'hover:opacity-90 hover:shadow-glow-sm',
    'active:opacity-80 active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-surface-800 text-neutral-100 font-medium border border-surface-700',
    'hover:bg-surface-700 hover:border-surface-600',
    'active:bg-surface-800 active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-300 font-medium',
    'hover:bg-surface-800 hover:text-neutral-100',
    'active:bg-surface-700 active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  outline: [
    'bg-transparent border border-brand-500 text-brand-400 font-medium',
    'hover:bg-brand-500/10 hover:text-brand-300',
    'active:bg-brand-500/20 active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-danger-600 text-white font-semibold',
    'hover:bg-danger-500 hover:shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    'active:bg-danger-700 active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-3 text-xs rounded-lg gap-1',
  sm: 'h-8 px-4 text-sm rounded-xl gap-1.5',
  md: 'h-10 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-7 text-base rounded-2xl gap-2',
};

// ============================================================
// Component
// ============================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'select-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <Spinner size="sm" className="text-current opacity-70" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
