import React from 'react';
import { FileText, Maximize2, Layers, Home, Check, ExternalLink } from 'lucide-react';
import { SessionEvolutionMode } from '../../config/sessionEvolutionConfig';
import { Button } from '../ui/button';

/**
 * Seletor visual de modo de evolução de sessão
 * Cards clicáveis com preview e descrição
 */

interface SessionEvolutionModeSelectorProps {
  currentMode: SessionEvolutionMode;
  onModeChange: (mode: SessionEvolutionMode) => void;
  onTestMode?: (mode: SessionEvolutionMode) => void;
}

interface ModeOption {
  id: SessionEvolutionMode;
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  recommended?: string;
  color: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'existing',
    icon: Home,
    title: 'Sistema Existente',
    description: 'Interface atual robusta com React Hook Form e validações completas',
    features: [
      'Sistema já testado e validado',
      'Formulário completo com auto-save',
      'Integração com IA (Gemini)',
      'Compatível com todo o sistema',
    ],
    recommended: 'Recomendado para uso diário',
    color: 'blue',
  },
  {
    id: 'page',
    icon: FileText,
    title: 'Página Nova Fullscreen',
    description: 'Página dedicada com layout de 4 colunas e foco total no atendimento',
    features: [
      'Layout 4 colunas: SOAP | Histórico | Evolução | Objetivos',
      'Visualização completa de dados históricos',
      'Gráficos de evolução integrados',
      'Alertas de testes obrigatórios',
    ],
    color: 'purple',
  },
  {
    id: 'modal',
    icon: Maximize2,
    title: 'Modal Fullscreen',
    description: 'Modal sobre a agenda com acesso rápido sem sair do contexto',
    features: [
      'Abre sobre a agenda atual',
      'Mesmo layout de 4 colunas',
      'Fecha com X ou ESC',
      'Ideal para atendimentos rápidos',
    ],
    color: 'green',
  },
  {
    id: 'expanded',
    icon: Layers,
    title: 'Expansão Integrada',
    description: 'Expansão da interface atual com novos recursos integrados',
    features: [
      'Mantém estrutura atual',
      'Adiciona funcionalidades novas',
      'Transição suave',
      'Melhor dos dois mundos',
    ],
    color: 'orange',
  },
];

export const SessionEvolutionModeSelector: React.FC<SessionEvolutionModeSelectorProps> = ({
  currentMode,
  onModeChange,
  onTestMode,
}) => {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-blue-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-blue-25',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        checkBg: 'bg-blue-600',
        badge: 'bg-blue-100 text-blue-800',
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-purple-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-purple-25',
        iconBg: 'bg-purple-100',
        iconText: 'text-purple-600',
        checkBg: 'bg-purple-600',
        badge: 'bg-purple-100 text-purple-800',
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-green-200',
        bg: isSelected ? 'bg-green-50' : 'bg-green-25',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600',
        checkBg: 'bg-green-600',
        badge: 'bg-green-100 text-green-800',
      },
      orange: {
        border: isSelected ? 'border-orange-500' : 'border-orange-200',
        bg: isSelected ? 'bg-orange-50' : 'bg-orange-25',
        iconBg: 'bg-orange-100',
        iconText: 'text-orange-600',
        checkBg: 'bg-orange-600',
        badge: 'bg-orange-100 text-orange-800',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Modo de Evolução de Sessão
        </h3>
        <p className="text-sm text-slate-600">
          Escolha como deseja visualizar e preencher a evolução dos atendimentos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODE_OPTIONS.map((option) => {
          const isSelected = currentMode === option.id;
          const colors = getColorClasses(option.color, isSelected);
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              onClick={() => onModeChange(option.id)}
              className={`relative text-left border-2 ${colors.border} ${colors.bg} rounded-xl p-5 hover:shadow-lg transition-all ${
                isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:border-slate-400'
              }`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 ${colors.checkBg} rounded-full flex items-center justify-center`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 ${colors.iconBg} rounded-lg mb-3`}>
                <Icon className={`w-6 h-6 ${colors.iconText}`} />
              </div>

              {/* Title */}
              <h4 className="font-bold text-slate-900 mb-1 pr-8">
                {option.title}
              </h4>

              {/* Recommended badge */}
              {option.recommended && (
                <span className={`inline-block px-2 py-0.5 ${colors.badge} text-xs rounded-full mb-2`}>
                  {option.recommended}
                </span>
              )}

              {/* Description */}
              <p className="text-sm text-slate-600 mb-3">
                {option.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 mb-4">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                    <span className={`mt-0.5 ${colors.iconText}`}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Test Button */}
              {onTestMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestMode(option.id);
                  }}
                  className="w-full flex items-center justify-center space-x-2 mt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar Esta Opção</span>
                </Button>
              )}
            </button>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Dica:</strong> Você pode alternar entre os modos a qualquer momento.
          Sua preferência será salva automaticamente.
        </p>
      </div>
    </div>
  );
};

export default SessionEvolutionModeSelector;

