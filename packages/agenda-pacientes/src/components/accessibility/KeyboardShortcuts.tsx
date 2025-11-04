import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Command } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts?: Shortcut[];
}

const defaultShortcuts = (navigate: any): Shortcut[] => [
  {
    keys: ['Ctrl', 'K'],
    description: 'Busca global',
    action: () => {},
  },
  {
    keys: ['G', 'D'],
    description: 'Ir para Dashboard',
    action: () => navigate('/dashboard'),
  },
  {
    keys: ['G', 'P'],
    description: 'Ir para Pacientes',
    action: () => navigate('/patients'),
  },
  {
    keys: ['G', 'A'],
    description: 'Ir para Agenda',
    action: () => navigate('/agenda'),
  },
  {
    keys: ['N'],
    description: 'Novo registro',
    action: () => {},
  },
  {
    keys: ['?'],
    description: 'Mostrar atalhos',
    action: () => {},
  },
  {
    keys: ['Esc'],
    description: 'Fechar modal/dialog',
    action: () => {},
  },
];

export function KeyboardShortcuts({ shortcuts: customShortcuts }: KeyboardShortcutsProps) {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = React.useState(false);

  const shortcuts = customShortcuts || defaultShortcuts(navigate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts dialog
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowDialog(true);
        return;
      }

      // Execute shortcuts
      shortcuts.forEach((shortcut) => {
        const keys = shortcut.keys.map((k) => k.toLowerCase());
        const modifierKeys = ['ctrl', 'shift', 'alt', 'meta'];

        const hasModifiers = keys.some((k) => modifierKeys.includes(k));
        const mainKey = keys.find((k) => !modifierKeys.includes(k));

        if (!mainKey) return;

        const ctrlMatch = keys.includes('ctrl') ? e.ctrlKey || e.metaKey : true;
        const shiftMatch = keys.includes('shift') ? e.shiftKey : true;
        const altMatch = keys.includes('alt') ? e.altKey : true;
        const keyMatch = e.key.toLowerCase() === mainKey.toLowerCase();

        // Only trigger if not in input/textarea
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        if (!isInput && ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    <Badge variant="secondary" className="font-mono">
                      {key === 'Ctrl' && '⌘'}
                      {key === 'Shift' && '⇧'}
                      {key === 'Alt' && '⌥'}
                      {key !== 'Ctrl' && key !== 'Shift' && key !== 'Alt' && key}
                    </Badge>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-muted-foreground">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          Pressione <Badge variant="outline">?</Badge> a qualquer momento para ver
          esta lista
        </div>
      </DialogContent>
    </Dialog>
  );
}

