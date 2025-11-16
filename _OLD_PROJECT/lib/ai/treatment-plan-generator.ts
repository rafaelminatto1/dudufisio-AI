/**
 * AI-Powered Treatment Plan Generator
 * Generates personalized treatment plans based on patient data and best practices
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface PatientProfile {
  demographics: {
    age: number;
    gender: string;
    occupation: string;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  };
  medicalHistory: {
    conditions: string[];
    surgeries: string[];
    medications: string[];
    allergies: string[];
    contraindications: string[];
  };
  currentCondition: {
    diagnosis: string;
    symptoms: string[];
    painLevel: number; // 0-10
    functionalLimitations: string[];
    onsetDate: Date;
    mechanism: string;
  };
  assessmentFindings: {
    rangeOfMotion: Record<string, string>;
    strength: Record<string, string>;
    specialTests: Record<string, string>;
    postureAnalysis: string;
  };
  goals: {
    shortTerm: string[];
    longTerm: string[];
    timeline: string;
  };
}

interface TreatmentPlan {
  summary: string;
  duration: {
    weeks: number;
    sessionsPerWeek: number;
    sessionDuration: number;
  };
  phases: TreatmentPhase[];
  exercises: ExercisePrescription[];
  progressionCriteria: string[];
  precautions: string[];
  homeProgram: string[];
  expectedOutcomes: string[];
  alternativeTreatments: string[];
}

interface TreatmentPhase {
  name: string;
  description: string;
  duration: string;
  goals: string[];
  interventions: string[];
  progressMarkers: string[];
}

interface ExercisePrescription {
  name: string;
  category: string;
  description: string;
  sets: number;
  repetitions: string;
  duration?: string;
  frequency: string;
  intensity: string;
  progression: string;
  precautions: string[];
  visualAid?: string;
}

/**
 * Generate treatment plan using AI
 */
export async function generateTreatmentPlan(
  patient: PatientProfile
): Promise<TreatmentPlan> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = buildTreatmentPlanPrompt(patient);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const plan: TreatmentPlan = JSON.parse(jsonMatch[0]);
    
    // Validate and enrich the plan
    return enrichTreatmentPlan(plan, patient);
  } catch (error) {
    console.error('Error generating treatment plan:', error);
    throw error;
  }
}

/**
 * Build comprehensive prompt for treatment plan generation
 */
function buildTreatmentPlanPrompt(patient: PatientProfile): string {
  return `
Você é um fisioterapeuta especialista com 20 anos de experiência. Crie um plano de tratamento detalhado e baseado em evidências científicas.

DADOS DO PACIENTE:
- Idade: ${patient.demographics.age} anos
- Sexo: ${patient.demographics.gender}
- Ocupação: ${patient.demographics.occupation}
- Nível de Atividade: ${patient.demographics.activityLevel}

CONDIÇÃO ATUAL:
- Diagnóstico: ${patient.currentCondition.diagnosis}
- Sintomas: ${patient.currentCondition.symptoms.join(', ')}
- Dor (0-10): ${patient.currentCondition.painLevel}
- Limitações Funcionais: ${patient.currentCondition.functionalLimitations.join(', ')}
- Início: ${patient.currentCondition.onsetDate.toLocaleDateString()}
- Mecanismo de Lesão: ${patient.currentCondition.mechanism}

HISTÓRICO MÉDICO:
- Condições: ${patient.medicalHistory.conditions.join(', ') || 'Nenhuma'}
- Cirurgias: ${patient.medicalHistory.surgeries.join(', ') || 'Nenhuma'}
- Medicamentos: ${patient.medicalHistory.medications.join(', ') || 'Nenhum'}
- Alergias: ${patient.medicalHistory.allergies.join(', ') || 'Nenhuma'}
- Contraindicações: ${patient.medicalHistory.contraindications.join(', ') || 'Nenhuma'}

OBJETIVOS:
- Curto Prazo: ${patient.goals.shortTerm.join(', ')}
- Longo Prazo: ${patient.goals.longTerm.join(', ')}
- Timeline: ${patient.goals.timeline}

CRIE UM PLANO DE TRATAMENTO COMPLETO NO SEGUINTE FORMATO JSON:

{
  "summary": "Resumo executivo do plano",
  "duration": {
    "weeks": number,
    "sessionsPerWeek": number,
    "sessionDuration": number
  },
  "phases": [
    {
      "name": "Nome da Fase",
      "description": "Descrição detalhada",
      "duration": "duração",
      "goals": ["objetivo1", "objetivo2"],
      "interventions": ["intervenção1", "intervenção2"],
      "progressMarkers": ["marcador1", "marcador2"]
    }
  ],
  "exercises": [
    {
      "name": "Nome do Exercício",
      "category": "categoria",
      "description": "como executar",
      "sets": number,
      "repetitions": "número ou tempo",
      "frequency": "frequência",
      "intensity": "baixa/moderada/alta",
      "progression": "como progredir",
      "precautions": ["precaução1"]
    }
  ],
  "progressionCriteria": ["critério1", "critério2"],
  "precautions": ["precaução1", "precaução2"],
  "homeProgram": ["instrução1", "instrução2"],
  "expectedOutcomes": ["resultado1", "resultado2"],
  "alternativeTreatments": ["alternativa1", "alternativa2"]
}

IMPORTANTE:
- Base o plano em evidências científicas atuais
- Considere as contraindicações e precauções
- Proponha progressão gradual e segura
- Inclua exercícios funcionais relevantes para a ocupação do paciente
- Estabeleça critérios objetivos de progressão
- Forneça programa domiciliar claro e executável
`;
}

/**
 * Enrich and validate treatment plan
 */
function enrichTreatmentPlan(
  plan: TreatmentPlan,
  patient: PatientProfile
): TreatmentPlan {
  // Add safety precautions based on patient profile
  const additionalPrecautions: string[] = [];

  if (patient.demographics.age > 65) {
    additionalPrecautions.push('Atenção redobrada para prevenção de quedas');
    additionalPrecautions.push('Monitorar sinais vitais durante exercícios');
  }

  if (patient.medicalHistory.conditions.some(c => c.toLowerCase().includes('cardíaco'))) {
    additionalPrecautions.push('Evitar Valsalva durante exercícios');
    additionalPrecautions.push('Monitorar frequência cardíaca');
  }

  if (patient.medicalHistory.conditions.some(c => c.toLowerCase().includes('diabetes'))) {
    additionalPrecautions.push('Verificar glicemia antes de sessões intensas');
  }

  plan.precautions = [...new Set([...plan.precautions, ...additionalPrecautions])];

  // Validate exercise progression
  plan.exercises = plan.exercises.map(ex => {
    if (!ex.precautions || ex.precautions.length === 0) {
      ex.precautions = ['Interromper se houver aumento da dor'];
    }
    return ex;
  });

  return plan;
}

/**
 * Generate alternative treatment suggestions
 */
export async function generateAlternativeApproaches(
  patient: PatientProfile,
  currentPlan: TreatmentPlan
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return [
      'Consultar com especialista em dor crônica',
      'Considerar abordagens multimodais',
      'Avaliar necessidade de intervenção médica adicional',
    ];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Com base no diagnóstico "${patient.currentCondition.diagnosis}" e plano atual,
sugira 3-5 abordagens alternativas ou complementares baseadas em evidências:

1. Modalidades físicas (TENS, ultrassom, etc.)
2. Terapias manuais específicas
3. Abordagens complementares (acupuntura, pilates, etc.)
4. Referências para outros profissionais
5. Ajustes no estilo de vida

Retorne apenas um array JSON de strings: ["sugestão1", "sugestão2", ...]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    return currentPlan.alternativeTreatments;
  } catch (error) {
    console.error('Error generating alternatives:', error);
    return currentPlan.alternativeTreatments;
  }
}

/**
 * Adjust plan based on progress
 */
export async function adjustPlanBasedOnProgress(
  patient: PatientProfile,
  currentPlan: TreatmentPlan,
  progressData: {
    painReduction: number;
    functionalImprovement: number;
    adherence: number;
    feedback: string;
  }
): Promise<TreatmentPlan> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    // Return current plan if AI not available
    return currentPlan;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Ajuste o plano de tratamento com base no progresso:

PROGRESSO:
- Redução da dor: ${progressData.painReduction}%
- Melhora funcional: ${progressData.functionalImprovement}%
- Aderência: ${progressData.adherence}%
- Feedback do paciente: ${progressData.feedback}

PLANO ATUAL: ${JSON.stringify(currentPlan, null, 2)}

Sugira ajustes específicos:
1. Se progredir mais rápido que esperado: intensificar
2. Se progredir mais devagar: simplificar ou modificar
3. Se baixa aderência: tornar mais prático

Retorne o plano ajustado em JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const adjustedPlan = JSON.parse(jsonMatch[0]);
      return enrichTreatmentPlan(adjustedPlan, patient);
    }

    return currentPlan;
  } catch (error) {
    console.error('Error adjusting plan:', error);
    return currentPlan;
  }
}

/**
 * Generate patient-friendly explanation
 */
export async function generatePatientExplanation(
  plan: TreatmentPlan,
  patient: PatientProfile
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return `Seu plano de tratamento inclui ${plan.phases.length} fases ao longo de ${plan.duration.weeks} semanas. Você terá ${plan.duration.sessionsPerWeek} sessões por semana.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Explique este plano de tratamento de forma clara e empática para o paciente:

${JSON.stringify(plan, null, 2)}

Use linguagem simples, seja encorajador e explique:
- O que esperar em cada fase
- Por que cada exercício é importante
- Como medir o progresso
- Prazo realista para resultados

Máximo 300 palavras.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating explanation:', error);
    return `Seu plano de tratamento foi desenvolvido especificamente para você e inclui ${plan.phases.length} fases. Com dedicação e acompanhamento, esperamos ver melhorias significativas.`;
  }
}

/**
 * Export plan to PDF-friendly format
 */
export function exportPlanToDocument(plan: TreatmentPlan, patient: PatientProfile) {
  return {
    title: `Plano de Tratamento - ${patient.currentCondition.diagnosis}`,
    patient: {
      age: patient.demographics.age,
      occupation: patient.demographics.occupation,
    },
    plan,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Este plano deve ser supervisionado por um profissional de saúde qualificado.',
  };
}
