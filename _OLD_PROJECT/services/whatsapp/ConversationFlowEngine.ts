/**
 * Conversation Flow Engine - Motor de fluxos conversacionais
 * Activity Fisioterapia Integration - Fase 2
 */

import { Lead } from '@/types/crm';
import { LeadService } from '@/services/api/crm/leadService';

export interface ConversationContext {
  leadId: string;
  currentStep: string;
  lastInteraction: Date;
  userData: Record<string, any>;
}

export class ConversationFlowEngine {
  private clinicId: string;
  private redis: any; // TODO: Implementar Redis client

  constructor(clinicId: string) {
    this.clinicId = clinicId;
  }

  /**
   * Processar mensagem e gerar resposta
   */
  async processMessage(lead: Lead, message: string): Promise<string | null> {
    const messageLower = message.toLowerCase().trim();

    // 1. Detectar gatilhos rápidos (keywords)
    const quickResponse = this.handleQuickTriggers(messageLower);
    if (quickResponse) {
      return quickResponse;
    }

    // 2. Determinar contexto da conversa
    const context = await this.getContext(lead.id);

    // 3. Processar baseado no status do lead
    if (lead.status === 'novo') {
      return this.handleFirstTimeFlow(lead, message, context);
    } else {
      return this.handleExistingLeadFlow(lead, message, context);
    }
  }

  /**
   * Responder por gatilhos/keywords
   */
  private handleQuickTriggers(message: string): string | null {
    const triggers: Record<string, string> = {
      preço: `💰 *Nossos valores:*

🏃 Fisioterapia esportiva: R$ 115/sessão
🦷 ATM: R$ 120/sessão
👟 Avaliação de corrida: R$ 280

📦 *Pacotes com desconto disponíveis!*
✅ *Avaliação gratuita!*

Quer saber mais sobre algum serviço?`,

      endereço: `📍 *Localização:*

Rua Manuel Vieira de Sousa, 166
Mooca - São Paulo/SP

🚇 Próximo ao metrô Bresser-Mooca
🅿️ Estacionamento gratuito

🗺️ [Ver no Google Maps](https://maps.google.com)`,

      horário: `🕐 *Horários de atendimento:*

📅 Segunda a Sexta: 7h às 19h
📅 Sábado: 8h às 12h

📞 Quer agendar sua consulta?`,

      convênio: `🏥 *Convênios aceitos:*

✅ Unimed
✅ Bradesco Saúde
✅ SulAmérica
✅ Amil
✅ Porto Seguro
✅ E outros...

💳 Também atendemos particular com parcelamento sem juros!

Qual seu convênio?`,
    };

    // Buscar por palavras-chave
    for (const [keyword, response] of Object.entries(triggers)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    // Variações comuns
    if (message.includes('valor') || message.includes('quanto custa')) {
      return triggers['preço'] ?? null;
    }

    if (message.includes('onde') || message.includes('local') || message.includes('endereço')) {
      return triggers['endereço'] ?? null;
    }

    if (message.includes('horário') || message.includes('funciona')) {
      return triggers['horário'] ?? null;
    }

    if (message.includes('convênio') || message.includes('plano')) {
      return triggers['convênio'] ?? null;
    }

    return null;
  }

  /**
   * Fluxo para primeira vez
   */
  private async handleFirstTimeFlow(
    lead: Lead,
    message: string,
    context: ConversationContext | null
  ): Promise<string> {
    const messageLower = message.toLowerCase();

    // Se ainda não sabemos o nome, perguntar
    if (!lead.name || lead.name === lead.phone) {
      return `Olá! 👋 Bem-vindo(a) à Activity Fisioterapia!

Para começar, qual é o seu nome?`;
    }

    // Se não sabemos o problema, perguntar
    if (!lead.pain_description) {
      return `Prazer, ${lead.name}! 😊

Para te ajudar melhor, me conta: o que te trouxe até nós?

1️⃣ Dor ou lesão esportiva
2️⃣ Dor na mandíbula (ATM)
3️⃣ Avaliação de corrida
4️⃣ Outro problema

Digite o número da opção.`;
    }

    // Identificar interesse por número
    if (['1', '2', '3', '4'].includes(message.trim())) {
      const interests = {
        '1': 'fisioterapia_esportiva',
        '2': 'atm',
        '3': 'avaliacao_corrida',
        '4': 'outros',
      };

      const interest = interests[message.trim() as keyof typeof interests];
      await LeadService.updateLead(lead.id, {
        service_interest: interest,
        status: 'contatado',
      });

      return this.getServiceIntroduction(interest);
    }

    // Detectar interesse por palavras-chave
    if (messageLower.includes('dor') || messageLower.includes('lesão')) {
      await LeadService.updateLead(lead.id, {
        service_interest: 'fisioterapia_esportiva',
        pain_description: message,
        status: 'contatado',
      });

      return this.getServiceIntroduction('fisioterapia_esportiva');
    }

    if (messageLower.includes('atm') || messageLower.includes('mandíbula')) {
      await LeadService.updateLead(lead.id, {
        service_interest: 'atm',
        pain_description: message,
        status: 'contatado',
      });

      return this.getServiceIntroduction('atm');
    }

    if (messageLower.includes('corr')) {
      await LeadService.updateLead(lead.id, {
        service_interest: 'avaliacao_corrida',
        status: 'contatado',
      });

      return this.getServiceIntroduction('avaliacao_corrida');
    }

    // Resposta padrão
    return `Obrigado por compartilhar, ${lead.name}!

Vou te conectar com um de nossos especialistas que pode te ajudar melhor. 

Enquanto isso, quer saber mais sobre nossos serviços ou horários disponíveis?`;
  }

  /**
   * Fluxo para lead/paciente existente
   */
  private async handleExistingLeadFlow(
    lead: Lead,
    message: string,
    context: ConversationContext | null
  ): Promise<string> {
    const messageLower = message.toLowerCase();

    // Intenção de agendar
    if (
      messageLower.includes('agendar') ||
      messageLower.includes('marcar') ||
      messageLower.includes('horário')
    ) {
      return `Ótimo, ${lead.name}! 📅

Temos disponibilidade esta semana:
- Segunda: 14h, 16h, 18h
- Terça: 10h, 15h, 17h
- Quarta: 9h, 14h, 16h

Qual horário prefere?`;
    }

    // Intenção de remarcar
    if (messageLower.includes('remarcar') || messageLower.includes('mudar')) {
      return `Claro, ${lead.name}! 

Para te ajudar a remarcar, preciso saber:
Qual dia e horário você prefere?`;
    }

    // Intenção de cancelar
    if (messageLower.includes('cancelar') || messageLower.includes('desmarcar')) {
      return `Sem problemas! Para confirmar o cancelamento, responda SIM.`;
    }

    // Dúvida ou informação
    return `Olá ${lead.name}! 

Como posso ajudar hoje?

1️⃣ Agendar consulta
2️⃣ Remarcar horário
3️⃣ Tirar dúvida
4️⃣ Falar com especialista

Digite o número da opção.`;
  }

  /**
   * Introdução ao serviço
   */
  private getServiceIntroduction(service: string): string {
    const intros: Record<string, string> = {
      fisioterapia_esportiva: `🏃 *Fisioterapia Esportiva*

Somos especialistas em lesões esportivas! Nossa equipe trata:
✅ Lesões musculares
✅ Entorses
✅ Tendinites
✅ Recuperação pós-cirúrgica
✅ Performance esportiva

💰 R$ 115/sessão
✨ *Primeira avaliação GRATUITA!*

Quer agendar sua avaliação?`,

      atm: `🦷 *Tratamento de ATM*

Somos pioneiros no tratamento de ATM na Mooca!

Tratamos:
✅ Dores na mandíbula
✅ Estalos ao mastigar
✅ Dores de cabeça
✅ Limitação de abertura bucal
✅ Bruxismo

💰 R$ 120/sessão
✨ *Primeira avaliação GRATUITA!*

Vamos agendar?`,

      avaliacao_corrida: `👟 *Avaliação de Corrida*

Nossa avaliação é a mais completa da região!

Inclui:
✅ Análise biomecânica
✅ Teste de pisada
✅ Avaliação de lesões
✅ Programa personalizado de treino
✅ Orientação de calçados

💰 R$ 280 (sessão completa)

Pratica corrida há quanto tempo?`,

      outros: `Obrigado por entrar em contato!

Nossos especialistas podem ajudar com diversos problemas. Me conta um pouco mais sobre o que você sente que agendarei com o profissional ideal!`,
    };

    const intro = intros[service];
    return intro ?? intros['outros'];
  }

  /**
   * Obter/criar contexto de conversa
   */
  private async getContext(leadId: string): Promise<ConversationContext | null> {
    // TODO: Implementar com Redis
    // Por enquanto retornar null
    return null;
  }

  /**
   * Salvar contexto
   */
  private async saveContext(context: ConversationContext): Promise<void> {
    // TODO: Implementar com Redis
  }

  /**
   * Limpar contexto (expirado)
   */
  private async clearContext(leadId: string): Promise<void> {
    // TODO: Implementar com Redis
  }
}

