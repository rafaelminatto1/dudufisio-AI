import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const containerRef = useFocusTrap({ enabled: isOpen });

  useKeyboardNavigation({
    enabled: isOpen,
    onEscape: onClose
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Announce modal to screen readers
  useEffect(() => {
    if (isOpen) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'alert');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = `Modal aberto: ${title}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);

      return () => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      };
    }
  }, [isOpen, title]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={containerRef}
        className={`
          relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-hidden flex flex-col
          animate-scale-in
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-fisio-neutral-200">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-fisio-neutral-800"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors focus-ring"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-fisio-neutral-600" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccessibleModal;

