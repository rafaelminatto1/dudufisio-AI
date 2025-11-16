/**
 * Hook para Atalhos de Teclado
 * Implementação de shortcuts globais
 */

import { useEffect } from 'react';

type KeyboardHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Atalhos pré-configurados para o sistema de exercícios
export const useExerciseShortcuts = (callbacks: {
  onNew?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onClose?: () => void;
}) => {
  const shortcuts: ShortcutConfig[] = [];

  if (callbacks.onNew) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      handler: callbacks.onNew,
      description: 'Novo Exercício',
    });
  }

  if (callbacks.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      handler: callbacks.onSave,
      description: 'Salvar',
    });
  }

  if (callbacks.onSearch) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      handler: callbacks.onSearch,
      description: 'Buscar',
    });
  }

  if (callbacks.onClose) {
    shortcuts.push({
      key: 'Escape',
      handler: callbacks.onClose,
      description: 'Fechar',
    });
  }

  useKeyboardShortcuts(shortcuts);
};

