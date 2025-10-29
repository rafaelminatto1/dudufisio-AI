import React, { useState } from 'react';
import { Eye, History, BarChart3, FileText, Maximize2 } from 'lucide-react';
import BodyMapSVG, { type PainData } from './BodyMapSVG';
import PainIntensityModal, { type PainModalData } from './PainIntensityModal';
import { getPainColor, PAIN_INTENSITY_LABELS } from './body-regions-data';

interface BodyMapProfessionalProps {
  patientId: string;
  patientName: string;
  painData?: PainData[];
  onSavePainData?: (data: PainModalData) => void;
  onDeletePainData?: (regionId: string) => void;
  onViewHistory?: () => void;
  onViewCharts?: () => void;
  onGenerateReport?: () => void;
  readOnly?: boolean;
}

/**
 * Body Map Profissional - Componente Principal
 *
 * Features:
 * - Mapa corporal anatômico (frente/costas)
 * - Registro de dor por região
 * - Modal de intensidade com slider
 * - Estatísticas em tempo real
 * - Ações rápidas (histórico, gráficos, relatório)
 */
const BodyMapProfessional: React.FC<BodyMapProfessionalProps> = ({
  patientId,
  patientName,
  painData = [],
  onSavePainData,
  onDeletePainData,
  onViewHistory,
  onViewCharts,
  onGenerateReport,
  readOnly = false
}) => {
  // State
  const [view, setView] = useState<'front' | 'back'>('front');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);

  // Dados da região selecionada
  const selectedPainData = painData.find(p => p.regionId === selectedRegionId);

  // Estatísticas
  const totalRegions = painData.length;
  const averagePain = totalRegions > 0
    ? painData.reduce((sum, p) => sum + p.intensity, 0) / totalRegions
    : 0;
  const maxPain = totalRegions > 0
    ? Math.max(...painData.map(p => p.intensity))
    : 0;
  const minPain = totalRegions > 0
    ? Math.min(...painData.map(p => p.intensity))
    : 0;

  // Handlers
  const handleRegionClick = (regionId: string) => {
    if (readOnly) return;

    setSelectedRegionId(regionId);
    setIsModalOpen(true);
  };

  const handleSavePain = (data: PainModalData) => {
    onSavePainData?.(data);
    setIsModalOpen(false);
    setSelectedRegionId(null);
  };

  const handleDeletePain = (regionId: string) => {
    onDeletePainData?.(regionId);
    setIsModalOpen(false);
    setSelectedRegionId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold">Mapa de Dor</h2>
            <p className="text-sm text-blue-100 mt-0.5">
              {patientName} {!readOnly && '• Clique nas regiões para registrar dor'}
            </p>
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
              showLabels
                ? 'bg-white text-blue-600'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Labels</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar com Controles e Estatísticas */}
          <div className="lg:col-span-1 space-y-4">
            {/* Controle de Vista */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Visualização
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('front')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    view === 'front'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Frente
                </button>
                <button
                  onClick={() => setView('back')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    view === 'back'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Costas
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Estatísticas
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Total de Regiões */}
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Regiões</div>
                  <div className="text-2xl font-bold text-slate-800">{totalRegions}</div>
                </div>

                {/* Dor Média */}
                <div
                  className="rounded-lg p-3 border-2"
                  style={{
                    backgroundColor: totalRegions > 0 ? `${getPainColor(averagePain)}20` : '#f1f5f9',
                    borderColor: totalRegions > 0 ? getPainColor(averagePain) : '#cbd5e1'
                  }}
                >
                  <div className="text-xs text-slate-600 mb-1">Média</div>
                  <div className="text-2xl font-bold" style={{ color: totalRegions > 0 ? getPainColor(averagePain) : '#64748b' }}>
                    {averagePain.toFixed(1)}
                  </div>
                </div>

                {/* Dor Máxima */}
                {totalRegions > 0 && (
                  <div
                    className="rounded-lg p-3 border-2"
                    style={{
                      backgroundColor: `${getPainColor(maxPain)}20`,
                      borderColor: getPainColor(maxPain)
                    }}
                  >
                    <div className="text-xs text-slate-600 mb-1">Máxima</div>
                    <div className="text-2xl font-bold" style={{ color: getPainColor(maxPain) }}>
                      {maxPain}/10
                    </div>
                  </div>
                )}

                {/* Dor Mínima */}
                {totalRegions > 0 && (
                  <div
                    className="rounded-lg p-3 border-2"
                    style={{
                      backgroundColor: `${getPainColor(minPain)}20`,
                      borderColor: getPainColor(minPain)
                    }}
                  >
                    <div className="text-xs text-slate-600 mb-1">Mínima</div>
                    <div className="text-2xl font-bold" style={{ color: getPainColor(minPain) }}>
                      {minPain}/10
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Legenda */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Escala de Dor</h3>
              <div className="space-y-2">
                {[
                  { range: '0', color: '#f1f5f9', label: 'Sem dor' },
                  { range: '1-3', color: '#22c55e', label: 'Leve' },
                  { range: '4-6', color: '#eab308', label: 'Moderada' },
                  { range: '7-8', color: '#f97316', label: 'Intensa' },
                  { range: '9-10', color: '#ef4444', label: 'Severa' }
                ].map(({ range, color, label }) => (
                  <div key={range} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md border border-slate-300 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-slate-700">
                      <span className="font-semibold">{range}</span> - {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2">
              {onViewHistory && (
                <button
                  onClick={onViewHistory}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-slate-700 font-medium"
                >
                  <History className="w-4 h-4" />
                  Ver Histórico
                </button>
              )}

              {onViewCharts && (
                <button
                  onClick={onViewCharts}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-slate-700 font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  Ver Gráficos
                </button>
              )}

              {onGenerateReport && (
                <button
                  onClick={onGenerateReport}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  Gerar Relatório PDF
                </button>
              )}
            </div>
          </div>

          {/* Mapa Corporal */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 min-h-[600px] flex items-center justify-center">
              <BodyMapSVG
                view={view}
                painData={painData}
                onRegionClick={handleRegionClick}
                selectedRegionId={selectedRegionId}
                showLabels={showLabels}
                interactive={!readOnly}
              />
            </div>

            {/* Info quando vazio */}
            {totalRegions === 0 && !readOnly && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800 font-medium">
                  👆 Clique em qualquer região do corpo para registrar dor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Regiões com Dor */}
        {totalRegions > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              Regiões com Dor Registrada ({totalRegions})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {painData.map((pain) => {
                // Encontrar nome da região (simplificado, melhorar depois)
                const regionName = pain.regionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <div
                    key={pain.regionId}
                    className="bg-white border-2 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer"
                    style={{ borderColor: getPainColor(pain.intensity) }}
                    onClick={() => handleRegionClick(pain.regionId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {regionName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {PAIN_INTENSITY_LABELS[pain.intensity]}
                        </p>
                      </div>
                      <div
                        className="text-xl font-bold px-2 py-1 rounded-md"
                        style={{
                          color: getPainColor(pain.intensity),
                          backgroundColor: `${getPainColor(pain.intensity)}20`
                        }}
                      >
                        {pain.intensity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Intensidade de Dor */}
      <PainIntensityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRegionId(null);
        }}
        regionId={selectedRegionId || undefined}
        view={view}
        initialData={selectedPainData ? {
          regionId: selectedPainData.regionId,
          intensity: selectedPainData.intensity,
          type: selectedPainData.type || 'aguda',
          notes: selectedPainData.notes || ''
        } : undefined}
        onSave={handleSavePain}
        onDelete={handleDeletePain}
      />
    </div>
  );
};

export default BodyMapProfessional;
