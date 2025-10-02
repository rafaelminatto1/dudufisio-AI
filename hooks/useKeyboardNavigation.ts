import { useEffect, useCallback, useState } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onSpace?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onSpace,
    onTab,
    onShiftTab,
    enabled = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, shiftKey } = event;

    switch (key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Tab':
        if (shiftKey && onShiftTab) {
          event.preventDefault();
          onShiftTab();
        } else if (!shiftKey && onTab) {
          event.preventDefault();
          onTab();
        }
        break;
    }
  }, [
    enabled,
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onSpace,
    onTab,
    onShiftTab
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

// Hook específico para navegação em listas
export const useListNavigation = (
  items: any[],
  initialIndex = 0,
  options: {
    onSelect?: (item: any, index: number) => void;
    onNavigate?: (index: number) => void;
    enabled?: boolean;
  } = {}
) => {
  const { onSelect, onNavigate, enabled = true } = options;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const navigateUp = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  }, [currentIndex, items.length, onNavigate]);

  const navigateDown = useCallback(() => {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  }, [currentIndex, items.length, onNavigate]);

  const selectCurrent = useCallback(() => {
    if (items[currentIndex]) {
      onSelect?.(items[currentIndex], currentIndex);
    }
  }, [items, currentIndex, onSelect]);

  useKeyboardNavigation({
    onArrowUp: navigateUp,
    onArrowDown: navigateDown,
    onEnter: selectCurrent,
    onSpace: selectCurrent,
    enabled
  });

  return {
    currentIndex,
    setCurrentIndex,
    navigateUp,
    navigateDown,
    selectCurrent
  };
};

// Hook para navegação por teclado em modais
export const useModalKeyboardNavigation = (onClose: () => void) => {
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: true
  });

  // Focar o primeiro elemento focável quando o modal abrir
  useEffect(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);
};
