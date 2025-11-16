import React from 'react';

interface MobileLoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const MobileLoadingScreen: React.FC<MobileLoadingScreenProps> = ({
  message = 'Carregando...',
  showProgress = false,
  progress = 0
}) => {
  const mobile = isMobile();
  const slowConnection = isSlowConnection();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-sm px-6 text-center">
        {/* Logo/Ícone */}
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        {/* Spinner otimizado para mobile */}
        <div className="mb-6">
          {slowConnection ? (
            // Spinner simples para conexões lentas
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : (
            // Spinner mais elaborado para conexões boas
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          )}
        </div>

        {/* Mensagem */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {message}
        </h2>

        {/* Aviso para conexões lentas */}
        {slowConnection && (
          <p className="text-sm text-gray-600 mb-4">
            Conexão lenta detectada. Aguarde um momento...
          </p>
        )}

        {/* Barra de progresso */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        {/* Dicas para mobile */}
        {mobile && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 Dica: Mantenha a tela ligada para melhor performance</p>
            {slowConnection && (
              <p>📶 Verifique sua conexão com a internet</p>
            )}
          </div>
        )}

        {/* Botão de recarregar para casos de erro */}
        <div className="mt-6">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileLoadingScreen;
