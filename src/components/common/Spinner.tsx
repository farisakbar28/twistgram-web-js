import type { ReactNode } from 'react';

// ============================================================
// Types
// ============================================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string; // for accessibility
}

// ============================================================
// Style map
// ============================================================

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
};

// ============================================================
// Component
// ============================================================

const Spinner = ({ size = 'md', className = '', label = 'Memuat...' }: SpinnerProps): ReactNode => {
  return (
    <span role="status" aria-label={label} className={`inline-flex items-center justify-center ${className}`}>
      <span
        className={[
          'rounded-full border-current border-r-transparent',
          'animate-spin',
          sizeMap[size],
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default Spinner;
