import React, { useEffect, useState } from 'react';

interface ImprovedLoadingScreenProps {
  onTimeout?: () => void;
  timeoutMs?: number;
}

export const ImprovedLoadingScreen: React.FC<ImprovedLoadingScreenProps> = ({
  onTimeout,
  timeoutMs = 10000, // 10 segundos padrão
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Iniciando...');
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Simular progresso de carregamento
    const progressSteps = [
      { time: 1000, progress: 20, stage: 'Carregando autenticação...' },
      { time: 2000, progress: 40, stage: 'Inicializando contextos...' },
      { time: 3000, progress: 60, stage: 'Carregando dados...' },
      { time: 4000, progress: 80, stage: 'Preparando interface...' },
      { time: 5000, progress: 95, stage: 'Finalizando...' },
    ];

    const timers = progressSteps.map(({ time, progress, stage }) =>
      setTimeout(() => {
        setProgress(progress);
        setStage(stage);
      }, time)
    );

    // Timeout de segurança
    const timeoutTimer = setTimeout(() => {
      console.error('⚠️ [TIMEOUT] Carregamento excedeu tempo limite de', timeoutMs, 'ms');
      setHasTimedOut(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMs);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(timeoutTimer);
    };
  }, [onTimeout, timeoutMs]);

  if (hasTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Erro ao Carregar
          </h2>

          <p className="text-slate-600 mb-6">
            A aplicação está demorando mais que o esperado para carregar.
            Isso pode ser causado por uma conexão lenta ou um problema temporário.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold"
            >
              🔄 Tentar Novamente
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
            >
              🗑️ Limpar Cache e Recarregar
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">
            DuduFisio-AI
          </h1>
          <p className="text-slate-600">Carregando sistema...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-slate-600">{stage}</p>
            <p className="text-sm font-semibold text-indigo-600">{progress}%</p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <p className="text-xs text-center text-slate-500 mt-6">
          Aguarde enquanto preparamos tudo para você...
        </p>
      </div>
    </div>
  );
};

export default ImprovedLoadingScreen;

