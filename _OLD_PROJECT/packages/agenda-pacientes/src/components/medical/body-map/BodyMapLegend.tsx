/**
 * BodyMapLegend.tsx
 * Professional legend component for body map visualization
 * Provides clear visual guidance and accessibility information
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle, Palette } from 'lucide-react';

/**
 * Props interface for BodyMapLegend
 */
interface BodyMapLegendProps {
  /** Whether to show expanded details */
  expanded?: boolean;
  /** Container class name */
  className?: string;
  /** Show help toggle */
  showHelp?: boolean;
}

/**
 * Pain level configurations
 */
const PAIN_LEVELS = [
  { level: '0', color: '#e2e8f0', label: 'Sem dor', description: 'Ausência completa de desconforto' },
  { level: '1-3', color: '#22c55e', label: 'Leve', description: 'Desconforto mínimo, não interfere nas atividades' },
  { level: '4-6', color: '#eab308', label: 'Moderada', description: 'Interfere moderadamente nas atividades diárias' },
  { level: '7-8', color: '#f97316', label: 'Intensa', description: 'Interfere significativamente nas atividades' },
  { level: '9-10', color: '#ef4444', label: 'Severa', description: 'Dor incapacitante, impede atividades básicas' }
];

/**
 * Pain type configurations
 */
const PAIN_TYPES = [
  { type: 'acute', label: 'Aguda', description: 'Dor súbita e intensa, geralmente de curta duração' },
  { type: 'chronic', label: 'Crônica', description: 'Dor persistente por mais de 3-6 meses' },
  { type: 'intermittent', label: 'Intermitente', description: 'Dor que vai e vem em episódios' },
  { type: 'constant', label: 'Constante', description: 'Dor contínua sem intervalos de alívio' }
];

/**
 * Interaction instructions
 */
const INTERACTION_GUIDE = [
  { action: 'Clique no corpo', description: 'Adicionar novo ponto de dor' },
  { action: 'Clique no ponto', description: 'Editar ponto existente' },
  { action: 'Alterar visualização', description: 'Trocar entre frente e costas' },
  { action: 'Usar timeline', description: 'Analisar evolução temporal' }
];

/**
 * Professional body map legend component
 */
const BodyMapLegend: React.FC<BodyMapLegendProps> = ({
  expanded = false,
  className = '',
  showHelp = true
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-slate-600" />
          <h4 className="font-semibold text-slate-800">Legenda</h4>
        </div>

        <div className="flex items-center gap-2">
          {showHelp && (
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`p-2 rounded-lg transition-colors ${
                showGuide
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Mostrar/ocultar guia de uso"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              isExpanded
                ? 'bg-blue-100 text-blue-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Expandir/recolher legenda"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Usage Guide */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-200"
          >
            <div className="p-4 bg-blue-50">
              <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Como usar o mapa corporal
              </h5>
              <div className="space-y-2">
                {INTERACTION_GUIDE.map((guide, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-blue-700">{guide.action}:</span>{' '}
                      <span className="text-blue-600">{guide.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {/* Pain Level Scale */}
        <div>
          <h5 className="font-medium text-slate-700 mb-3">Escala de Dor (0-10)</h5>
          <div className="space-y-2">
            {PAIN_LEVELS.map((level, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: level.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {level.level}
                    </span>
                    <span className="text-sm text-slate-600">
                      {level.label}
                    </span>
                  </div>
                  {isExpanded && (
                    <p className="text-xs text-slate-500 mt-1">
                      {level.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pain Types */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-slate-200 pt-4"
          >
            <h5 className="font-medium text-slate-700 mb-3">Tipos de Dor</h5>
            <div className="grid grid-cols-1 gap-2">
              {PAIN_TYPES.map((type, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-3 h-3 bg-slate-400 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">
                      {type.label}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Visual Indicators */}
        <div className="border-t border-slate-200 pt-4">
          <h5 className="font-medium text-slate-700 mb-3">Indicadores Visuais</h5>
          <div className="space-y-3">
            {/* Selected Point */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700" />
                <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-75" />
              </div>
              <span className="text-sm text-slate-600">Ponto selecionado</span>
            </div>

            {/* Hover State */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full shadow-lg transform scale-110" />
              <span className="text-sm text-slate-600">Ponto em foco (hover)</span>
            </div>

            {/* Timeline Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <span className="text-sm text-slate-600">Evolução temporal</span>
            </div>
          </div>
        </div>

        {/* Accessibility Info */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-slate-200 pt-4"
          >
            <h5 className="font-medium text-slate-700 mb-3">Acessibilidade</h5>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• Use Tab para navegar pelos pontos</p>
              <p>• Enter ou Espaço para selecionar</p>
              <p>• Setas para navegar na escala de dor</p>
              <p>• Suporte a leitores de tela</p>
            </div>
          </motion.div>
        )}

        {/* Compact Legend Toggle */}
        <div className="border-t border-slate-200 pt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {isExpanded ? 'Mostrar menos' : 'Mostrar mais detalhes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BodyMapLegend;