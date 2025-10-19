import { useEffect, useRef } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  initialFocus?: HTMLElement | null;
}

export const useFocusTrap = ({ enabled = true, initialFocus }: FocusTrapOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Focusable elements selector
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus initial element or first focusable element
    if (initialFocus) {
      initialFocus.focus();
    } else if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enabled, initialFocus]);

  return containerRef;
};

export default useFocusTrap;

