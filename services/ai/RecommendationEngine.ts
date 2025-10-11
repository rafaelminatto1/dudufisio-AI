/**
 * Recommendation Engine - Sistema de Recomendações com IA
 * Activity Fisioterapia Integration - Fase 3
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lead, LeadStatus } from '@/types/crm';
import { supabase } from '@/lib/supabase';

export interface Protocol {
  name: string;
  description: string;
  sessions: number;
  frequency: string; // "2x por semana", "3x por semana"
  techniques: string[];
  home_exercises: string[];
  estimated_duration: string; // "4-6 semanas"
  precautions: string[];
  expected_outcomes: string[];
}

export interface LeadScore {
  lead_id: string;
  score: number; // 0-100
  level: 'cold' | 'warm' | 'hot' | 'urgent';
  factors: {
    urgency: number;
    engagement: number;
    timing: number;
    fit: number;
  };
  recommended_actions: string[];
}

export interface NextAction {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  suggested_message?: string;
  timing?: string;
}

export class RecommendationEngine {
  private gemini: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Recomendar protocolo de tratamento
   */
  async recommendProtocol(patientData: {
    age?: number;
    condition: string;
    pain_description?: string;
    pain_duration?: string;
    activity_level?: string;
    medical_history?: string;
    goals?: string;
  }): Promise<Protocol | null> {
    try {
      const prompt = `
Como especialista em fisioterapia, recomende um protocolo de tratamento:

DADOS DO PACIENTE:
- Condição: ${patientData.condition}
- Idade: ${patientData.age || 'Não informado'}
- Descrição da dor: ${patientData.pain_description || 'Não informado'}
- Duração: ${patientData.pain_duration || 'Não informado'}
- Nível de atividade: ${patientData.activity_level || 'Não informado'}
- Histórico médico: ${patientData.medical_history || 'Não informado'}
- Objetivos: ${patientData.goals || 'Recuperação completa'}

Forneça uma recomendação em JSON seguindo este formato:
{
  "name": "Nome do Protocolo",
  "description": "Descrição breve do tratamento",
  "sessions": 12,
  "frequency": "2x por semana",
  "techniques": ["Técnica 1", "Técnica 2", "Técnica 3"],
  "home_exercises": ["Exercício 1", "Exercício 2"],
  "estimated_duration": "4-6 semanas",
  "precautions": ["Cuidado 1", "Cuidado 2"],
  "expected_outcomes": ["Resultado esperado 1", "Resultado esperado 2"]
}

IMPORTANTE: Responda APENAS com o JSON, sem texto adicional.
`;

      const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const protocol = JSON.parse(jsonMatch[0]);
        return protocol as Protocol;
      }

      return null;
    } catch (error) {
      console.error('Erro ao recomendar protocolo:', error);
      return null;
    }
  }

  /**
   * Recomendar próxima ação para um lead
   */
  async recommendNextAction(leadId: string): Promise<NextAction | null> {
    try {
      const lead = await this.getLeadWithHistory(leadId);
      if (!lead) {
        return null;
      }

      // Analisar contexto
      const hoursSinceLastContact = lead.last_contact_at
        ? (Date.now() - new Date(lead.last_contact_at).getTime()) / (1000 * 60 * 60)
        : 999;

      const contactCount = lead.contact_count || 0;
      const status = lead.status;

      // Lógica de recomendação
      if (status === 'novo' && hoursSinceLastContact > 24) {
        return {
          action: 'Enviar follow-up',
          priority: 'high',
          reason: 'Lead novo sem resposta há mais de 24h',
          suggested_message: `Olá ${lead.name}! Vi que você entrou em contato conosco ontem. Como posso ajudar?`,
          timing: 'Agora',
        };
      }

      if (status === 'contatado' && hoursSinceLastContact > 72) {
        return {
          action: 'Fazer ligação',
          priority: 'high',
          reason: 'Lead contatado mas sem evolução há 3 dias',
          timing: 'Próximas 2 horas',
        };
      }

      if (status === 'qualificado' && hoursSinceLastContact > 48) {
        return {
          action: 'Oferecer agendamento',
          priority: 'urgent',
          reason: 'Lead qualificado pronto para agendar',
          suggested_message: `Olá ${lead.name}! Vamos agendar sua avaliação gratuita? Tenho horários disponíveis esta semana.`,
          timing: 'Agora',
        };
      }

      if (contactCount >= 3 && status === 'contatado') {
        return {
          action: 'Oferta especial',
          priority: 'medium',
          reason: 'Lead com múltiplos contatos mas sem conversão',
          suggested_message: `${lead.name}, tenho uma oferta especial para você: 10% de desconto na primeira sessão! Válido esta semana.`,
          timing: 'Hoje',
        };
      }

      // Default
      return {
        action: 'Aguardar resposta',
        priority: 'low',
        reason: 'Lead está em processo normal de conversão',
        timing: 'Próximas 24h',
      };
    } catch (error) {
      console.error('Erro ao recomendar ação:', error);
      return null;
    }
  }

  /**
   * Scoring de leads (predição de conversão)
   */
  async scoreLeads(clinicId: string, leadIds?: string[]): Promise<LeadScore[]> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('clinic_id', clinicId)
        .is('deleted_at', null)
        .not('status', 'in', '(convertido,perdido)');

      if (leadIds && leadIds.length > 0) {
        query = query.in('id', leadIds);
      }

      const { data: leads } = await query;

      if (!leads) {
        return [];
      }

      const scores = leads.map((lead) => this.calculateLeadScore(lead));
      return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Erro ao fazer scoring de leads:', error);
      return [];
    }
  }

  /**
   * Calcular score de um lead
   */
  private calculateLeadScore(lead: any): LeadScore {
    let score = 0;
    const factors = {
      urgency: 0,
      engagement: 0,
      timing: 0,
      fit: 0,
    };

    // Fator 1: Urgência (0-30 pontos)
    const urgencyMap = {
      urgente: 30,
      alta: 20,
      media: 10,
      baixa: 5,
    };
    factors.urgency = urgencyMap[lead.urgency_level as keyof typeof urgencyMap] || 10;
    score += factors.urgency;

    // Fator 2: Engajamento (0-30 pontos)
    const contactCount = lead.contact_count || 0;
    const hoursSinceLastContact = lead.last_contact_at
      ? (Date.now() - new Date(lead.last_contact_at).getTime()) / (1000 * 60 * 60)
      : 999;

    if (contactCount > 0 && hoursSinceLastContact < 24) {
      factors.engagement = 30;
    } else if (contactCount > 0 && hoursSinceLastContact < 72) {
      factors.engagement = 20;
    } else if (contactCount > 0) {
      factors.engagement = 10;
    }
    score += factors.engagement;

    // Fator 3: Timing (0-25 pontos)
    const hoursSinceCreation = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation < 24) {
      factors.timing = 25; // Lead muito recente
    } else if (hoursSinceCreation < 72) {
      factors.timing = 15;
    } else if (hoursSinceCreation < 168) {
      factors.timing = 10;
    } else {
      factors.timing = 5; // Lead antigo
    }
    score += factors.timing;

    // Fator 4: Fit (0-15 pontos)
    if (lead.pain_description && lead.pain_description.length > 50) {
      factors.fit += 5; // Descreveu bem o problema
    }
    if (lead.service_interest) {
      factors.fit += 5; // Sabe o que quer
    }
    if (lead.email) {
      factors.fit += 5; // Mais completo
    }
    score += factors.fit;

    // Determinar nível
    let level: LeadScore['level'];
    if (score >= 75) {
      level = 'urgent';
    } else if (score >= 50) {
      level = 'hot';
    } else if (score >= 30) {
      level = 'warm';
    } else {
      level = 'cold';
    }

    // Recomendar ações
    const recommended_actions: string[] = [];
    if (level === 'urgent' || level === 'hot') {
      recommended_actions.push('Contatar imediatamente');
      recommended_actions.push('Oferecer agendamento urgente');
    } else if (level === 'warm') {
      recommended_actions.push('Enviar follow-up personalizado');
      recommended_actions.push('Compartilhar cases de sucesso');
    } else {
      recommended_actions.push('Adicionar à campanha de nutrição');
      recommended_actions.push('Enviar conteúdo educativo');
    }

    return {
      lead_id: lead.id,
      score,
      level,
      factors,
      recommended_actions,
    };
  }

  /**
   * Buscar lead com histórico
   */
  private async getLeadWithHistory(leadId: string): Promise<any | null> {
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (!lead) {
        return null;
      }

      // Buscar histórico de interações
      const { data: interactions } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        ...lead,
        interactions: interactions || [],
      };
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      return null;
    }
  }

  /**
   * Recomendar conteúdo educativo para lead
   */
  async recommendContent(lead: Partial<Lead>): Promise<string[]> {
    const content: string[] = [];

    if (lead.service_interest === 'fisioterapia_esportiva') {
      content.push('Vídeo: 5 exercícios para prevenir lesões esportivas');
      content.push('Artigo: Como a fisioterapia melhora sua performance');
      content.push('Depoimento: Atleta recuperado de lesão no joelho');
    } else if (lead.service_interest === 'atm') {
      content.push('Vídeo: Entenda a ATM e seus sintomas');
      content.push('Artigo: Exercícios simples para aliviar dor na mandíbula');
      content.push('Depoimento: Paciente curado de ATM crônica');
    } else if (lead.service_interest === 'avaliacao_corrida') {
      content.push('Vídeo: A importância da análise de pisada');
      content.push('Artigo: Como melhorar sua técnica de corrida');
      content.push('Depoimento: Corredor que eliminou dores com avaliação');
    } else {
      content.push('Vídeo: Conheça nossa clínica');
      content.push('Artigo: Quando procurar um fisioterapeuta');
      content.push('Depoimento: Transformações dos nossos pacientes');
    }

    return content;
  }

  /**
   * Prever probabilidade de conversão
   */
  async predictConversion(leadId: string): Promise<number> {
    try {
      const score = await this.scoreLeads('', [leadId]);
      if (score.length === 0) {
        return 0;
      }

      // Converter score (0-100) para probabilidade (0-1)
      // Com ajuste para realidade (score 100 = 80% de conversão)
      return (score[0].score / 100) * 0.8;
    } catch (error) {
      console.error('Erro ao prever conversão:', error);
      return 0;
    }
  }

  /**
   * Identificar leads em risco de perda
   */
  async identifyAtRiskLeads(clinicId: string): Promise<LeadScore[]> {
    try {
      const allScores = await this.scoreLeads(clinicId);
      
      // Filtrar leads em risco
      return allScores.filter((score) => {
        // Lead está frio OU
        // Lead está morno mas sem engajamento recente
        return score.level === 'cold' || 
               (score.level === 'warm' && score.factors.timing < 10);
      });
    } catch (error) {
      console.error('Erro ao identificar leads em risco:', error);
      return [];
    }
  }
}

// Singleton
let recommendationEngineInstance: RecommendationEngine | null = null;

export const getRecommendationEngine = (): RecommendationEngine => {
  if (!recommendationEngineInstance) {
    recommendationEngineInstance = new RecommendationEngine();
  }
  return recommendationEngineInstance;
};


