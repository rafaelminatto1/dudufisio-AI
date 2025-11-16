import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Stethoscope,
  AlertTriangle,
  Target,
  Activity,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText
} from 'lucide-react';
import { BodyMapProfessional, BodyMapComparisonModal, type PainData } from '../../body-map-pro';
import { SOAPFormPanel } from '../SOAPFormPanel';
import { SessionHistoryPanel } from '../SessionHistoryPanel';
import { PathologyManager } from '../PathologyManager';
import { PatientGoalsPanel } from '../PatientGoalsPanel';
import { MandatoryTestAlert as MandatoryTestAlertComponent } from '../MandatoryTestAlert';
import type { Patient, SoapNote, MandatoryTestAlert, Pathology, PatientGoal } from '../../../types';

interface SessionLayoutAProps {
  patient: Patient;
  sessionNumber: number;
  patientNotes: SoapNote[];
  mandatoryAlerts: MandatoryTestAlert[];
  pathologies: Pathology[];
  goals: PatientGoal[];
  painData: PainData[];
  previousPainData: PainData[];
  onSavePainData: (data: any) => void;
  onDeletePainData: (regionId: string) => void;
  onSaveNote: (note: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const SessionLayoutA_Cards: React.FC<SessionLayoutAProps> = ({
  patient,
  sessionNumber,
  patientNotes,
  mandatoryAlerts,
  pathologies,
  goals,
  painData,
  previousPainData,
  onSavePainData,
  onDeletePainData,
  onSaveNote,
  onCancel,
  isSaving
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>('bodymap'); // Body Map expandido por padrão
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Estatísticas para os cards
  const stats = {
    history: patientNotes.length,
    pathologies: pathologies.filter(p => p.status === 'active').length,
    alerts: mandatoryAlerts.filter(a => !a.isCompleted).length,
    criticalAlerts: mandatoryAlerts.filter(a => a.severity === 'critical' && !a.isCompleted).length,
    goals: goals.filter(g => g.status === 'in_progress').length,
    completedGoals: goals.filter(g => g.status === 'achieved').length,
    painRegions: painData.length,
    avgPain: painData.length > 0 ? (painData.reduce((sum, p) => sum + p.intensity, 0) / painData.length).toFixed(1) : '0'
  };

  // Card de resumo clicável
  const SummaryCard: React.FC<{
    id: string;
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    badge?: { text: string; color: string };
    onClick: () => void;
    isExpanded: boolean;
  }> = ({ id, icon, title, value, subtitle, color, badge, onClick, isExpanded }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all
        ${isExpanded
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg'
          : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md'
        }
      `}
    >
      {badge && (
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
          {badge.text}
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* Header com Info do Paciente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-sm text-slate-600 mt-1">
                Sessão #{sessionNumber} • {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right mr-4">
                <p className="text-xs text-slate-500">Idade</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} anos
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                {patient.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Resumo - Grid Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card: Histórico */}
          <SummaryCard
            id="history"
            icon={<History className="w-5 h-5 text-blue-600" />}
            title="Histórico"
            value={stats.history}
            subtitle="sessões realizadas"
            color="bg-blue-100"
            onClick={() => toggleCard('history')}
            isExpanded={expandedCard === 'history'}
          />

          {/* Card: Patologias */}
          <SummaryCard
            id="pathologies"
            icon={<Stethoscope className="w-5 h-5 text-purple-600" />}
            title="Patologias"
            value={stats.pathologies}
            subtitle="diagnósticos ativos"
            color="bg-purple-100"
            badge={stats.pathologies > 0 ? { text: 'ATIVO', color: 'bg-purple-500 text-white' } : undefined}
            onClick={() => toggleCard('pathologies')}
            isExpanded={expandedCard === 'pathologies'}
          />

          {/* Card: Alertas */}
          <SummaryCard
            id="alerts"
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
            title="Alertas"
            value={stats.alerts}
            subtitle="testes pendentes"
            color="bg-orange-100"
            badge={stats.criticalAlerts > 0 ? { text: `${stats.criticalAlerts} CRÍTICO`, color: 'bg-red-500 text-white' } : undefined}
            onClick={() => toggleCard('alerts')}
            isExpanded={expandedCard === 'alerts'}
          />

          {/* Card: Objetivos */}
          <SummaryCard
            id="goals"
            icon={<Target className="w-5 h-5 text-green-600" />}
            title="Objetivos"
            value={stats.goals}
            subtitle={`${stats.completedGoals} concluídos`}
            color="bg-green-100"
            onClick={() => toggleCard('goals')}
            isExpanded={expandedCard === 'goals'}
          />
        </div>

        {/* Conteúdo Expandido dos Cards */}
        {expandedCard === 'history' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-blue-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>Histórico de Sessões</span>
              </h2>
            </div>
            <SessionHistoryPanel
              patientId={patient.id}
              limit={5}
              onReplicateConduct={() => {}}
            />
          </motion.div>
        )}

        {expandedCard === 'pathologies' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-purple-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                <span>Patologias Ativas</span>
              </h2>
            </div>
            <PathologyManager patientId={patient.id} />
          </motion.div>
        )}

        {expandedCard === 'alerts' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-orange-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Alertas e Testes Obrigatórios</span>
              </h2>
            </div>
            <MandatoryTestAlertComponent alerts={mandatoryAlerts} />
          </motion.div>
        )}

        {expandedCard === 'goals' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Objetivos do Tratamento</span>
              </h2>
            </div>
            <PatientGoalsPanel patient={patient} />
          </motion.div>
        )}

        {/* MAPA DE DOR - DESTAQUE PRINCIPAL */}
        <motion.div
          layout
          className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-indigo-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mapa de Dor</h2>
                <p className="text-sm text-slate-600">Clique nas regiões para marcar a dor</p>
              </div>
            </div>
            {previousPainData.length > 0 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-md"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Comparar Evolução</span>
              </button>
            )}
          </div>

          {/* Estatísticas de Dor */}
          {painData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-slate-600 font-medium">Regiões</p>
                <p className="text-2xl font-bold text-slate-900">{stats.painRegions}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-slate-600 font-medium">Dor Média</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgPain}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-slate-600 font-medium">Máxima</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.max(...painData.map(p => p.intensity))}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-slate-600 font-medium">Mínima</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.min(...painData.map(p => p.intensity))}
                </p>
              </div>
            </div>
          )}

          <BodyMapProfessional
            patientId={patient.id}
            patientName={patient.name}
            painData={painData}
            onSavePainData={onSavePainData}
            onDeletePainData={onDeletePainData}
            onViewHistory={() => setShowComparisonModal(true)}
            readOnly={false}
          />
        </motion.div>

        {/* FORMULÁRIO SOAP */}
        <motion.div
          layout
          className="bg-white rounded-xl p-6 shadow-md border border-slate-200"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-slate-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Formulário SOAP</h2>
              <p className="text-sm text-slate-600">Registro da sessão de hoje</p>
            </div>
          </div>

          <SOAPFormPanel
            patientId={patient.id}
            sessionNumber={sessionNumber}
            previousNote={patientNotes[0] || null}
            onSave={onSaveNote}
            onCancel={onCancel}
            isLoading={isSaving}
          />
        </motion.div>

      </div>

      {/* Modal de Comparação */}
      <BodyMapComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        patientName={patient.name}
        previousSessionNumber={sessionNumber - 1}
        currentSessionNumber={sessionNumber}
        previousPainData={previousPainData}
        currentPainData={painData}
      />
    </div>
  );
};
