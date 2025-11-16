import { useMemo } from 'react';
import { Patient, SoapNote, TreatmentPlan, ExercisePrescription } from '../types';

interface UsePatientEvolutionDataReturn {
  personalData: {
    email: string;
    phone: string;
    age?: number;
    birthDate: string;
    cpf: string;
    address?: {
      city: string;
      state: string;
    };
    medicalAlerts?: string;
    conditions?: any[];
  };
  sessionHistory: SoapNote[];
  metrics: {
    totalSessions: number;
    treatmentDays: number;
    firstSessionDate: string;
    lastSessionDate: string;
    averagePainReduction?: number;
  };
  treatmentPlan: TreatmentPlan | null;
  exercises: ExercisePrescription[];
  isDataComplete: boolean;
}

/**
 * Hook que consolida dados do paciente para os cards de evolução
 * Não faz fetch adicional, apenas organiza dados já carregados
 */
export const usePatientEvolutionData = (
  patient: Patient | null,
  allPatientNotes: SoapNote[],
  treatmentPlan: TreatmentPlan | null,
  planExercises: ExercisePrescription[]
): UsePatientEvolutionDataReturn => {
  // Dados pessoais
  const personalData = useMemo(() => {
    if (!patient) {
      return {
        email: '',
        phone: '',
        birthDate: '',
        cpf: '',
      };
    }

    return {
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      birthDate: patient.birthDate,
      cpf: patient.cpf,
      address: patient.address,
      medicalAlerts: patient.medicalAlerts,
      conditions: patient.conditions,
    };
  }, [patient]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalSessions = allPatientNotes.length;
    const firstSession = allPatientNotes[allPatientNotes.length - 1];
    const lastSession = allPatientNotes[0];

    let treatmentDays = 0;
    if (firstSession && lastSession) {
      const first = new Date(firstSession.date);
      const last = new Date(lastSession.date);
      treatmentDays = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Calcula redução média de dor (se disponível)
    let averagePainReduction: number | undefined;
    const notesWithPain = allPatientNotes.filter(note => note.painScale !== undefined);
    if (notesWithPain.length >= 2) {
      const firstPain = notesWithPain[notesWithPain.length - 1].painScale!;
      const lastPain = notesWithPain[0].painScale!;
      averagePainReduction = ((firstPain - lastPain) / firstPain) * 100;
    }

    return {
      totalSessions,
      treatmentDays,
      firstSessionDate: firstSession?.date || 'N/A',
      lastSessionDate: lastSession?.date || 'N/A',
      averagePainReduction,
    };
  }, [allPatientNotes]);

  // Verifica se tem dados completos
  const isDataComplete = useMemo(() => {
    return !!(patient && allPatientNotes.length > 0);
  }, [patient, allPatientNotes]);

  return {
    personalData,
    sessionHistory: allPatientNotes,
    metrics,
    treatmentPlan,
    exercises: planExercises,
    isDataComplete,
  };
};

export default usePatientEvolutionData;

