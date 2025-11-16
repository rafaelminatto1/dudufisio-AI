// components/atendimento/layout/AtendimentoLayout.tsx
import React, { useState } from 'react';
import { AtendimentoSidebar } from './AtendimentoSidebar';
import { AtendimentoContextPanel } from './AtendimentoContextPanel';
import type { Patient, Appointment, SoapNote, TreatmentPlan, ExercisePrescription } from '../../../types';

interface AtendimentoLayoutProps {
  children: React.ReactNode;
  patient: Patient;
  appointment: Appointment;
  sessions: SoapNote[];
  treatmentPlan?: TreatmentPlan | null;
  exercises: ExercisePrescription[];
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  canFinish: boolean;
  onFinish: () => void;
  header: React.ReactNode;
  onRepeatConduct?: () => void;
  onGenerateAI?: () => void;
  onTakePhoto?: () => void;
  onAddAttachment?: () => void;
  onViewSession?: (session: SoapNote) => void;
  onRepeatSession?: (session: SoapNote) => void;
  sessionCount?: number;
  treatmentDays?: number;
}

export const AtendimentoLayout: React.FC<AtendimentoLayoutProps> = ({
  children,
  patient,
  sessions,
  treatmentPlan,
  exercises,
  header,
  onRepeatConduct,
  onGenerateAI,
  onTakePhoto,
  onAddAttachment,
  onViewSession,
  onRepeatSession,
  sessionCount = 0,
  treatmentDays = 0,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header Fixo */}
      {header}

      {/* Área Principal - 3 Painéis */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esquerda */}
        <AtendimentoSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onRepeatConduct={onRepeatConduct}
          onGenerateAI={onGenerateAI}
          onTakePhoto={onTakePhoto}
          onAddAttachment={onAddAttachment}
          sessionCount={sessionCount}
          treatmentDays={treatmentDays}
        />

        {/* Área Central (Tabs) */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Painel Contexto Direita */}
        <AtendimentoContextPanel
          patient={patient}
          sessions={sessions}
          treatmentPlan={treatmentPlan}
          exercises={exercises}
          isCollapsed={isContextCollapsed}
          onToggleCollapse={() => setIsContextCollapsed(!isContextCollapsed)}
          onViewSession={onViewSession}
          onRepeatSession={onRepeatSession}
        />
      </div>
    </div>
  );
};
