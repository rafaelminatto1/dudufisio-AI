import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import BodyMapComparison from './BodyMapComparison';
import type { PainData } from './BodyMapSVG';

interface BodyMapComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  previousSessionDate?: string;
  previousSessionNumber?: number;
  currentSessionNumber: number;
  previousPainData: PainData[];
  currentPainData: PainData[];
}

export const BodyMapComparisonModal: React.FC<BodyMapComparisonModalProps> = ({
  isOpen,
  onClose,
  patientName,
  previousSessionDate,
  previousSessionNumber,
  currentSessionNumber,
  previousPainData,
  currentPainData,
}) => {
  if (!isOpen) return null;

  // Calcular estatísticas de mudança
  const getChangeStats = () => {
    const previousAvg = previousPainData.length > 0
      ? previousPainData.reduce((sum, p) => sum + p.intensity, 0) / previousPainData.length
      : 0;

    const currentAvg = currentPainData.length > 0
      ? currentPainData.reduce((sum, p) => sum + p.intensity, 0) / currentPainData.length
      : 0;

    const change = currentAvg - previousAvg;
    const changePercent = previousAvg > 0 ? (change / previousAvg) * 100 : 0;

    // Contar regiões que melhoraram, pioraram e mantiveram
    let improved = 0;
    let worsened = 0;
    let stable = 0;
    let newPain = 0;
    let resolved = 0;

    // Criar mapa de regiões anteriores
    const previousMap = new Map(previousPainData.map(p => [p.regionId, p.intensity]));
    const currentMap = new Map(currentPainData.map(p => [p.regionId, p.intensity]));

    // Analisar regiões atuais
    currentPainData.forEach(current => {
      const previous = previousMap.get(current.regionId);
      if (previous === undefined) {
        newPain++;
      } else {
        const diff = current.intensity - previous;
        if (diff < -1) improved++;
        else if (diff > 1) worsened++;
        else stable++;
      }
    });

    // Contar regiões resolvidas
    previousPainData.forEach(previous => {
      if (!currentMap.has(previous.regionId)) {
        resolved++;
      }
    });

    return {
      previousAvg,
      currentAvg,
      change,
      changePercent,
      improved,
      worsened,
      stable,
      newPain,
      resolved,
    };
  };

  const stats = getChangeStats();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Comparação de Sessões</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {patientName} • Sessão {previousSessionNumber || '?'} → Sessão {currentSessionNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
            {/* Dor Média */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Dor Média</span>
                {stats.change < -1 && <TrendingDown className="w-4 h-4 text-green-600" />}
                {stats.change > 1 && <TrendingUp className="w-4 h-4 text-red-600" />}
                {Math.abs(stats.change) <= 1 && <Minus className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {stats.currentAvg.toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">
                  (era {stats.previousAvg.toFixed(1)})
                </span>
              </div>
              {stats.change !== 0 && (
                <div className={`text-xs mt-1 font-medium ${
                  stats.change < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} pontos
                  {stats.changePercent !== 0 && ` (${stats.changePercent > 0 ? '+' : ''}${stats.changePercent.toFixed(0)}%)`}
                </div>
              )}
            </div>

            {/* Melhorias */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block mb-2">Melhorias</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-green-600">
                  {stats.improved}
                </span>
                <span className="text-sm text-slate-500">regiões</span>
              </div>
              {stats.resolved > 0 && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  +{stats.resolved} resolvidas
                </div>
              )}
            </div>

            {/* Pioras */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block mb-2">Pioras</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-red-600">
                  {stats.worsened}
                </span>
                <span className="text-sm text-slate-500">regiões</span>
              </div>
              {stats.newPain > 0 && (
                <div className="text-xs text-orange-600 font-medium mt-1">
                  +{stats.newPain} novas
                </div>
              )}
            </div>

            {/* Estáveis */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block mb-2">Estáveis</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-700">
                  {stats.stable}
                </span>
                <span className="text-sm text-slate-500">regiões</span>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {(stats.worsened > 0 || stats.newPain > 0 || stats.change > 2) && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">
                    Atenção: Piora Detectada
                  </h3>
                  <ul className="text-sm text-red-800 space-y-1">
                    {stats.worsened > 0 && (
                      <li>• {stats.worsened} região(ões) com aumento de dor ≥2 pontos</li>
                    )}
                    {stats.newPain > 0 && (
                      <li>• {stats.newPain} nova(s) região(ões) com dor</li>
                    )}
                    {stats.change > 2 && (
                      <li>• Dor média aumentou {stats.change.toFixed(1)} pontos</li>
                    )}
                  </ul>
                  <p className="text-xs text-red-700 mt-2">
                    Considere revisar o plano de tratamento e investigar possíveis causas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem Positiva */}
          {stats.improved > 0 && stats.worsened === 0 && stats.newPain === 0 && (
            <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900 mb-1">
                    Ótima Evolução! 🎉
                  </h3>
                  <p className="text-sm text-green-800">
                    {stats.improved} região(ões) melhoraram
                    {stats.resolved > 0 && ` e ${stats.resolved} foram completamente resolvidas`}.
                    Continue o tratamento atual!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comparação Lado a Lado */}
          <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
            <BodyMapComparison
              patientName={patientName}
              previousSession={{
                date: previousSessionDate || '',
                painData: previousPainData,
              }}
              currentSession={{
                date: new Date().toISOString(),
                painData: currentPainData,
              }}
              view="front"
            />
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                💡 Dica: Use esta comparação para ajustar o plano de tratamento
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
