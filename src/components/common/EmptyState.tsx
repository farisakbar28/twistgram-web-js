import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

// ============================================================
// Types
// ============================================================

export interface EmptyStateProps {
  /** Optional icon to render, defaults to Inbox */
  icon?: React.ReactNode;
  title: string;
  description: string;
  /** Optional action button text */
  actionLabel?: string;
  /** Optional callback for action button click */
  onAction?: () => void;
  /** Optional loading state for the action button */
  actionLoading?: boolean;
  className?: string;
}

// ============================================================
// Component
// ============================================================

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="h-8 w-8" />,
  title,
  description,
  actionLabel,
  onAction,
  actionLoading = false,
  className = '',
}) => {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center p-8 md:p-12',
        'rounded-2xl border border-dashed border-surface-700/60 bg-surface-900/40',
        'backdrop-blur-sm transition-all duration-300 hover:border-surface-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Icon Container with subtle radial glow */}
      <div className="relative flex items-center justify-center p-5 rounded-2xl bg-surface-800 border border-surface-700 text-neutral-400 mb-5 shadow-card">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-brand-gradient opacity-10 rounded-2xl blur-md" />
        <div className="relative z-10 text-neutral-300">{icon}</div>
      </div>

      {/* Text Info */}
      <h3 className="text-lg font-bold text-neutral-100 mb-2 tracking-wide">
        {title}
      </h3>
      <p className="text-sm text-neutral-400 max-w-xs md:max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          loading={actionLoading}
          className="shadow-glow-sm hover:shadow-glow-md transition-shadow"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
