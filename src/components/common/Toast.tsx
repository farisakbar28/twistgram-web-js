import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

// ============================================================
// Types
// ============================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // duration in ms
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

// ============================================================
// Context
// ============================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================
// Toast Individual Component
// ============================================================

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const toastConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    iconClass: string;
    borderClass: string;
    progressBarClass: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClass: 'text-success-400',
    borderClass: 'border-success-500/20 hover:border-success-500/40',
    progressBarClass: 'bg-success-500',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    iconClass: 'text-danger-400',
    borderClass: 'border-danger-500/20 hover:border-danger-500/40',
    progressBarClass: 'bg-danger-500',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconClass: 'text-warning-400',
    borderClass: 'border-warning-500/20 hover:border-warning-500/40',
    progressBarClass: 'bg-warning-500',
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    iconClass: 'text-accent-400',
    borderClass: 'border-accent-500/20 hover:border-accent-500/40',
    progressBarClass: 'bg-accent-500',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, message, type, duration = 4000 } = toast;
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role="alert"
      className={[
        'relative flex items-start gap-3 p-4 rounded-xl shadow-modal',
        'bg-surface-800/90 backdrop-blur-md border border-surface-700 text-neutral-100',
        'w-full max-w-sm overflow-hidden select-none',
        'animate-toast-in transition-all duration-300',
        config.borderClass,
      ].join(' ')}
    >
      {/* Icon */}
      <span className={['flex-shrink-0 mt-0.5', config.iconClass].join(' ')}>
        {config.icon}
      </span>

      {/* Message */}
      <div className="flex-1 text-sm font-medium leading-relaxed pr-6">
        {message}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onClose(id)}
        className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-neutral-100 transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Animated time remaining bar */}
      <div
        className={[
          'absolute bottom-0 left-0 h-1 animate-progress',
          config.progressBarClass,
        ].join(' ')}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

// ============================================================
// Toast Provider Component
// ============================================================

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const toast = React.useMemo(
    () => ({
      success: (message: string, duration?: number) => addToast(message, 'success', duration),
      error: (message: string, duration?: number) => addToast(message, 'error', duration),
      warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
      info: (message: string, duration?: number) => addToast(message, 'info', duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}

      {/* Toast Overlay Container */}
      <div
        className={[
          'fixed z-[9999] flex flex-col gap-3',
          'bottom-4 right-4 md:bottom-6 md:right-6',
          'w-full max-w-sm px-4 md:px-0',
        ].join(' ')}
      >
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ============================================================
// Hook
// ============================================================

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
