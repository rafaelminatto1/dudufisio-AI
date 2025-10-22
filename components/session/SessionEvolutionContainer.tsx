import React, { useState, useEffect } from 'react';
import { Patient, EnrichedAppointment, SessionEvolution, Surgery, PatientGoal, Pathology, SoapNote } from '../../types';
import { Loader2 } from 'lucide-react';

/**
 * Container principal para evolução de sessão
 * Layout de 4 colunas: SOAP | Histórico | Evolução | Resumo
 * Este container é usado pelas 3 versões (página, modal, expansão)
 */

interface SessionEvolutionContainerProps {
  appointmentId: string;
  patient: Patient;
  appointment: EnrichedAppointment;
  onClose?: () => void;
  onSave?: () => void;
  
  // Componentes das 4 colunas (slots para injeção)
  soapFormSlot?: React.ReactNode;
  historySlot?: React.ReactNode;
  evolutionSlot?: React.ReactNode;
  summarySlot?: React.ReactNode;
  
  // Layout configuration
  layout?: '4-columns' | '3-columns' | '2-columns' | 'mobile';
  className?: string;
}

export const SessionEvolutionContainer: React.FC<SessionEvolutionContainerProps> = ({
  appointmentId,
  patient,
  appointment,
  onClose,
  onSave,
  soapFormSlot,
  historySlot,
  evolutionSlot,
  summarySlot,
  layout = '4-columns',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Determinar classes de layout baseado na prop layout
  const getLayoutClasses = () => {
    switch (layout) {
      case '4-columns':
        return 'grid grid-cols-1 lg:grid-cols-[30%_25%_25%_20%] gap-0';
      case '3-columns':
        return 'grid grid-cols-1 lg:grid-cols-3 gap-0';
      case '2-columns':
        return 'grid grid-cols-1 md:grid-cols-2 gap-0';
      case 'mobile':
        return 'flex flex-col';
      default:
        return 'grid grid-cols-1 lg:grid-cols-[30%_25%_25%_20%] gap-0';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600">Carregando dados da sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Layout Grid - 4 Colunas */}
      <div className={`flex-1 overflow-hidden ${getLayoutClasses()}`}>
        {/* Coluna 1: Formulário SOAP (30%) */}
        {soapFormSlot && (
          <div className="overflow-y-auto border-r border-slate-200 bg-white">
            <div className="p-6">
              {soapFormSlot}
            </div>
          </div>
        )}

        {/* Coluna 2: Histórico & Condutas (25%) */}
        {historySlot && (
          <div className="overflow-y-auto border-r border-slate-200 bg-slate-50">
            <div className="p-6">
              {historySlot}
            </div>
          </div>
        )}

        {/* Coluna 3: Testes & Evolução (25%) */}
        {evolutionSlot && (
          <div className="overflow-y-auto border-r border-slate-200 bg-white">
            <div className="p-6">
              {evolutionSlot}
            </div>
          </div>
        )}

        {/* Coluna 4: Resumo Paciente (20%) */}
        {summarySlot && (
          <div className="overflow-y-auto bg-slate-50">
            <div className="p-6">
              {summarySlot}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionEvolutionContainer;

