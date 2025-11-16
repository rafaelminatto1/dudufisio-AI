import React from 'react';
import { Activity, TrendingUp, Zap, Target } from 'lucide-react';
import { AthleteProfile, RehabProgression } from '../../types/sportsRehabTypes';

interface AthleteQuickStatsProps {
  profile: AthleteProfile;
  progression?: RehabProgression | null;
  totalSessions?: number;
  acwr?: number;
}

export const AthleteQuickStats: React.FC<AthleteQuickStatsProps> = ({
  profile,
  progression,
  totalSessions = 0,
  acwr = 0,
}) => {
  const getPhaseLabel = (phase: string) => {
    const phases: Record<string, string> = {
      phase1_acute: 'Fase 1',
      phase2_intermediate: 'Fase 2',
      phase3_advanced: 'Fase 3',
      phase4_sport: 'Fase 4',
      phase5_rtp: 'Fase 5',
    };
    return phases[phase] || phase;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Fase Atual</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {getPhaseLabel(profile.currentPhase)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Progresso</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {progression?.overallProgress || 0}%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progression?.overallProgress || 0}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Sessões</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
        <p className="text-sm text-gray-600 mt-1">Registradas</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">ACWR</h3>
        </div>
        <p className={`text-2xl font-bold ${
          acwr > 1.5 ? 'text-red-600' :
          acwr < 0.8 ? 'text-orange-600' :
          'text-green-600'
        }`}>
          {acwr.toFixed(2)}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {acwr > 1.5 ? '⚠️ Alto risco' :
           acwr < 0.8 ? '⚠️ Subcarga' :
           '✅ Ideal'}
        </p>
      </div>
    </div>
  );
};

export default AthleteQuickStats;




