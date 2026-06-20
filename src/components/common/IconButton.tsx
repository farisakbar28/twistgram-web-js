import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ============================================================
// Types
// ============================================================

export type IconButtonVariant = 'ghost' | 'surface' | 'primary' | 'danger';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string; // required for accessibility (aria-label)
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Show a numeric badge (e.g., notification count) */
  badge?: number;
  /** Active/selected state */
  active?: boolean;
}

// ============================================================
// Style maps
// ============================================================

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:   'text-neutral-400 hover:text-neutral-100 hover:bg-surface-800 active:bg-surface-700',
  surface: 'bg-surface-800 text-neutral-300 hover:bg-surface-700 hover:text-neutral-100 border border-surface-700',
  primary: 'bg-brand-gradient text-white hover:opacity-90 hover:shadow-glow-sm',
  danger:  'text-neutral-400 hover:text-danger-400 hover:bg-danger-500/10',
};

const sizeStyles: Record<IconButtonSize, { btn: string; icon: string; badge: string }> = {
  xs: { btn: 'h-6 w-6',   icon: 'text-sm',   badge: 'h-3 w-3 text-[8px] -top-0.5 -right-0.5' },
  sm: { btn: 'h-8 w-8',   icon: 'text-base', badge: 'h-4 w-4 text-[9px] -top-0.5 -right-0.5' },
  md: { btn: 'h-9 w-9',   icon: 'text-xl',   badge: 'h-4 w-4 text-[9px] -top-0.5 -right-0.5' },
  lg: { btn: 'h-11 w-11', icon: 'text-2xl',  badge: 'h-5 w-5 text-[10px] -top-1 -right-1' },
};

// ============================================================
// Component
// ============================================================

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = 'ghost',
      size = 'md',
      badge,
      active = false,
      className = '',
      disabled,
      ...rest
    },
    ref
  ) => {
    const s = sizeStyles[size];

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        disabled={disabled}
        className={[
          'relative inline-flex items-center justify-center rounded-xl',
          'transition-all duration-200 shrink-0',
          variantStyles[variant],
          s.btn,
          active && variant === 'ghost' ? 'text-brand-400 bg-brand-500/10' : '',
          disabled ? 'opacity-40 cursor-not-allowed' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        <span className={s.icon}>{icon}</span>

        {/* Notification badge */}
        {badge !== undefined && badge > 0 && (
          <span
            className={[
              'absolute rounded-full bg-danger-500 text-white font-bold',
              'flex items-center justify-center',
              s.badge,
            ].join(' ')}
            aria-label={`${badge} notifikasi`}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
