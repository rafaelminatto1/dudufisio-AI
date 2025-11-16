/**
 * Gamification Dashboard - Dashboard de Gamificação do Paciente
 * Activity Fisioterapia Integration - Fase 4
 */

import React, { useEffect, useState } from 'react';
import { Award, Star, Gift, TrendingUp, Trophy } from 'lucide-react';
import { GamificationService, PatientLevel, Achievement, Reward } from '@/services/gamification/GamificationService';

interface GamificationDashboardProps {
  patientId: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ patientId }) => {
  const [level, setLevel] = useState<PatientLevel | null>(null);
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, [patientId]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      const [levelData, pointsData, achievementsData] = await Promise.all([
        GamificationService.getPatientLevel(patientId),
        GamificationService.getPatientBalance(patientId),
        GamificationService.getPatientAchievements(patientId),
      ]);

      setLevel(levelData);
      setPoints(pointsData);
      setAchievements(achievementsData);
      
      // TODO: Carregar recompensas disponíveis
      // const rewardsData = await GamificationService.getAvailableRewards(clinicId);
      // setRewards(rewardsData);
      
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    const result = await GamificationService.redeemReward(patientId, rewardId);
    
    if (result.success) {
      alert('Recompensa resgatada! Aguarde aprovação.');
      loadGamificationData(); // Recarregar
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const progressPercentage = level
    ? level.points_to_next > 0
      ? ((level.current_points % 500) / 500) * 100
      : 100
    : 0;

  const levelColors = {
    Iniciante: 'from-gray-400 to-gray-500',
    Bronze: 'from-orange-600 to-orange-700',
    Prata: 'from-gray-300 to-gray-400',
    Ouro: 'from-yellow-400 to-yellow-600',
    Platina: 'from-purple-500 to-purple-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header com nível */}
      <div className={`bg-gradient-to-r ${levelColors[level?.level_name as keyof typeof levelColors] || levelColors.Iniciante} text-white p-8 rounded-lg shadow-lg border border-white/20`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold mb-1">Nível {level?.level_name || 'Iniciante'}</h2>
            <p className="text-white/80">{points.toLocaleString()} pontos</p>
          </div>
          <Trophy className="w-16 h-16 opacity-80" />
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso para próximo nível</span>
            <span>{level?.points_to_next || 0} pontos faltam</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Conquistas */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Award className="w-6 h-6 text-yellow-600" />
          Suas Conquistas
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg text-center transition-all shadow-md hover:shadow-lg border ${
                achievement.unlocked
                  ? 'bg-yellow-50 border-yellow-200 shadow-lg scale-105'
                  : 'bg-gray-100 border-gray-300 opacity-40 grayscale'
              }`}
            >
              <div className="text-5xl mb-2">{achievement.icon}</div>
              <p className="font-semibold text-sm text-slate-900">{achievement.name}</p>
              {achievement.unlocked && achievement.unlocked_at && (
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Loja de Recompensas */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Gift className="w-6 h-6 text-purple-600" />
          Recompensas Disponíveis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: '10% de Desconto', points: 500, icon: '🎟️', description: 'Desconto na próxima sessão' },
            { name: 'Sessão Gratuita', points: 1500, icon: '🎁', description: 'Uma sessão completamente grátis' },
            { name: 'Kit de Exercícios', points: 2500, icon: '🏋️', description: 'Kit de faixas elásticas' },
            { name: 'Massagem Relaxante', points: 1200, icon: '💆', description: '30 minutos de massagem' },
          ].map((reward, idx) => {
            const canAfford = points >= reward.points;
            
            return (
              <div
                key={idx}
                className={`bg-white border-2 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                  canAfford ? 'border-green-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{reward.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {reward.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {reward.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">
                        {reward.points} pontos
                      </span>
                      <button
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          canAfford
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Resgatar' : 'Sem pontos'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking (Opcional) */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Star className="w-6 h-6 text-yellow-600" />
          Ranking Semanal
        </h3>
        
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
          <div className="space-y-3">
            {[
              { position: 1, name: 'Você', points: points, isUser: true },
              { position: 2, name: 'Ana Silva', points: points - 50, isUser: false },
              { position: 3, name: 'Carlos Souza', points: points - 120, isUser: false },
            ].map((entry) => (
              <div
                key={entry.position}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  entry.isUser
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-400">
                    #{entry.position}
                  </span>
                  <span className="font-medium text-slate-900">{entry.name}</span>
                  {entry.isUser && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full border border-blue-700">
                      Você
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900">
                  {entry.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


