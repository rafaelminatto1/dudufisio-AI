import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocus?: boolean;
  returnFocus?: boolean;
}

export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const { enabled = true, initialFocus = true, returnFocus = true } = options;
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Store current active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (initialFocus && firstElement) {
      firstElement.focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Return focus to previous element
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, initialFocus, returnFocus]);

  return containerRef;
}

/**
 * Hook para gerenciar focus automático em erro de formulário
 */
export function useFocusOnError<T extends Record<string, any>>(
  errors: T,
  formRef?: React.RefObject<HTMLFormElement>
) {
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    const firstErrorKey = errorKeys[0];
    const element = formRef?.current?.querySelector<HTMLElement>(
      `[name="${firstErrorKey}"]`
    );

    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors, formRef]);
}

/**
 * Hook para anunciar mudanças para screen readers
 */
export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) {
      // Create announcer if it doesn't exist
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      announceRef.current = announcer;
    }

    announceRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = '';
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (announceRef.current) {
        document.body.removeChild(announceRef.current);
      }
    };
  }, []);

  return announce;
}

