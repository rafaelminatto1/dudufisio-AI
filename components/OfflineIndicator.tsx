import React, { memo } from 'react';
import { WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { useOnlineStatus, useServiceWorker } from '../hooks/useOnlineStatus';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

/**
 * 📡 Indicador de Status Online/Offline
 */
export const OfflineIndicator: React.FC = memo(() => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { showUpdatePrompt, update, dismissUpdate } = useServiceWorker();

  if (isOnline && !wasOffline && !showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Indicador de Offline */}
      {!isOnline && (
        <Card className="bg-red-50 border-2 border-red-500 shadow-lg p-4 animate-slide-in-bottom">
          <div className="flex items-center gap-3">
            <WifiOff className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                Você está offline
              </p>
              <p className="text-xs text-red-700">
                Algumas funcionalidades podem estar limitadas
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Indicador de Conexão Restaurada */}
      {isOnline && wasOffline && (
        <Card className="bg-green-50 border-2 border-green-500 shadow-lg p-4 animate-slide-in-bottom">
          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                Conexão restaurada!
              </p>
              <p className="text-xs text-green-700">
                Você está online novamente
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Prompt de Atualização - DESABILITADO */}
      {/* {showUpdatePrompt && (
        <Card className="bg-blue-50 border-2 border-blue-500 shadow-lg p-4 animate-slide-in-bottom">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                Atualização disponível
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Uma nova versão do aplicativo está disponível
              </p>
              <div className="flex gap-2">
                <button
                  onClick={update}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Atualizar
                </button>
                <button
                  onClick={dismissUpdate}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Depois
                </button>
              </div>
            </div>
          </div>
        </Card>
      )} */}
    </div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';

/**
 * Badge simples de status
 */
export const OnlineStatusBadge: React.FC = memo(() => {
  const { isOnline } = useOnlineStatus();

  return (
    <Badge 
      variant={isOnline ? 'default' : 'destructive'}
      className="flex items-center gap-1"
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Offline
        </>
      )}
    </Badge>
  );
});

OnlineStatusBadge.displayName = 'OnlineStatusBadge';

export default OfflineIndicator;
