/**
 * 🎯 UTILITÁRIOS DE ACESSIBILIDADE
 * 
 * Conjunto de funções e hooks para melhorar a acessibilidade
 * da aplicação DuduFisio AI
 */

import { useEffect, useRef, useState } from 'react';

// Tipos para navegação por teclado
export interface KeyboardNavigation {
  onKeyDown: (event: React.KeyboardEvent) => void;
  tabIndex: number;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Hook para navegação por teclado em listas
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (item: any, index: number) => void,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
  } = {}
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { loop = true, orientation = 'vertical', disabled = false } = options;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    const { key } = event;
    const isVertical = orientation === 'vertical';
    
    let newIndex = focusedIndex;

    switch (key) {
      case isVertical ? 'ArrowDown' : 'ArrowRight':
        event.preventDefault();
        newIndex = loop 
          ? (focusedIndex + 1) % items.length
          : Math.min(focusedIndex + 1, items.length - 1);
        break;
        
      case isVertical ? 'ArrowUp' : 'ArrowLeft':
        event.preventDefault();
        newIndex = loop
          ? (focusedIndex - 1 + items.length) % items.length
          : Math.max(focusedIndex - 1, 0);
        break;
        
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
        
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        setFocusedIndex(-1);
        break;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: focusedIndex === index ? 0 : -1,
      'aria-selected': focusedIndex === index,
      onFocus: () => setFocusedIndex(index),
      onKeyDown: handleKeyDown
    })
  };
};

// Hook para gerenciar foco
export const useFocusManagement = () => {
  const focusableElements = useRef<HTMLElement[]>([]);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const registerElement = (element: HTMLElement | null) => {
    if (element && !focusableElements.current.includes(element)) {
      focusableElements.current.push(element);
    }
  };

  const unregisterElement = (element: HTMLElement | null) => {
    if (element) {
      focusableElements.current = focusableElements.current.filter(el => el !== element);
    }
  };

  const focusNext = () => {
    const currentIndex = focusableElements.current.findIndex(el => el === focusedElement);
    const nextIndex = (currentIndex + 1) % focusableElements.current.length;
    const nextElement = focusableElements.current[nextIndex];
    
    if (nextElement) {
      nextElement.focus();
      setFocusedElement(nextElement);
    }
  };

  const focusPrevious = () => {
    const currentIndex = focusableElements.current.findIndex(el => el === focusedElement);
    const prevIndex = currentIndex <= 0 
      ? focusableElements.current.length - 1 
      : currentIndex - 1;
    const prevElement = focusableElements.current[prevIndex];
    
    if (prevElement) {
      prevElement.focus();
      setFocusedElement(prevElement);
    }
  };

  const focusFirst = () => {
    const firstElement = focusableElements.current[0];
    if (firstElement) {
      firstElement.focus();
      setFocusedElement(firstElement);
    }
  };

  const focusLast = () => {
    const lastElement = focusableElements.current[focusableElements.current.length - 1];
    if (lastElement) {
      lastElement.focus();
      setFocusedElement(lastElement);
    }
  };

  return {
    registerElement,
    unregisterElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusedElement,
    setFocusedElement
  };
};

// Hook para anunciar mudanças para leitores de tela
export const useAnnouncer = () => {
  const [announcement, setAnnouncement] = useState<string>('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
    
    // Limpar após um tempo para permitir novos anúncios
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return {
    announcement,
    announce
  };
};

// Utilitários para ARIA
export const createAriaProps = (props: {
  label?: string;
  description?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'polite' | 'assertive' | 'off';
}) => {
  const ariaProps: Record<string, any> = {};

  if (props.label) ariaProps['aria-label'] = props.label;
  if (props.description) ariaProps['aria-describedby'] = props.description;
  if (props.expanded !== undefined) ariaProps['aria-expanded'] = props.expanded;
  if (props.selected !== undefined) ariaProps['aria-selected'] = props.selected;
  if (props.disabled !== undefined) ariaProps['aria-disabled'] = props.disabled;
  if (props.required !== undefined) ariaProps['aria-required'] = props.required;
  if (props.invalid !== undefined) ariaProps['aria-invalid'] = props.invalid;
  if (props.live) ariaProps['aria-live'] = props.live;

  return ariaProps;
};

// Hook para detectar preferências de movimento reduzido
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook para detectar preferências de contraste alto
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

// Utilitário para criar IDs únicos para elementos ARIA
export const createAriaId = (prefix: string = 'aria') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Hook para gerenciar skip links
export const useSkipLinks = () => {
  const skipLinks = [
    { id: 'main-content', label: 'Pular para conteúdo principal' },
    { id: 'navigation', label: 'Pular para navegação' },
    { id: 'search', label: 'Pular para busca' }
  ];

  const focusElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return { skipLinks, focusElement };
};


// Utilitário para validar acessibilidade
export const validateAccessibility = (element: HTMLElement): string[] => {
  const issues: string[] = [];

  // Verificar se tem label
  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    const label = element.querySelector('label');
    if (!label) {
      issues.push('Elemento sem label acessível');
    }
  }

  // Verificar contraste de cores
  const computedStyle = window.getComputedStyle(element);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;
  
  // Verificação básica de contraste (simplificada)
  if (color && backgroundColor) {
    // Implementar verificação de contraste real aqui
    // Por enquanto, apenas verificar se as cores existem
  }

  // Verificar se é focável
  if (element.tabIndex === -1 && !element.hasAttribute('tabindex')) {
    issues.push('Elemento interativo sem capacidade de foco');
  }

  return issues;
};

// Hook para monitorar acessibilidade
export const useAccessibilityMonitor = () => {
  const [issues, setIssues] = useState<string[]>([]);

  const checkElement = (element: HTMLElement) => {
    const elementIssues = validateAccessibility(element);
    setIssues(prev => [...prev, ...elementIssues]);
  };

  const clearIssues = () => setIssues([]);

  return { issues, checkElement, clearIssues };
};
