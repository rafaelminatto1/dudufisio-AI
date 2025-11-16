import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, CheckCircle, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as patientGoalsService from '../../services/patientGoalsService';
import * as appointmentService from '../../services/appointmentService';
import { PatientGoal, Patient } from '../../types';
import GoalFormModal from './GoalFormModal';
import GoalCountdown from './GoalCountdown';

/**
 * Painel de Objetivos do Paciente
 * Lista objetivos com countdown visual
 * CRUD de objetivos
 * Métricas rápidas do paciente
 */

interface PatientGoalsPanelProps {
  patient: Patient;
}

export const PatientGoalsPanel: React.FC<PatientGoalsPanelProps> = ({ patient }) => {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PatientGoal | null>(null);
  
  // Métricas rápidas
  const [totalSessions, setTotalSessions] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [nextAppointment, setNextAppointment] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, [patient.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar objetivos
      const goalsData = await patientGoalsService.getGoalsByPatientId(patient.id);
      const sorted = patientGoalsService.sortGoalsByPriorityAndDate(goalsData);
      setGoals(sorted);

      // Carregar métricas rápidas
      await loadMetrics();
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
      showToast('Erro ao carregar objetivos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const appointments = await appointmentService.getAppointments();
      const patientAppointments = appointments.filter(a => a.patientId === patient.id);
      
      // Total de sessões realizadas
      const completed = patientAppointments.filter(a => a.status === 'Realizado');
      setTotalSessions(completed.length);

      // Taxa de presença
      const total = patientAppointments.length;
      const rate = total > 0 ? (completed.length / total) * 100 : 0;
      setAttendanceRate(Math.round(rate));

      // Próxima sessão agendada
      const future = patientAppointments
        .filter(a => new Date(a.startTime) > new Date() && a.status === 'Agendado')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      if (future.length > 0) {
        setNextAppointment(new Date(future[0].startTime));
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const handleAdd = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal: PatientGoal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (goalId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este objetivo?')) {
      return;
    }

    try {
      await patientGoalsService.deleteGoal(goalId);
      showToast('Objetivo removido com sucesso', 'success');
      await loadData();
    } catch (error) {
      showToast('Erro ao remover objetivo', 'error');
    }
  };

  const handleMarkCompleted = async (goalId: string) => {
    try {
      await patientGoalsService.markGoalCompleted(goalId);
      showToast('Objetivo marcado como concluído! 🎉', 'success');
      await loadData();
    } catch (error) {
      showToast('Erro ao atualizar objetivo', 'error');
    }
  };

  const handleModalClose = async (refresh: boolean) => {
    setIsModalOpen(false);
    setSelectedGoal(null);
    if (refresh) {
      await loadData();
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <div className="space-y-6">
      {/* Info Básica do Paciente */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          {patient.avatarUrl && (
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{patient.name}</h3>
            <p className="text-xs text-slate-600">
              {patient.age} anos • {patient.gender === 'M' || patient.gender === 'male' ? 'Masculino' : 'Feminino'}
            </p>
          </div>
        </div>

        {/* Contatos Rápidos */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/55${patient.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`tel:${patient.phone}`}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Ligar</span>
          </a>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-slate-600">Sessões</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{totalSessions}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-slate-600">Presença</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{attendanceRate}%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-slate-600">Próxima</p>
          </div>
          <p className="text-xs font-semibold text-slate-900">
            {nextAppointment
              ? nextAppointment.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : '-'}
          </p>
        </div>
      </div>

      {/* Objetivos com Countdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Objetivos</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-2">Nenhum objetivo definido</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              className="text-blue-600"
            >
              Adicionar Primeiro Objetivo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map(goal => {
              const info = patientGoalsService.formatGoalInfo(goal);

              return (
                <div key={goal.id} className="relative group">
                  {/* Countdown Card */}
                  {goal.targetDate ? (
                    <GoalCountdown
                      targetDate={goal.targetDate}
                      title={goal.title}
                      currentProgress={goal.currentProgress}
                      size="md"
                    />
                  ) : (
                    // Goal sem data alvo - card simples
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 flex-1">{goal.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${info.priorityColor}`}>
                          {goal.priority === 'low' ? 'Baixa' : goal.priority === 'medium' ? 'Média' : goal.priority === 'high' ? 'Alta' : 'Crítica'}
                        </span>
                      </div>

                      {goal.description && (
                        <p className="text-xs text-slate-600 mb-2">{goal.description}</p>
                      )}

                      {/* Barra de Progresso */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Progresso</span>
                          <span className="font-semibold text-blue-600">
                            {goal.currentProgress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${goal.currentProgress || 0}%` }}
                          />
                        </div>
                      </div>

                      {info.progressText && (
                        <p className="text-xs text-slate-600 mt-2">{info.progressText}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons (aparecem no hover) */}
                  <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {goal.currentProgress && goal.currentProgress < 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkCompleted(goal.id)}
                        className="h-7 w-7 p-0 bg-white shadow-sm text-green-600 hover:bg-green-50"
                        title="Marcar como concluído"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                      className="h-7 w-7 p-0 bg-white shadow-sm hover:bg-slate-100"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="h-7 w-7 p-0 bg-white shadow-sm text-red-600 hover:bg-red-50"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <GoalFormModal
          isOpen={isModalOpen}
          patientId={patient.id}
          goal={selectedGoal}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default PatientGoalsPanel;

