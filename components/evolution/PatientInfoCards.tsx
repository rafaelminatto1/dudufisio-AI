import React, { useState, useEffect, useCallback } from 'react';
import { Patient, SoapNote, TreatmentPlan, ExercisePrescription } from '../../types';
import {
  PersonalDataCard,
  SessionHistoryCard,
  MetricsCard,
  TreatmentPlanCard,
  ExercisesCard,
  PainMapCard,
} from './cards';

interface PatientInfoCardsProps {
  patient: Patient;
  treatmentPlan: TreatmentPlan | null;
  exercises: ExercisePrescription[];
  sessionHistory: SoapNote[];
  metrics: {
    totalSessions: number;
    treatmentDays: number;
    firstSessionDate: string;
    lastSessionDate: string;
  };
  onRepeatSession?: (note: SoapNote) => void;
}

const STORAGE_KEY = 'evolution-cards-expanded-v1';

/**
 * Container principal que organiza os cards de informação do paciente
 * Grid responsivo com persistência de estado de expansão
 */
const PatientInfoCards: React.FC<PatientInfoCardsProps> = ({
  patient,
  treatmentPlan,
  exercises,
  sessionHistory,
  metrics,
  onRepeatSession,
}) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'personal-data': false,  // Colapsado por padrão - info já está no header
    'session-history': true,  // Expandido - útil para repetir conduta
    'metrics': false,
    'pain-map': false,
    'exercises': false,
    'treatment-plan': false,
  });

  // Carrega preferências do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpandedCards(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências dos cards:', error);
    }
  }, []);

  // Salva preferências no localStorage quando mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedCards));
    } catch (error) {
      console.error('Erro ao salvar preferências dos cards:', error);
    }
  }, [expandedCards]);

  const handleCardToggle = useCallback((cardId: string, expanded: boolean) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: expanded,
    }));
  }, []);

  // Funções para atalhos de teclado (serão usadas no hook global)
  const expandAll = useCallback(() => {
    setExpandedCards({
      'personal-data': true,
      'session-history': true,
      'metrics': true,
      'pain-map': true,
      'exercises': true,
      'treatment-plan': true,
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedCards({
      'personal-data': false,
      'session-history': false,
      'metrics': false,
      'pain-map': false,
      'exercises': false,
      'treatment-plan': false,
    });
  }, []);

  // Expõe funções para o parent via data attributes (para atalhos de teclado)
  useEffect(() => {
    (window as any).__evolutionCards = {
      expandAll,
      collapseAll,
      toggleCard: (cardId: string) => {
        setExpandedCards((prev) => ({
          ...prev,
          [cardId]: !prev[cardId],
        }));
      },
    };

    return () => {
      delete (window as any).__evolutionCards;
    };
  }, [expandAll, collapseAll]);

  return (
    <div className="space-y-4">
      {/* Primeira Linha: Cards Essenciais (sempre visíveis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Histórico de Sessões - MAIS IMPORTANTE */}
        <SessionHistoryCard
          sessionHistory={sessionHistory}
          patientId={patient.id}
          defaultExpanded={expandedCards['session-history']}
          onToggle={(expanded) => handleCardToggle('session-history', expanded)}
          onRepeatSession={onRepeatSession}
        />

        {/* Card 2: Plano de Tratamento - Se houver */}
        {treatmentPlan && (
          <TreatmentPlanCard
            treatmentPlan={treatmentPlan}
            defaultExpanded={expandedCards['treatment-plan']}
            onToggle={(expanded) => handleCardToggle('treatment-plan', expanded)}
          />
        )}

        {/* Card 3: Métricas */}
        <MetricsCard
          metrics={metrics}
          defaultExpanded={expandedCards['metrics']}
          onToggle={(expanded) => handleCardToggle('metrics', expanded)}
        />
      </div>

      {/* Segunda Linha: Cards Opcionais (colapsados por padrão) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 4: Dados Pessoais (info já está no header) */}
        <PersonalDataCard
          patient={patient}
          defaultExpanded={expandedCards['personal-data']}
          onToggle={(expanded) => handleCardToggle('personal-data', expanded)}
        />

        {/* Card 5: Exercícios - Se houver */}
        {exercises.length > 0 && (
          <ExercisesCard
            exercises={exercises}
            defaultExpanded={expandedCards['exercises']}
            onToggle={(expanded) => handleCardToggle('exercises', expanded)}
          />
        )}

        {/* Card 6: Mapa de Dor */}
        <PainMapCard
          patientId={patient.id}
          defaultExpanded={expandedCards['pain-map']}
          onToggle={(expanded) => handleCardToggle('pain-map', expanded)}
        />
      </div>
    </div>
  );
};

export default PatientInfoCards;

