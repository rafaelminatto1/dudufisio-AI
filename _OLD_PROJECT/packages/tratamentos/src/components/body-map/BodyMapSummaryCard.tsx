/**
 * BODY MAP SUMMARY CARD
 * Card resumido para exibir atualizações recentes do mapa corporal
 * Usado na página de Acompanhamento
 */

import React from 'react';
import { MapPin, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getPainLevelColor } from '../../services/bodyMapService';

interface PatientWithPainUpdate extends Patient {
  lastPainLevel?: number;
  painTrend?: 'improving' | 'worsening' | 'stable';
  lastSessionDate?: Date;
}

interface BodyMapSummaryCardProps {
  patientsWithPainUpdates: PatientWithPainUpdate[];
}

const BodyMapSummaryCard: React.FC<BodyMapSummaryCardProps> = ({
  patientsWithPainUpdates,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Mapa de Dor - Atualizações</h3>
              <p className="text-sm text-slate-600">Últimas mudanças reportadas</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/body-map-reports')}
          >
            Ver Todos
          </Button>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="divide-y divide-slate-100">
        {patientsWithPainUpdates.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 font-medium">Nenhuma atualização recente</p>
            <p className="text-sm text-slate-500 mt-1">
              As mudanças no mapa de dor aparecerão aqui
            </p>
          </div>
        ) : (
          patientsWithPainUpdates.slice(0, 5).map((patient) => (
            <div
              key={patient.id}
              className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/body-map-dashboard/${patient.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 truncate">
                      {patient.name}
                    </h4>
                    {patient.painTrend && (
                      <Badge
                        className={
                          patient.painTrend === 'improving'
                            ? 'bg-green-100 text-green-700'
                            : patient.painTrend === 'worsening'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }
                      >
                        {patient.painTrend === 'improving' && (
                          <TrendingDown className="w-3 h-3 mr-1 inline" />
                        )}
                        {patient.painTrend === 'worsening' && (
                          <TrendingUp className="w-3 h-3 mr-1 inline" />
                        )}
                        {patient.painTrend === 'improving'
                          ? 'Melhorando'
                          : patient.painTrend === 'worsening'
                          ? 'Piorando'
                          : 'Estável'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                    {patient.lastPainLevel !== undefined && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPainLevelColor(patient.lastPainLevel) }}
                        />
                        <span>Dor: {patient.lastPainLevel}/10</span>
                      </div>
                    )}
                    {patient.lastSessionDate && (
                      <span className="text-xs">
                        {new Date(patient.lastSessionDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Alerta se piorando */}
                {patient.painTrend === 'worsening' && (
                  <div className="flex-shrink-0">
                    <div className="bg-red-100 rounded-full p-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BodyMapSummaryCard;

