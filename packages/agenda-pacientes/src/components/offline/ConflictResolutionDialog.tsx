import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DataConflict } from '../../lib/offline/conflictResolver';
import { ArrowRight, Download, Upload, GitMerge } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: DataConflict<any>[];
  onResolve: (resolutions: Map<string, any>) => void;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  isOpen,
  onClose,
  conflicts,
  onResolve
}) => {
  const [resolutions, setResolutions] = useState<Map<string, 'local' | 'server'>>(new Map());

  const handleResolve = (field: string, choice: 'local' | 'server') => {
    const newResolutions = new Map(resolutions);
    newResolutions.set(field, choice);
    setResolutions(newResolutions);
  };

  const handleApply = () => {
    const resolvedValues = new Map<string, any>();
    
    conflicts.forEach(conflict => {
      const choice = resolutions.get(conflict.field);
      if (choice === 'local') {
        resolvedValues.set(conflict.field, conflict.localValue);
      } else if (choice === 'server') {
        resolvedValues.set(conflict.field, conflict.serverValue);
      } else {
        // Default: newest wins
        const value = conflict.localTimestamp > conflict.serverTimestamp
          ? conflict.localValue
          : conflict.serverValue;
        resolvedValues.set(conflict.field, value);
      }
    });

    onResolve(resolvedValues);
    onClose();
  };

  const allResolved = conflicts.every(c => resolutions.has(c.field));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5" />
            Resolver Conflitos de Sincronização
          </DialogTitle>
          <DialogDescription>
            Encontramos {conflicts.length} {conflicts.length === 1 ? 'conflito' : 'conflitos'} entre seus dados locais e do servidor. Escolha qual versão manter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {conflicts.map((conflict, index) => {
            const choice = resolutions.get(conflict.field);

            return (
              <Card key={conflict.id} className="p-4">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">
                    Campo: {conflict.field}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Modificado localmente em {format(conflict.localTimestamp, "dd/MM HH:mm", { locale: ptBR })} •
                    Modificado no servidor em {format(conflict.serverTimestamp, "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Local Version */}
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2",
                      choice === 'local' && "bg-blue-50 dark:bg-blue-950 border-blue-500",
                      choice !== 'local' && "hover:border-blue-300"
                    )}
                    onClick={() => handleResolve(conflict.field, 'local')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-sm">Versão Local</h4>
                      {choice === 'local' && (
                        <Badge variant="default" className="ml-auto">Escolhida</Badge>
                      )}
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {JSON.stringify(conflict.localValue, null, 2)}
                    </div>
                  </Card>

                  {/* Server Version */}
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2",
                      choice === 'server' && "bg-green-50 dark:bg-green-950 border-green-500",
                      choice !== 'server' && "hover:border-green-300"
                    )}
                    onClick={() => handleResolve(conflict.field, 'server')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-sm">Versão Servidor</h4>
                      {choice === 'server' && (
                        <Badge variant="default" className="ml-auto">Escolhida</Badge>
                      )}
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {JSON.stringify(conflict.serverValue, null, 2)}
                    </div>
                  </Card>
                </div>

                {!choice && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      💡 Se não escolher, usaremos a versão mais recente (
                      {conflict.localTimestamp > conflict.serverTimestamp ? 'Local' : 'Servidor'})
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {allResolved ? '✅ Todos conflitos resolvidos' : `⏳ ${conflicts.length - resolutions.size} conflito(s) pendente(s)`}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleApply}>
                Aplicar Resoluções
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;

