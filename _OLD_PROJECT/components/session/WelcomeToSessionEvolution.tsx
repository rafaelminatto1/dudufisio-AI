import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Banner de boas-vindas ao Sistema de Evolução de Sessão
 * Aparece apenas na primeira vez que o usuário acessa
 * Guia rápido para configurar preferências
 */

const STORAGE_KEY = 'session_evolution_welcome_dismissed';

export const WelcomeToSessionEvolution: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se já foi exibido antes
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  const handleGoToSettings = () => {
    handleDismiss();
    navigate('/session-evolution-settings');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in slide-in-from-bottom-4 duration-500">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
          Bem-vindo ao Novo Sistema de Evolução! 🎉
        </h2>

        <p className="text-center text-slate-700 mb-6 text-lg">
          Agora você pode escolher <strong>como quer visualizar</strong> os atendimentos!
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">🏠</div>
            <h4 className="font-semibold text-slate-900 mb-1">Sistema Existente</h4>
            <p className="text-xs text-slate-600">O que você já conhece</p>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">📄</div>
            <h4 className="font-semibold text-slate-900 mb-1">Página Nova</h4>
            <p className="text-xs text-slate-600">4 colunas com tudo visível</p>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">🪟</div>
            <h4 className="font-semibold text-slate-900 mb-1">Modal</h4>
            <p className="text-xs text-slate-600">Sobre a agenda</p>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">➕</div>
            <h4 className="font-semibold text-slate-900 mb-1">Expansão</h4>
            <p className="text-xs text-slate-600">Melhor dos 2 mundos</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center space-x-2">
            <span>✨</span>
            <span>Novos Recursos Disponíveis:</span>
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-sm text-purple-900">
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Gráficos de evolução</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Countdown de objetivos</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Timeline de cirurgias</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Alertas obrigatórios</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Insights para laudos</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Replicar condutas</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="px-6"
          >
            Continuar Depois
          </Button>

          <Button
            onClick={handleGoToSettings}
            className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Escolher Meu Modo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Você pode mudar de modo a qualquer momento em <strong>Configurações</strong> → <strong>Atendimento</strong>
        </p>
      </div>
    </div>
  );
};

export default WelcomeToSessionEvolution;

