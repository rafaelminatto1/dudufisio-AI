'use client';

import { useEffect } from 'react';
import { announceToScreenReader, createSkipLink } from '~/lib/utils/accessibility';

/**
 * Provider para melhorias de acessibilidade
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Adiciona skip link para navegação por teclado
    const skipLink = createSkipLink('main-content', 'Pular para conteúdo principal');
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Adiciona listener para preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    prefersReducedMotion.addEventListener('change', handleChange);
    
    // Aplica inicialmente
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduce-motion');
    }

    return () => {
      document.body.removeChild(skipLink);
      prefersReducedMotion.removeEventListener('change', handleChange);
    };
  }, []);

  return <>{children}</>;
}

