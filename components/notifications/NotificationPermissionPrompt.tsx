/**
 * NotificationPermissionPrompt Component
 * MoocaFisio - Prompt para solicitar permissão de notificações
 */

import React, { useState } from 'react';
import { Bell, BellOff, X, CheckCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface NotificationPermissionPromptProps {
  onDismiss?: () => void;
  showTestButton?: boolean;
  className?: string;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  onDismiss,
  showTestButton = false,
  className = '',
}) => {
  const { 
    isSupported, 
    permission, 
    isLoading,
    requestPermission,
    sendTestNotification,
  } = usePushNotifications();

  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isSupported || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleRequestPermission = async () => {
    const success = await requestPermission();
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (!showTestButton) {
          handleDismiss();
        }
      }, 3000);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Notificações Ativadas!</h3>
            <p className="text-sm text-green-700 mt-1">
              Você receberá lembretes e atualizações importantes.
            </p>
            {showTestButton && (
              <button
                onClick={handleTestNotification}
                disabled={isLoading}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Enviar Teste
                  </>
                )}
              </button>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-green-600 hover:text-green-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Permission denied state
  if (permission === 'denied') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Notificações Bloqueadas</h3>
            <p className="text-sm text-red-700 mt-1">
              Você bloqueou as notificações. Para reativar:
            </p>
            <ol className="text-sm text-red-700 mt-2 ml-4 list-decimal space-y-1">
              <li>Clique no ícone de cadeado na barra de endereço</li>
              <li>Encontre "Notificações" nas permissões</li>
              <li>Altere para "Permitir"</li>
              <li>Recarregue a página</li>
            </ol>
          </div>
          <button
            onClick={handleDismiss}
            className="text-red-600 hover:text-red-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Permission granted state (already has permission)
  if (permission === 'granted') {
    if (!showTestButton) {
      return null;
    }

    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Notificações Ativas</h3>
            <p className="text-sm text-blue-700 mt-1">
              Você está recebendo notificações do MoocaFisio.
            </p>
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Enviar Teste
                </>
              )}
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Default state - request permission
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Ative as Notificações</h3>
          <p className="text-sm text-blue-700 mt-1">
            Receba lembretes de consultas e atualizações importantes diretamente no seu navegador.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ativando...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Ativar Notificações
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-blue-700 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-700 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

