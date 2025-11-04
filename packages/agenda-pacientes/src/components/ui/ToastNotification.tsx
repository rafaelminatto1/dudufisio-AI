import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

interface ToastNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right',
  className,
}) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onClose(id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isHovered, id, onClose]);

  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    success: {
      bg: 'bg-health-success/10 border-health-success/20',
      icon: 'text-health-success',
      progress: 'bg-health-success',
    },
    error: {
      bg: 'bg-health-error/10 border-health-error/20',
      icon: 'text-health-error',
      progress: 'bg-health-error',
    },
    warning: {
      bg: 'bg-health-warning/10 border-health-warning/20',
      icon: 'text-health-warning',
      progress: 'bg-health-warning',
    },
    info: {
      bg: 'bg-primary-500/10 border-primary-500/20',
      icon: 'text-primary-500',
      progress: 'bg-primary-500',
    },
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
      className={cn(
        'fixed z-50 w-full max-w-sm glass-card rounded-lg shadow-lg border',
        colors.bg,
        positionClasses[position],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colors.icon)} />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
            {message && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            )}
          </div>

          <button
            onClick={() => onClose(id)}
            className="p-1 rounded-md hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors duration-200 touch-target"
            aria-label="Fechar notificação"
            title="Fechar notificação"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', colors.progress)}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
  maxToasts = 5,
}) => {
  return (
    <div className="fixed z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.slice(0, maxToasts).map((toast, index) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={onClose}
            position={position}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 10}px)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ToastNotification, ToastContainer };
export default ToastContainer;
