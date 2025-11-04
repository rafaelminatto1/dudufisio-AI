import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useOffline } from '../../contexts/OfflineContext';
import { cn } from '../../lib/utils';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, failedCount, sync } = useOffline();

  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null; // Tudo OK, não mostrar nada
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
      >
        <Card
          className={cn(
            "px-4 py-2 shadow-lg border-2",
            !isOnline && "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
            isOnline && pendingCount > 0 && "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={cn(
              "p-1.5 rounded-full",
              !isOnline && "bg-red-100 dark:bg-red-900",
              isOnline && isSyncing && "bg-blue-100 dark:bg-blue-900",
              isOnline && !isSyncing && pendingCount > 0 && "bg-yellow-100 dark:bg-yellow-900"
            )}>
              {!isOnline && <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />}
              {isOnline && isSyncing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
              )}
              {isOnline && !isSyncing && pendingCount > 0 && (
                <Wifi className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {!isOnline && 'Modo Offline'}
                {isOnline && isSyncing && 'Sincronizando...'}
                {isOnline && !isSyncing && pendingCount > 0 && 'Sincronização Pendente'}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isOnline && 'Suas alterações serão sincronizadas quando voltar online'}
                {isOnline && isSyncing && 'Enviando alterações para o servidor'}
                {isOnline && !isSyncing && `${pendingCount} ${pendingCount === 1 ? 'alteração' : 'alterações'} aguardando sincronização`}
              </p>
            </div>

            {/* Badges and Actions */}
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {pendingCount}
                </Badge>
              )}

              {failedCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {failedCount}
                </Badge>
              )}

              {isOnline && pendingCount > 0 && !isSyncing && (
                <Button size="sm" variant="outline" onClick={sync} className="h-7">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sincronizar
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;

