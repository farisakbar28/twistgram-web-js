import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

// ============================================================
// Types
// ============================================================

export type InputVariant = 'default' | 'error' | 'success';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Replaces rightIcon with a clickable action (e.g., show/hide password) */
  rightAction?: ReactNode;
  required?: boolean;
  id: string; // required for label association & accessibility
}

// ============================================================
// Style maps
// ============================================================

const variantBorder: Record<InputVariant, string> = {
  default: 'border-surface-700 focus:border-brand-500 focus:ring-brand-500/20',
  error:   'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
  success: 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
};

const variantHelper: Record<InputVariant, string> = {
  default: 'text-neutral-500',
  error:   'text-danger-400',
  success: 'text-success-400',
};

// ============================================================
// Component
// ============================================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      helperText,
      variant = 'default',
      leftIcon,
      rightIcon,
      rightAction,
      required,
      className = '',
      disabled,
      ...rest
    },
    ref
  ) => {
    const hasRight = rightAction || rightIcon;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-neutral-300 select-none"
          >
            {label}
            {required && <span className="text-brand-400 ml-0.5">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3.5 text-neutral-500 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-required={required}
            aria-invalid={variant === 'error'}
            aria-describedby={helperText ? `${id}-helper` : undefined}
            className={[
              // Base
              'w-full bg-surface-800 rounded-xl px-4 py-3',
              'text-sm text-neutral-50 placeholder-neutral-500',
              'border transition-all duration-200',
              'focus:outline-none focus:ring-2',
              // Variant border
              variantBorder[variant],
              // Icon padding adjustments
              leftIcon ? 'pl-10' : '',
              hasRight ? 'pr-10' : '',
              // Disabled
              disabled
                ? 'opacity-50 cursor-not-allowed bg-surface-900'
                : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />

          {/* Right icon / action */}
          {hasRight && (
            <span className="absolute right-3.5 text-neutral-500">
              {rightAction ?? rightIcon}
            </span>
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            id={`${id}-helper`}
            className={`text-xs ${variantHelper[variant]}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
