import { useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ============================================================
// Types
// ============================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: ModalSize;
  /** If false, clicking the backdrop does NOT close the modal */
  closeOnBackdrop?: boolean;
  /** If false, pressing Escape does NOT close the modal */
  closeOnEsc?: boolean;
  footer?: ReactNode;
  /** Hide the default header (title + close button) */
  hideHeader?: boolean;
}

// ============================================================
// Size map
// ============================================================

const sizeMap: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-full mx-4',
};

// ============================================================
// Close Icon (inline SVG — no icon lib dependency)
// ============================================================

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ============================================================
// Component
// ============================================================

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer,
  hideHeader = false,
}: ModalProps): ReactNode => {
  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onClose();
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full bg-surface-900 rounded-2xl shadow-modal',
          'border border-surface-700',
          'animate-scale-in',
          'flex flex-col max-h-[90vh]',
          sizeMap[size],
        ].join(' ')}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="flex items-start justify-between p-5 border-b border-surface-700">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-neutral-50 truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-0.5 text-sm text-neutral-400"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className={[
                'ml-3 p-1.5 rounded-xl text-neutral-500',
                'hover:text-neutral-200 hover:bg-surface-800',
                'transition-all duration-150 shrink-0',
              ].join(' ')}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-surface-700">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
