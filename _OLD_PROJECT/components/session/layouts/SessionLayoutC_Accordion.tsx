import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  History,
  Activity,
  Stethoscope,
  AlertTriangle,
  Target,
  FileText,
  TrendingUp
} from 'lucide-react';
import { BodyMapProfessional, BodyMapComparisonModal, type PainData } from '../../body-map-pro';
import { SOAPFormPanel } from '../SOAPFormPanel';
import { SessionHistoryPanel } from '../SessionHistoryPanel';
import { PathologyManager } from '../PathologyManager';
import { PatientGoalsPanel } from '../PatientGoalsPanel';
import { MandatoryTestAlert as MandatoryTestAlertComponent } from '../MandatoryTestAlert';
import type { Patient, SoapNote, MandatoryTestAlert, Pathology, PatientGoal } from '../../../types';

interface SessionLayoutCProps {
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

export const SessionLayoutC_Accordion: React.FC<SessionLayoutCProps> = ({
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
  // Estado: começar com Histórico e Mapa de Dor expandidos (prioridades 1 e 2)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['history', 'bodymap'])
  );
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
        // Auto-scroll para seção expandida
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
      return newSet;
    });
  };

  const stats = {
    history: patientNotes.length,
    pathologies: pathologies.filter(p => p.status === 'active').length,
    alerts: mandatoryAlerts.filter(a => !a.isCompleted).length,
    criticalAlerts: mandatoryAlerts.filter(a => a.severity === 'critical' && !a.isCompleted).length,
    goals: goals.filter(g => g.status === 'in_progress').length,
    painRegions: painData.length
  };

  interface AccordionSectionProps {
    id: string;
    icon: React.ReactNode;
    title: string;
    badge?: { text: string; color: string };
    subtitle: string;
    color: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }

  const AccordionSection: React.FC<AccordionSectionProps> = ({
    id,
    icon,
    title,
    badge,
    subtitle,
    color,
    children
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div
        ref={el => sectionRefs.current[id] = el}
        className={`
          bg-white rounded-xl shadow-md border-2 transition-all overflow-hidden
          ${isExpanded ? `${color} border-opacity-100` : 'border-slate-200'}
        `}
      >
        {/* Header */}
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
              {icon}
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base md:text-lg font-bold text-slate-900">{title}</h3>
                {badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                    {badge.text}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <div className="ml-2">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-6 pb-6 border-t border-slate-200">
                <div className="pt-4">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4">

        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">{patient.name}</h1>
              <p className="text-sm text-blue-100 mt-1">
                Sessão #{sessionNumber}
              </p>
            </div>
            <div className="ml-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">
              {patient.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Accordion Sections - Ordem baseada na prioridade do usuário */}

        {/* 1. HISTÓRICO (Prioridade 1) */}
        <AccordionSection
          id="history"
          icon={<History className="w-5 h-5 text-blue-600" />}
          title="Histórico de Sessões"
          subtitle={`${stats.history} sessões realizadas`}
          color="border-blue-500"
        >
          <SessionHistoryPanel
            patientId={patient.id}
            limit={5}
            onReplicateConduct={() => {}}
          />
        </AccordionSection>

        {/* 2. MAPA DE DOR (Prioridade alto - usado ~2x/sessão) */}
        <AccordionSection
          id="bodymap"
          icon={<Activity className="w-5 h-5 text-indigo-600" />}
          title="Mapa de Dor"
          subtitle={stats.painRegions > 0 ? `${stats.painRegions} regiões registradas` : 'Clique para marcar regiões'}
          color="border-indigo-500"
          badge={stats.painRegions > 0 ? { text: `${stats.painRegions}`, color: 'bg-indigo-500 text-white' } : undefined}
        >
          <div className="space-y-4">
            {previousPainData.length > 0 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Comparar com Sessão Anterior</span>
              </button>
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
          </div>
        </AccordionSection>

        {/* 3. PATOLOGIAS (Prioridade 2) */}
        <AccordionSection
          id="pathologies"
          icon={<Stethoscope className="w-5 h-5 text-purple-600" />}
          title="Patologias"
          subtitle={`${stats.pathologies} diagnósticos ativos`}
          color="border-purple-500"
          badge={stats.pathologies > 0 ? { text: 'ATIVO', color: 'bg-purple-500 text-white' } : undefined}
        >
          <PathologyManager patientId={patient.id} />
        </AccordionSection>

        {/* 4. ALERTAS (Prioridade 3) */}
        <AccordionSection
          id="alerts"
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          title="Alertas e Testes"
          subtitle={`${stats.alerts} testes pendentes`}
          color="border-orange-500"
          badge={stats.criticalAlerts > 0 ? { text: `${stats.criticalAlerts} CRÍTICO`, color: 'bg-red-500 text-white' } : undefined}
        >
          {mandatoryAlerts.length > 0 ? (
            <MandatoryTestAlertComponent alerts={mandatoryAlerts} />
          ) : (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum alerta pendente</p>
            </div>
          )}
        </AccordionSection>

        {/* 5. OBJETIVOS (Prioridade 3) */}
        <AccordionSection
          id="goals"
          icon={<Target className="w-5 h-5 text-green-600" />}
          title="Objetivos do Tratamento"
          subtitle={`${stats.goals} metas em andamento`}
          color="border-green-500"
        >
          <PatientGoalsPanel patient={patient} />
        </AccordionSection>

        {/* 6. SOAP (Prioridade 3) */}
        <AccordionSection
          id="soap"
          icon={<FileText className="w-5 h-5 text-slate-600" />}
          title="Formulário SOAP"
          subtitle="Registro da sessão de hoje"
          color="border-slate-500"
        >
          <SOAPFormPanel
            patientId={patient.id}
            sessionNumber={sessionNumber}
            previousNote={patientNotes[0] || null}
            onSave={onSaveNote}
            onCancel={onCancel}
            isLoading={isSaving}
          />
        </AccordionSection>

        {/* Espaço final para scroll confortável */}
        <div className="h-20" />
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
