import { AlertCircle } from 'lucide-react';
import { OFFLINE_BANNER } from '@/lib/offline-mode';

/**
 * Banner de Modo Offline
 * 
 * Exibe um aviso quando o sistema está rodando em modo offline.
 * Aparece no topo da aplicação para informar o usuário.
 */
export function OfflineBanner() {
  if (!OFFLINE_BANNER.enabled) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            {OFFLINE_BANNER.message}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{OFFLINE_BANNER.description}</p>
          </div>
          <div className="mt-3">
            <div className="text-xs text-yellow-600">
              💡 Para desabilitar, remova <code className="px-1 py-0.5 bg-yellow-100 rounded">VITE_OFFLINE_MODE=true</code> do arquivo <code className="px-1 py-0.5 bg-yellow-100 rounded">.env.local</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

