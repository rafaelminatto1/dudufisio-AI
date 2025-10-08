/**
 * ML Predictions API
 * API endpoints para predições de Machine Learning
 * 
 * Integração com Claude AI (Anthropic) para análise contextual
 */

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../../lib/supabase';

/**
 * Analisar paciente com Claude AI
 */
export async function analyzePatientWithClaude(patientData: any) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  const prompt = `
Analise os seguintes dados do paciente e preveja o outcome do tratamento fisioterápico:

**Dados do Paciente:**
- Idade: ${patientData.age} anos
- Condição: ${patientData.condition}
- Severidade Inicial: ${patientData.severity}/10
- Histórico Médico: ${patientData.medical_history || 'Não informado'}
- Tratamento Proposto: ${patientData.treatment_plan}
- Sessões Previstas: ${patientData.planned_sessions}
- Frequência: ${patientData.frequency}
- Aderência Histórica: ${patientData.adherence_history || 'Novo paciente'}

**Análise Solicitada:**
Forneça uma análise detalhada em formato JSON com:
1. Probabilidade de sucesso (0-100%)
2. Fatores de risco principais (lista)
3. Fatores protetores principais (lista)
4. Recomendações específicas para melhorar outcome (lista)
5. Duração estimada de tratamento (semanas)
6. Cenários alternativos (melhor caso, caso mais provável, pior caso)
7. Confiança na predição (baixa/média/alta)
8. Justificativa clínica

Responda APENAS com JSON válido, sem markdown.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const analysis = JSON.parse(content.text);
      return analysis;
    }

    throw new Error('Resposta inválida da API');
  } catch (error) {
    console.error('Erro ao analisar com Claude:', error);
    throw error;
  }
}

/**
 * Gerar predição de outcome usando Claude
 */
export async function predictOutcomeWithAI(patientId: string, patientData: any) {
  try {
    const analysis = await analyzePatientWithClaude(patientData);

    // Salvar predição no banco
    const { data, error } = await supabase.from('ai_predictions').insert({
      patient_id: patientId,
      prediction_type: 'treatment_outcome',
      outcome_prediction: analysis.probabilidade_sucesso > 70 ? 'positive' : 'moderate',
      confidence_score: analysis.confianca === 'alta' ? 0.9 : analysis.confianca === 'media' ? 0.75 : 0.6,
      confidence_level: analysis.confianca,
      input_features: patientData,
      features_used: Object.keys(patientData),
      factors_analyzed: [...analysis.fatores_risco, ...analysis.fatores_protetores],
      risk_factors: analysis.fatores_risco,
      protective_factors: analysis.fatores_protetores,
      recommendations: analysis.recomendacoes,
      alternative_scenarios: analysis.cenarios_alternativos,
      explanation: analysis.justificativa_clinica,
      model_name: 'claude-3-5-sonnet',
      model_version: '20241022',
      created_by: 'claude_ai',
    }).select().single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro na predição com IA:', error);
    throw error;
  }
}

/**
 * Analisar tendência de sintomas com IA
 */
export async function analyzeSymptomTrends(patientId: string, symptomData: any[]) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  const prompt = `
Analise os seguintes dados de sintomas do paciente ao longo do tempo:

${JSON.stringify(symptomData, null, 2)}

Identifique:
1. Padrões temporais (horário do dia, dia da semana, etc)
2. Correlações com atividades
3. Tendências (melhora/piora)
4. Fatores desencadeantes
5. Fatores de alívio
6. Alertas importantes
7. Recomendações de intervenção

Responda em JSON com estrutura clara.
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text);
  }

  throw new Error('Resposta inválida');
}

