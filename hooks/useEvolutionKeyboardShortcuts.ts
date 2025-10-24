import { useEffect } from 'react';

/**
 * Hook para atalhos de teclado da página de evoluções
 * 
 * Atalhos disponíveis:
 * - Ctrl+1 a Ctrl+6: Expande/colapsa card específico
 * - Ctrl+Shift+E: Expande todos os cards
 * - Ctrl+Shift+C: Colapsa todos os cards
 */
export const useEvolutionKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Só funciona se Ctrl estiver pressionado
      if (!event.ctrlKey) return;

      // Ignora se estiver em um input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const cardIds = [
        'personal-data',
        'session-history',
        'metrics',
        'treatment-plan',
        'exercises',
        'pain-map',
      ];

      // Ctrl+Shift+E: Expande todos
      if (event.shiftKey && event.key === 'E') {
        event.preventDefault();
        const evolutionCards = (window as any).__evolutionCards;
        if (evolutionCards && evolutionCards.expandAll) {
          evolutionCards.expandAll();
        }
        return;
      }

      // Ctrl+Shift+C: Colapsa todos
      if (event.shiftKey && event.key === 'C') {
        event.preventDefault();
        const evolutionCards = (window as any).__evolutionCards;
        if (evolutionCards && evolutionCards.collapseAll) {
          evolutionCards.collapseAll();
        }
        return;
      }

      // Ctrl+1 a Ctrl+6: Toggle card específico
      const number = parseInt(event.key);
      if (number >= 1 && number <= 6) {
        event.preventDefault();
        const cardId = cardIds[number - 1];
        const evolutionCards = (window as any).__evolutionCards;
        if (evolutionCards && evolutionCards.toggleCard) {
          evolutionCards.toggleCard(cardId);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

export default useEvolutionKeyboardShortcuts;

