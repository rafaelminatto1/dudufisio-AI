import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncStatusPanelProps {
  className?: string;
}

const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({ className }) => {
  const {
    isOnline,
    isSyncing,
    queueItems,
    pendingCount,
    failedCount,
    sync,
    retryFailed,
    clearQueue
  } = useOffline();

  const getStatusIcon = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getActionLabel = (type: SyncQueueItem['type']) => {
    const labels: Record<string, string> = {
      'create-appointment': 'Criar agendamento',
      'update-appointment': 'Atualizar agendamento',
      'delete-appointment': 'Deletar agendamento',
      'create-comment': 'Criar comentário',
      'update-comment': 'Atualizar comentário',
      'delete-comment': 'Deletar comentário',
      'update-resource': 'Atualizar recurso',
      'allocate-resource': 'Alocar recurso'
    };
    return labels[type] || type;
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
            Status de Sincronização
          </h3>
          <p className="text-sm text-muted-foreground">
            {isOnline ? '🟢 Online' : '🔴 Offline'} • {queueItems.length} {queueItems.length === 1 ? 'item' : 'itens'} na fila
          </p>
        </div>

        <div className="flex items-center gap-2">
          {failedCount > 0 && (
            <Button variant="outline" size="sm" onClick={retryFailed} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retentar Falhos
            </Button>
          )}

          {isOnline && pendingCount > 0 && (
            <Button size="sm" onClick={sync} disabled={isSyncing} className="gap-2">
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {queueItems.filter(i => i.status === 'processing').length}
              </p>
              <p className="text-xs text-muted-foreground">Processando</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-red-50 dark:bg-red-950 border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Falhos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Queue Items */}
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {queueItems.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">Tudo sincronizado!</p>
              <p className="text-xs text-muted-foreground mt-1">Nenhuma ação pendente</p>
            </Card>
          ) : (
            <AnimatePresence>
              {queueItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn("p-4 border-l-4", getStatusColor(item.status))}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{getActionLabel(item.type)}</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.status}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>

                          {item.error && (
                            <p className="text-xs text-red-600 mt-1">
                              Erro: {item.error}
                            </p>
                          )}

                          {item.retryCount > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tentativa {item.retryCount}/{item.maxRetries}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Retry individual item
                            import('../../lib/offline/syncQueue').then(({ syncQueue }) => {
                              syncQueue.retryItem(item.id);
                            });
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      {queueItems.length > 0 && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearQueue}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Completados
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SyncStatusPanel;

