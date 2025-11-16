import React from 'react';
import { MapPin, ExternalLink, Activity, Loader } from 'lucide-react';
import CollapsibleCard from '../CollapsibleCard';
import { useNavigate } from 'react-router-dom';

interface PainMapCardProps {
  patientId: string;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * Card com visualização compacta do mapa de dor
 * Integrado com o sistema de body-map real
 */
const PainMapCard: React.FC<PainMapCardProps> = ({
  patientId,
  defaultExpanded = false,
  onToggle,
}) => {
  const navigate = useNavigate();
  
  // Integração real com o sistema de body-map
  const { bodyPoints, isLoading, error } = useBodyMap(patientId);
  
  // Calcula métricas baseadas nos pontos reais
  const activeRegions = bodyPoints.length;
  const averagePain = bodyPoints.length > 0
    ? bodyPoints.reduce((sum, point) => sum + point.painLevel, 0) / bodyPoints.length
    : 0;
  
  // Última atualização (ponto mais recente)
  const lastUpdate = bodyPoints.length > 0
    ? new Date(bodyPoints[0].createdAt).toLocaleDateString('pt-BR')
    : null;

  const handleViewFullMap = () => {
    // Navega para a página do paciente, aba do mapa de dor
    navigate(`/patients/${patientId}?tab=pain-map`);
  };

  return (
    <CollapsibleCard
      id="pain-map"
      title="Mapa de Dor"
      icon={<MapPin className="w-5 h-5" />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            <Loader className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
            <p>Carregando mapa de dor...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-6 text-red-500 text-sm">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-red-300" />
            <p>Erro ao carregar dados</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : activeRegions === 0 ? (
          /* Empty State */
          <div className="text-center py-6 text-slate-500 text-sm">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Nenhum registro de dor</p>
            <p className="text-xs mt-1">
              Registre pontos de dor para acompanhar a evolução
            </p>
          </div>
        ) : (
          <>
            {/* Métricas Resumidas */}
            <div className="grid grid-cols-2 gap-3">
              {/* Regiões Ativas */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">Pontos</span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {activeRegions}
                </div>
              </div>

              {/* Dor Média */}
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-800">Média</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {averagePain.toFixed(1)}/10
                </div>
              </div>
            </div>

            {/* Última Atualização */}
            {lastUpdate && (
              <div className="text-xs text-slate-500 text-center">
                Última atualização: {lastUpdate}
              </div>
            )}

            {/* Preview dos pontos mais recentes */}
            {bodyPoints.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  Regiões com dor recente:
                </p>
                <div className="space-y-1">
                  {bodyPoints.slice(0, 3).map((point, idx) => (
                    <div key={point.id || idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{point.bodyRegion}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-medium">
                        {point.painLevel}/10
                      </span>
                    </div>
                  ))}
                  {bodyPoints.length > 3 && (
                    <p className="text-xs text-slate-500 mt-1">
                      +{bodyPoints.length - 3} regiões
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Botão para Ver Mapa Completo */}
        <button
          onClick={handleViewFullMap}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {isLoading ? 'Carregando...' : 'Ver Mapa Completo'}
        </button>
      </div>
    </CollapsibleCard>
  );
};

export default PainMapCard;

