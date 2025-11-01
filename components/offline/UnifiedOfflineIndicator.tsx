/**
 * 🌐 UNIFIED OFFLINE INDICATOR
 * 
 * Componente unificado que consolida toda a funcionalidade de indicação offline.
 * Substitui os 3 componentes anteriores:
 * - components/OfflineIndicator.tsx
 * - components/OfflineNotification.tsx
 * - components/offline/OfflineIndicator.tsx
 * 
 * Features:
 * - Indicador de status online/offline
 * - Notificação de conexão restaurada
 * - Status de sincronização
 * - Contador de itens pendentes/falhos
 * - Ações de sincronização manual
 * - UI moderna com animações suaves
 * 
 * @module UnifiedOfflineIndicator
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  X 
} from 'lucide-react';
import { useSafeOffline } from '../../contexts/SafeOfflineContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

/**
 * Props do componente
 */
interface UnifiedOfflineIndicatorProps {
  /**
   * Posição do indicador na tela
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center';
  
  /**
   * Mostrar detalhes de sincronização (contador de itens)
   * @default true
   */
  showSyncDetails?: boolean;
  
  /**
   * Auto-ocultar notificação de "voltou online" após X ms
   * @default 5000
   */
  autoHideOnlineDelay?: number;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * 🌐 UnifiedOfflineIndicator
 * 
 * Indicador unificado de status offline com funcionalidade completa.
 */
export const UnifiedOfflineIndicator: React.FC<UnifiedOfflineIndicatorProps> = ({
  position = 'bottom-right',
  showSyncDetails = true,
  autoHideOnlineDelay = 5000,
  className,
}) => {
  const { 
    isOnline, 
    isSyncing, 
    pendingCount, 
    failedCount,
    queueSize,
    sync,
    retryFailed,
    hasError 
  } = useSafeOffline();

  const [wasOffline, setWasOffline] = useState(false);
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  /**
   * Detectar mudança de offline para online
   */
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false);
    } else if (wasOffline && isOnline) {
      setShowOnlineNotification(true);
      
      // Auto-ocultar após delay
      const timer = setTimeout(() => {
        setShowOnlineNotification(false);
        setWasOffline(false);
      }, autoHideOnlineDelay);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, autoHideOnlineDelay]);

  /**
   * Handler para sincronização manual
   */
  const handleSync = async () => {
    try {
      await sync();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  /**
   * Handler para retentar itens falhos
   */
  const handleRetry = async () => {
    try {
      await retryFailed();
    } catch (error) {
      console.error('Erro ao retentar:', error);
    }
  };

  /**
   * Handler para dispensar notificação
   */
  const handleDismiss = () => {
    setIsDismissed(true);
    setShowOnlineNotification(false);
  };

  /**
   * Calcular classes de posição
   */
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  /**
   * Determinar se deve mostrar o indicador
   */
  const shouldShow = !isOnline || showOnlineNotification || (isOnline && (pendingCount > 0 || failedCount > 0));

  if (!shouldShow || isDismissed) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed z-50 max-w-md',
        getPositionClasses(),
        className
      )}
    >
      <AnimatePresence mode="wait">
        {/* Indicador de Offline */}
        {!isOnline && (
          <motion.div
            key="offline"
            initial={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <Card className="bg-red-50 dark:bg-red-950 border-2 border-red-500 shadow-lg">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <WifiOff className="w-6 h-6 text-red-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Você está offline
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Suas alterações serão sincronizadas quando a conexão for restaurada
                    </p>
                    
                    {showSyncDetails && queueSize > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 dark:bg-red-900 border-red-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {queueSize} {queueSize === 1 ? 'item pendente' : 'itens pendentes'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
                    aria-label="Dispensar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notificação de Conexão Restaurada */}
        {showOnlineNotification && isOnline && (
          <motion.div
            key="online"
            initial={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <Card className="bg-green-50 dark:bg-green-950 border-2 border-green-500 shadow-lg">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Wifi className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      Conexão restaurada!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {isSyncing ? 'Sincronizando dados...' : 'Você está online novamente'}
                    </p>
                    
                    {isSyncing && (
                      <div className="mt-3 flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 text-green-600 animate-spin" />
                        <span className="text-xs text-green-700">Sincronizando...</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
                    aria-label="Dispensar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Indicador de Sincronização com Itens Pendentes/Falhos */}
        {isOnline && !showOnlineNotification && (pendingCount > 0 || failedCount > 0) && (
          <motion.div
            key="sync"
            initial={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <Card className={cn(
              "border-2 shadow-lg",
              failedCount > 0 
                ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-500"
                : "bg-blue-50 dark:bg-blue-950 border-blue-500"
            )}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isSyncing ? (
                      <RefreshCw className={cn(
                        "w-6 h-6 animate-spin",
                        failedCount > 0 ? "text-yellow-600" : "text-blue-600"
                      )} />
                    ) : failedCount > 0 ? (
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold",
                      failedCount > 0 
                        ? "text-yellow-900 dark:text-yellow-100"
                        : "text-blue-900 dark:text-blue-100"
                    )}>
                      {isSyncing ? 'Sincronizando...' : failedCount > 0 ? 'Falha na sincronização' : 'Itens pendentes'}
                    </p>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pendingCount > 0 && (
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 border-blue-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      
                      {failedCount > 0 && (
                        <Badge variant="outline" className="bg-red-100 dark:bg-red-900 border-red-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {failedCount} falhou
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      {pendingCount > 0 && !isSyncing && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSync}
                          className="h-7 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Sincronizar
                        </Button>
                      )}
                      
                      {failedCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRetry}
                          className="h-7 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retentar
                        </Button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleDismiss}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      failedCount > 0
                        ? "text-yellow-600 hover:text-yellow-800"
                        : "text-blue-600 hover:text-blue-800"
                    )}
                    aria-label="Dispensar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Export padrão
 */
export default UnifiedOfflineIndicator;

