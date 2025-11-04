import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'views' | 'general';
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['←'], description: 'Período anterior', category: 'navigation' },
  { keys: ['→'], description: 'Próximo período', category: 'navigation' },
  { keys: ['T'], description: 'Ir para hoje', category: 'navigation' },
  
  // Actions
  { keys: ['N'], description: 'Novo agendamento', category: 'actions' },
  { keys: ['Ctrl', 'N'], description: 'Novo agendamento', category: 'actions' },
  { keys: ['E'], description: 'Editar agendamento selecionado', category: 'actions' },
  { keys: ['Del'], description: 'Deletar agendamento selecionado', category: 'actions' },
  { keys: ['S'], description: 'Salvar agendamento', category: 'actions' },
  
  // Views
  { keys: ['1'], description: 'Visualização Diária', category: 'views' },
  { keys: ['2'], description: 'Visualização Semanal', category: 'views' },
  { keys: ['3'], description: 'Visualização Mensal', category: 'views' },
  { keys: ['4'], description: 'Visualização em Lista', category: 'views' },
  
  // General
  { keys: ['F'], description: 'Focar busca', category: 'general' },
  { keys: ['/'], description: 'Focar busca', category: 'general' },
  { keys: ['W'], description: 'Abrir lista de espera', category: 'general' },
  { keys: ['B'], description: 'Gerenciar bloqueios', category: 'general' },
  { keys: ['Esc'], description: 'Fechar modal/diálogo', category: 'general' },
  { keys: ['?'], description: 'Mostrar esta ajuda', category: 'general' },
];

const CATEGORY_LABELS = {
  navigation: 'Navegação',
  actions: 'Ações',
  views: 'Visualizações',
  general: 'Geral'
};

const CATEGORY_COLORS = {
  navigation: 'bg-blue-100 text-blue-700 border-blue-200',
  actions: 'bg-green-100 text-green-700 border-green-200',
  views: 'bg-purple-100 text-purple-700 border-purple-200',
  general: 'bg-slate-100 text-slate-700 border-slate-200'
};

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const shortcutsByCategory = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    const categoryArray = acc[shortcut.category];
    if (categoryArray) {
      categoryArray.push(shortcut);
    }
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar e operar a agenda mais rapidamente
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Badge className={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}>
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <span className="text-sm text-slate-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-slate-400 mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">💡</div>
            <div className="text-sm text-blue-800">
              <strong>Dica:</strong> Os atalhos funcionam apenas quando nenhum campo de entrada está focado.
              Pressione <kbd className="px-1.5 py-0.5 text-xs bg-blue-100 border border-blue-300 rounded">Esc</kbd> para sair de qualquer campo.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;

