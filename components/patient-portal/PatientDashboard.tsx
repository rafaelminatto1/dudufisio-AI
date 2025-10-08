/**
 * Patient Dashboard - Dashboard do Portal do Paciente
 * Activity Fisioterapia Integration - Fase 4
 */

import React, { useEffect, useState } from 'react';
import { Calendar, Activity, Award, TrendingUp, FileText, Video } from 'lucide-react';
import { GamificationService, PatientLevel } from '@/services/gamification/GamificationService';

interface PatientDashboardProps {
  patientId: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientId }) => {
  const [level, setLevel] = useState<PatientLevel | null>(null);
  const [points, setPoints] = useState(0);
  const [nextAppointments, setNextAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [patientId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar nível e pontos
      const [levelData, pointsData] = await Promise.all([
        GamificationService.getPatientLevel(patientId),
        GamificationService.getPatientBalance(patientId),
      ]);

      setLevel(levelData);
      setPoints(pointsData);
      
      // TODO: Carregar próximos agendamentos
      // const appointments = await getNextAppointments(patientId);
      // setNextAppointments(appointments);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = level
    ? ((level.current_points % 500) / 500) * 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header com boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao seu Portal! 👋</h1>
        <p className="text-blue-100">Acompanhe sua evolução e alcance suas metas</p>
      </div>

      {/* Cards de métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Nível */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Nível</span>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {level?.level_name || 'Iniciante'}
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {level?.points_to_next || 0} pontos para próximo nível
            </p>
          </div>
        </div>

        {/* Pontos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pontos</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {points.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Disponíveis para resgatar
          </p>
        </div>

        {/* Próxima Consulta */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Próxima Consulta</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            Amanhã
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            14:00 - Dr. Eduardo
          </p>
        </div>

        {/* Exercícios */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Exercícios Hoje</span>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            3/5
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            2 restantes
          </p>
        </div>
      </div>

      {/* Seções principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próximas Consultas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximas Consultas
          </h2>
          <div className="space-y-3">
            {/* Placeholder */}
            <div className="border dark:border-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Fisioterapia Esportiva</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dr. Eduardo Silva</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  Confirmada
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📅 Amanhã, 14:00
              </p>
            </div>
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Agendar Nova Consulta
          </button>
        </div>

        {/* Exercícios do Dia */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Seus Exercícios
          </h2>
          <div className="space-y-3">
            {/* Placeholder */}
            <div className="border dark:border-gray-700 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">Alongamento de Quadríceps</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3x 30 segundos</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>
            <div className="border dark:border-gray-700 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">Fortalecimento de Joelho</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3x 15 repetições</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conquistas Recentes */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Conquistas Recentes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎯', name: 'Primeira Consulta', unlocked: true },
            { icon: '⭐', name: 'Dedicado', unlocked: true },
            { icon: '🔥', name: 'Semana Completa', unlocked: false },
            { icon: '💪', name: 'Comprometido', unlocked: false },
          ].map((achievement, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg text-center ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30'
                  : 'bg-gray-100 dark:bg-gray-700 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <p className="text-sm font-medium">{achievement.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
