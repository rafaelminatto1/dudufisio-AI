/**
 * Barra de Ações em Massa para Exercícios
 * Permite selecionar múltiplos exercícios e executar ações em lote
 */

import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Download,
  Trash2,
  Copy,
  X,
  CheckSquare,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkDuplicate: () => void;
  onBulkExport: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkDuplicate,
  onBulkExport,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <span className="font-medium">
            {selectedCount} {selectedCount === 1 ? 'exercício selecionado' : 'exercícios selecionados'}
          </span>
        </div>

        <div className="h-6 w-px bg-primary-foreground/20" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onBulkExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onBulkDuplicate}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onBulkDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="gap-2 hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

