import React from 'react';
import { TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';
import BodyMapSVG, { type PainData } from './BodyMapSVG';
import { getPainColor, PAIN_INTENSITY_LABELS } from './body-regions-data';

interface BodyMapComparisonProps {
  patientName: string;
  previousSession: {
    date: string;
    painData: PainData[];
  };
  currentSession: {
    date: string;
    painData: PainData[];
  };
  view?: 'front' | 'back';
}

interface ComparisonResult {
  regionId: string;
  regionName: string;
  previousIntensity: number;
  currentIntensity: number;
  change: number;
  changePercent: number;
  status: 'improved' | 'worsened' | 'stable' | 'new' | 'resolved';
}

/**
 * Componente de Comparação de Mapas de Dor entre Sessões
 *
 * Features:
 * - Visualização lado a lado (anterior vs atual)
 * - Análise de evolução por região
 * - Indicadores visuais de melhora/piora
 * - Estatísticas agregadas
 */
const BodyMapComparison: React.FC<BodyMapComparisonProps> = ({
  patientName,
  previousSession,
  currentSession,
  view = 'front'
}) => {
  // Criar comparação região por região
  const getComparison = (): ComparisonResult[] => {
    const results: ComparisonResult[] = [];
    const previousMap = new Map(previousSession.painData.map(p => [p.regionId, p.intensity]));
    const currentMap = new Map(currentSession.painData.map(p => [p.regionId, p.intensity]));

    // Regiões presentes em ambas as sessões ou em uma delas
    const allRegionIds = new Set([
      ...previousSession.painData.map(p => p.regionId),
      ...currentSession.painData.map(p => p.regionId)
    ]);

    allRegionIds.forEach(regionId => {
      const previousIntensity = previousMap.get(regionId) || 0;
      const currentIntensity = currentMap.get(regionId) || 0;
      const change = currentIntensity - previousIntensity;
      const changePercent = previousIntensity > 0
        ? ((change / previousIntensity) * 100)
        : currentIntensity > 0 ? 100 : 0;

      let status: ComparisonResult['status'] = 'stable';
      if (previousIntensity === 0 && currentIntensity > 0) {
        status = 'new';
      } else if (previousIntensity > 0 && currentIntensity === 0) {
        status = 'resolved';
      } else if (change < -1) {
        status = 'improved';
      } else if (change > 1) {
        status = 'worsened';
      }

      // Nome da região (simplificado)
      const regionName = regionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      results.push({
        regionId,
        regionName,
        previousIntensity,
        currentIntensity,
        change,
        changePercent,
        status
      });
    });

    // Ordenar por importância (pioras primeiro, depois novas, depois estáveis/melhorias)
    return results.sort((a, b) => {
      const priority = { worsened: 1, new: 2, stable: 3, improved: 4, resolved: 5 };
      return priority[a.status] - priority[b.status];
    });
  };

  const comparison = getComparison();

  // Estatísticas gerais
  const improved = comparison.filter(c => c.status === 'improved').length;
  const worsened = comparison.filter(c => c.status === 'worsened').length;
  const newRegions = comparison.filter(c => c.status === 'new').length;
  const resolved = comparison.filter(c => c.status === 'resolved').length;
  const stable = comparison.filter(c => c.status === 'stable').length;

  const avgPrevious = previousSession.painData.length > 0
    ? previousSession.painData.reduce((sum, p) => sum + p.intensity, 0) / previousSession.painData.length
    : 0;
  const avgCurrent = currentSession.painData.length > 0
    ? currentSession.painData.reduce((sum, p) => sum + p.intensity, 0) / currentSession.painData.length
    : 0;
  const avgChange = avgCurrent - avgPrevious;

  // Status Icon
  const getStatusIcon = (status: ComparisonResult['status']) => {
    switch (status) {
      case 'improved':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'worsened':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'new':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'resolved':
        return <TrendingDown className="w-4 h-4 text-emerald-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: ComparisonResult['status']) => {
    switch (status) {
      case 'improved': return 'Melhorou';
      case 'worsened': return 'Piorou';
      case 'new': return 'Nova área';
      case 'resolved': return 'Resolvida';
      default: return 'Estável';
    }
  };

  const getStatusColor = (status: ComparisonResult['status']) => {
    switch (status) {
      case 'improved': return 'bg-green-50 border-green-200 text-green-800';
      case 'worsened': return 'bg-red-50 border-red-200 text-red-800';
      case 'new': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'resolved': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl px-6 py-4 text-white">
        <h2 className="text-xl font-bold">Comparação de Evolução</h2>
        <p className="text-sm text-purple-100 mt-1">
          {patientName} • {previousSession.date} → {currentSession.date}
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{improved}</div>
          <div className="text-xs text-green-700 font-medium mt-1">Melhoraram</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{worsened}</div>
          <div className="text-xs text-red-700 font-medium mt-1">Pioraram</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{newRegions}</div>
          <div className="text-xs text-orange-700 font-medium mt-1">Novas</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{resolved}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Resolvidas</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-slate-600">{stable}</div>
          <div className="text-xs text-slate-700 font-medium mt-1">Estáveis</div>
        </div>
      </div>

      {/* Dor Média Comparativa */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Dor Média Geral</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-slate-600 mb-1">Sessão Anterior</div>
            <div className="text-2xl font-bold" style={{ color: getPainColor(avgPrevious) }}>
              {avgPrevious.toFixed(1)}/10
            </div>
          </div>
          <div className="flex items-center justify-center px-4">
            {avgChange < 0 ? (
              <TrendingDown className="w-8 h-8 text-green-600" />
            ) : avgChange > 0 ? (
              <TrendingUp className="w-8 h-8 text-red-600" />
            ) : (
              <Minus className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-600 mb-1">Sessão Atual</div>
            <div className="text-2xl font-bold" style={{ color: getPainColor(avgCurrent) }}>
              {avgCurrent.toFixed(1)}/10
            </div>
          </div>
        </div>
        {avgChange !== 0 && (
          <div className={`mt-3 text-center text-sm font-semibold ${avgChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
            {avgChange < 0 ? '↓' : '↑'} {Math.abs(avgChange).toFixed(1)} pontos {avgChange < 0 ? 'de melhora' : 'de piora'}
          </div>
        )}
      </div>

      {/* Visualização Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anterior */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-700 text-center">
            📅 {previousSession.date}
          </h3>
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200 min-h-[400px] flex items-center justify-center">
            <BodyMapSVG
              view={view}
              painData={previousSession.painData}
              onRegionClick={() => {}}
              interactive={false}
            />
          </div>
        </div>

        {/* Atual */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-700 text-center">
            📅 {currentSession.date} (Atual)
          </h3>
          <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-xl p-4 border border-slate-200 min-h-[400px] flex items-center justify-center">
            <BodyMapSVG
              view={view}
              painData={currentSession.painData}
              onRegionClick={() => {}}
              interactive={false}
            />
          </div>
        </div>
      </div>

      {/* Detalhes por Região */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-800 mb-4">
          Evolução Detalhada por Região
        </h3>
        <div className="space-y-2">
          {comparison.map((item) => (
            <div
              key={item.regionId}
              className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(item.status)}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(item.status)}
                <div>
                  <p className="font-semibold text-sm">{item.regionName}</p>
                  <p className="text-xs opacity-75">{getStatusLabel(item.status)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Anterior */}
                <div className="text-center">
                  <div className="text-xs opacity-75">Antes</div>
                  <div className="font-bold" style={{ color: item.previousIntensity > 0 ? getPainColor(item.previousIntensity) : '#94a3b8' }}>
                    {item.previousIntensity > 0 ? `${item.previousIntensity}/10` : '-'}
                  </div>
                </div>

                {/* Seta */}
                <div className="text-lg">→</div>

                {/* Atual */}
                <div className="text-center">
                  <div className="text-xs opacity-75">Agora</div>
                  <div className="font-bold" style={{ color: item.currentIntensity > 0 ? getPainColor(item.currentIntensity) : '#94a3b8' }}>
                    {item.currentIntensity > 0 ? `${item.currentIntensity}/10` : '-'}
                  </div>
                </div>

                {/* Mudança */}
                {item.change !== 0 && (
                  <div className="text-center min-w-[60px]">
                    <div className={`text-sm font-bold ${item.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change > 0 ? '+' : ''}{item.change}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {worsened > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <p className="font-semibold mb-1">⚠️ Atenção: Piora Identificada</p>
            <p className="text-red-700">
              {worsened} {worsened === 1 ? 'região apresentou' : 'regiões apresentaram'} piora. Considere reavaliar o protocolo de tratamento.
            </p>
          </div>
        </div>
      )}

      {improved > 0 && worsened === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">✅ Progresso Positivo</p>
            <p className="text-green-700">
              {improved} {improved === 1 ? 'região apresentou' : 'regiões apresentaram'} melhora significativa. Continue o protocolo atual.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMapComparison;
