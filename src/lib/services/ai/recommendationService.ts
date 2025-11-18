import { createServerComponentClient } from '~/lib/supabase/server';
import { AIOrchestratorService } from './aiOrchestratorService';

export interface Recommendation {
  id: string;
  type: 'exercise' | 'treatment' | 'protocol' | 'goal';
  title: string;
  description: string;
  confidence: number; // 0-100
  reasoning: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

export interface RecommendationContext {
  patientId: string;
  diagnosis?: string;
  currentTreatment?: string;
  sessionHistory?: any[];
  goals?: string[];
  painLevel?: number;
  functionalLevel?: number;
}

/**
 * Service para gerar recomendações usando IA
 * Adaptado para Next.js App Router
 */
export class RecommendationService {
  /**
   * Gera recomendações personalizadas para um paciente
   */
  static async generateRecommendations(context: RecommendationContext) {
    try {
      const supabase = await createServerComponentClient();

      // Buscar dados do paciente
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', context.patientId)
        .single();

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Buscar histórico de sessões
      const { data: sessions } = await supabase
        .from('appointments')
        .select('*, session_evolutions(*)')
        .eq('patient_id', context.patientId)
        .eq('status', 'concluido')
        .order('start_time', { ascending: false })
        .limit(10);

      // Buscar tratamentos ativos
      const { data: treatments } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', context.patientId)
        .eq('status', 'ativo');

      // Construir contexto para IA
      const aiContext = this.buildAIContext(patient, sessions || [], treatments || [], context);

      // Gerar recomendações usando IA
      const aiResponse = await AIOrchestratorService.generateResponse({
        prompt: this.buildRecommendationPrompt(aiContext),
        useCase: 'patient_insight',
      });

      if (aiResponse.error || !aiResponse.data?.content) {
        throw new Error(aiResponse.error || 'Failed to generate recommendations');
      }

      // Parsear recomendações da resposta da IA
      const recommendations = this.parseRecommendations(aiResponse.data.content, context);

      // Salvar recomendações no banco
      await this.saveRecommendations(context.patientId, recommendations);

      return { data: recommendations, error: null };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return { data: null, error };
    }
  }

  /**
   * Constrói contexto para IA
   */
  private static buildAIContext(
    patient: any,
    sessions: any[],
    treatments: any[],
    context: RecommendationContext
  ): string {
    return `
Paciente: ${patient.full_name}
Diagnóstico: ${context.diagnosis || 'Não especificado'}
Tratamento Atual: ${context.currentTreatment || 'Não especificado'}
Nível de Dor: ${context.painLevel || 'Não informado'}/10
Nível Funcional: ${context.functionalLevel || 'Não informado'}/10
Sessões Completadas: ${sessions.length}
Tratamentos Ativos: ${treatments.length}
Metas: ${context.goals?.join(', ') || 'Não especificadas'}
`;
  }

  /**
   * Constrói prompt para recomendações
   */
  private static buildRecommendationPrompt(context: string): string {
    return `Com base nas seguintes informações do paciente, gere recomendações personalizadas de exercícios, tratamentos e protocolos:

${context}

Forneça recomendações específicas, práticas e baseadas em evidências. Inclua:
1. Exercícios recomendados com justificativa
2. Ajustes no protocolo de tratamento se necessário
3. Metas de curto e longo prazo
4. Precauções e considerações importantes

Formate a resposta como uma lista de recomendações claras e acionáveis.`;
  }

  /**
   * Parseia recomendações da resposta da IA
   */
  private static parseRecommendations(
    aiContent: string,
    context: RecommendationContext
  ): Recommendation[] {
    // Simplificado - em produção, usaria parsing mais sofisticado
    const recommendations: Recommendation[] = [];
    const lines = aiContent.split('\n').filter(line => line.trim());

    let currentRecommendation: Partial<Recommendation> | null = null;

    lines.forEach((line, index) => {
      if (line.match(/^\d+\.|^[-*]/)) {
        // Nova recomendação
        if (currentRecommendation) {
          recommendations.push(currentRecommendation as Recommendation);
        }

        const title = line.replace(/^\d+\.|^[-*]\s*/, '').trim();
        currentRecommendation = {
          id: `rec-${Date.now()}-${index}`,
          type: this.inferRecommendationType(title),
          title,
          description: '',
          confidence: 75, // Padrão
          reasoning: '',
          actionable: true,
          priority: 'medium',
        };
      } else if (currentRecommendation && line.trim()) {
        // Continuar descrição
        currentRecommendation.description += (currentRecommendation.description ? ' ' : '') + line.trim();
      }
    });

    if (currentRecommendation) {
      recommendations.push(currentRecommendation as Recommendation);
    }

    return recommendations;
  }

  /**
   * Infere tipo de recomendação do título
   */
  private static inferRecommendationType(title: string): Recommendation['type'] {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('exercício') || lowerTitle.includes('exercicio')) return 'exercise';
    if (lowerTitle.includes('tratamento')) return 'treatment';
    if (lowerTitle.includes('protocolo')) return 'protocol';
    if (lowerTitle.includes('meta') || lowerTitle.includes('objetivo')) return 'goal';
    return 'treatment';
  }

  /**
   * Salva recomendações no banco
   */
  private static async saveRecommendations(patientId: string, recommendations: Recommendation[]) {
    try {
      const supabase = await createServerComponentClient();
      const recommendationsToInsert = recommendations.map(rec => ({
        patient_id: patientId,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence,
        reasoning: rec.reasoning,
        actionable: rec.actionable,
        priority: rec.priority,
        data: rec.data,
      }));

      await supabase.from('ai_recommendations').insert(recommendationsToInsert);
    } catch (error) {
      console.error('Error saving recommendations:', error);
      // Não falhar se salvar falhar
    }
  }

  /**
   * Obtém recomendações salvas para um paciente
   */
  static async getPatientRecommendations(patientId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { data: null, error };
    }
  }

  /**
   * Marca recomendação como aplicada
   */
  static async markRecommendationApplied(recommendationId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('ai_recommendations')
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString() 
        } as any)
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking recommendation as applied:', error);
      return { data: null, error };
    }
  }
}

