import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Target,
  Stethoscope,
  History,
  Activity,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BodyMapProfessional, BodyMapComparisonModal, type PainData } from '../../body-map-pro';
import { SOAPFormPanel } from '../SOAPFormPanel';
import { SessionHistoryPanel } from '../SessionHistoryPanel';
import { PathologyManager } from '../PathologyManager';
import { PatientGoalsPanel } from '../PatientGoalsPanel';
import { MandatoryTestAlert as MandatoryTestAlertComponent } from '../MandatoryTestAlert';
import type { Patient, SoapNote, MandatoryTestAlert, Pathology, PatientGoal } from '../../../types';

interface SessionLayoutBProps {
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

export const SessionLayoutB_Columns: React.FC<SessionLayoutBProps> = ({
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
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'alerts' | 'pathologies' | 'goals' | 'history'>('alerts');

  const stats = {
    alerts: mandatoryAlerts.filter(a => !a.isCompleted).length,
    criticalAlerts: mandatoryAlerts.filter(a => a.severity === 'critical' && !a.isCompleted).length,
    pathologies: pathologies.filter(p => p.status === 'active').length,
    goals: goals.filter(g => g.status === 'in_progress').length,
    history: patientNotes.length
  };

  return (
    <div className="h-full flex overflow-hidden bg-slate-50">

      {/* COLUNA PRINCIPAL (65-75%) */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'mr-12' : 'mr-0'}`}>
        <div className="p-4 md:p-6 space-y-6">

          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Sessão #{sessionNumber} • {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Idade</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} anos
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                  {patient.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          {/* MAPA DE DOR */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-indigo-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Mapa de Dor</h2>
                  <p className="text-sm text-slate-600">Registre as regiões com dor</p>
                </div>
              </div>
              {previousPainData.length > 0 && (
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden md:inline">Comparar</span>
                </button>
              )}
            </div>

            <BodyMapProfessional
              patientId={patient.id}
              patientName={patient.name}
              painData={painData}
              onSavePainData={onSavePainData}
              onDeletePainData={onDeletePainData}
              onViewHistory={() => setShowComparisonModal(true)}
              readOnly={false}
            />
          </div>

          {/* FORMULÁRIO SOAP */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-slate-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Formulário SOAP</h2>
                <p className="text-sm text-slate-600">Preencha o registro da sessão</p>
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
          </div>
        </div>
      </div>

      {/* SIDEBAR CONTEXTUAL (35-25%) */}
      <div className={`
        bg-white border-l border-slate-200 shadow-xl transition-all duration-300 overflow-hidden
        ${sidebarCollapsed ? 'w-12' : 'w-full md:w-96 lg:w-[400px]'}
      `}>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
        >
          {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {!sidebarCollapsed ? (
          <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveSidebarTab('alerts')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeSidebarTab === 'alerts'
                    ? 'text-orange-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden lg:inline">Alertas</span>
                  {stats.alerts > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.alerts}
                    </span>
                  )}
                </div>
                {activeSidebarTab === 'alerts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                )}
              </button>

              <button
                onClick={() => setActiveSidebarTab('pathologies')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeSidebarTab === 'pathologies'
                    ? 'text-purple-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Stethoscope className="w-4 h-4" />
                  <span className="hidden lg:inline">Patologias</span>
                  {stats.pathologies > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.pathologies}
                    </span>
                  )}
                </div>
                {activeSidebarTab === 'pathologies' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>

              <button
                onClick={() => setActiveSidebarTab('goals')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeSidebarTab === 'goals'
                    ? 'text-green-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden lg:inline">Objetivos</span>
                </div>
                {activeSidebarTab === 'goals' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
                )}
              </button>

              <button
                onClick={() => setActiveSidebarTab('history')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeSidebarTab === 'history'
                    ? 'text-blue-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <History className="w-4 h-4" />
                  <span className="hidden lg:inline">Histórico</span>
                </div>
                {activeSidebarTab === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSidebarTab === 'alerts' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>Alertas e Testes</span>
                  </h3>
                  {mandatoryAlerts.length > 0 ? (
                    <MandatoryTestAlertComponent alerts={mandatoryAlerts} />
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhum alerta pendente</p>
                    </div>
                  )}
                </div>
              )}

              {activeSidebarTab === 'pathologies' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                    <span>Patologias Ativas</span>
                  </h3>
                  <PathologyManager patientId={patient.id} />
                </div>
              )}

              {activeSidebarTab === 'goals' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span>Objetivos do Tratamento</span>
                  </h3>
                  <PatientGoalsPanel patient={patient} />
                </div>
              )}

              {activeSidebarTab === 'history' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                    <History className="w-4 h-4 text-blue-600" />
                    <span>Histórico de Sessões</span>
                  </h3>
                  <SessionHistoryPanel
                    patientId={patient.id}
                    limit={10}
                    onReplicateConduct={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Sidebar colapsada - ícones verticais
          <div className="h-full flex flex-col items-center py-4 space-y-4">
            <button
              onClick={() => {
                setSidebarCollapsed(false);
                setActiveSidebarTab('alerts');
              }}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
              title="Alertas"
            >
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              {stats.alerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.alerts}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSidebarCollapsed(false);
                setActiveSidebarTab('pathologies');
              }}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Patologias"
            >
              <Stethoscope className="w-5 h-5 text-purple-600" />
            </button>

            <button
              onClick={() => {
                setSidebarCollapsed(false);
                setActiveSidebarTab('goals');
              }}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Objetivos"
            >
              <Target className="w-5 h-5 text-green-600" />
            </button>

            <button
              onClick={() => {
                setSidebarCollapsed(false);
                setActiveSidebarTab('history');
              }}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Histórico"
            >
              <History className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        )}
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
