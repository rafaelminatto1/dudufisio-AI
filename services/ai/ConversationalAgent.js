/**
 * Conversational Agent - Agente de IA conversacional com Google Gemini
 * Activity Fisioterapia Integration - Fase 3
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
export class ConversationalAgent {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
        if (!apiKey) {
            console.warn('⚠️  Gemini API Key não configurada');
        }
        this.gemini = new GoogleGenerativeAI(apiKey);
        this.conversationHistory = new Map();
    }
    /**
     * Processar mensagem com contexto
     */
    async processMessage(leadId, message, context) {
        // 1. Recuperar histórico
        const history = this.getHistory(leadId);
        // 2. Construir prompt com contexto
        const prompt = this.buildPrompt(message, context, history);
        // 3. Chamar Gemini
        try {
            const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            // 4. Extrair intenções e entidades
            const intent = await this.extractIntent(message);
            const entities = await this.extractEntities(message);
            // 5. Salvar no histórico
            this.addToHistory(leadId, { role: 'user', content: message });
            this.addToHistory(leadId, { role: 'assistant', content: response });
            return {
                message: response,
                intent,
                entities,
                suggestedActions: this.getSuggestedActions(intent, entities),
                confidence: this.calculateConfidence(intent),
            };
        }
        catch (error) {
            console.error('Erro ao processar com Gemini:', error);
            // Fallback: resposta padrão
            return {
                message: 'Desculpe, tive dificuldade em processar sua mensagem. Um especialista entrará em contato em breve.',
                intent: 'other',
                entities: {},
                suggestedActions: ['Encaminhar para atendimento humano'],
                confidence: 0,
            };
        }
    }
    /**
     * Construir prompt com contexto
     */
    buildPrompt(message, context, history) {
        return `
Você é uma assistente virtual profissional da clínica de fisioterapia, especializada em:
- Fisioterapia esportiva (lesões, dores, recuperação)
- ATM (disfunções temporomandibulares)
- Avaliação de corrida (biomecânica, pisada, performance)

CONTEXTO DO LEAD:
Nome: ${context.name || 'Novo lead'}
Interesse: ${context.service_interest || 'Não especificado'}
Última interação: ${context.last_contact_at || 'Primeira vez'}
Status: ${context.status || 'novo'}

${context.pain_description ? `Descrição da dor: ${context.pain_description}` : ''}

HISTÓRICO DA CONVERSA:
${history.slice(-5).map((m) => `${m.role === 'user' ? 'Paciente' : 'Você'}: ${m.content}`).join('\n')}

MENSAGEM ATUAL DO PACIENTE:
${message}

INSTRUÇÕES:
1. Responda de forma acolhedora, profissional e empática
2. Use emojis moderadamente (1-2 por mensagem)
3. Seja objetiva e direta
4. Faça perguntas de qualificação quando apropriado
5. Ofereça agendamento quando o lead estiver qualificado
6. Use até 3 linhas por resposta
7. Se não souber algo, seja honesta e ofereça ajuda humana

DIRETRIZES ESPECÍFICAS:
- Para dores/lesões: Pergunte localização, duração, intensidade
- Para ATM: Pergunte sobre estalos, dores de cabeça, limitação
- Para corrida: Pergunte sobre quilometragem, lesões recorrentes, objetivos
- Sempre mencione que a primeira avaliação é GRATUITA
- Cite os diferenciais da clínica quando relevante

IMPORTANTE: Nunca dê diagnósticos médicos. Apenas colete informações e sugira avaliação.

RESPONDA AGORA (máximo 3 linhas):
`;
    }
    /**
     * Extrair intenção da mensagem
     */
    async extractIntent(message) {
        const messageLower = message.toLowerCase();
        // Mapeamento simples de palavras-chave
        if (messageLower.includes('agendar') || messageLower.includes('marcar')) {
            return 'schedule';
        }
        if (messageLower.includes('remarcar') || messageLower.includes('mudar')) {
            return 'reschedule';
        }
        if (messageLower.includes('cancelar')) {
            return 'cancel';
        }
        if (messageLower.includes('preço') || messageLower.includes('valor') || messageLower.includes('quanto')) {
            return 'info_price';
        }
        if (messageLower.includes('endereço') || messageLower.includes('onde') || messageLower.includes('local')) {
            return 'info_location';
        }
        if (messageLower.includes('horário') || messageLower.includes('funciona')) {
            return 'info_hours';
        }
        if (messageLower.includes('convênio') || messageLower.includes('plano')) {
            return 'info_insurance';
        }
        if (messageLower.includes('dor') || messageLower.includes('lesão') || messageLower.includes('machucado')) {
            return 'pain_sports';
        }
        if (messageLower.includes('atm') || messageLower.includes('mandíbula')) {
            return 'pain_atm';
        }
        if (messageLower.includes('corr')) {
            return 'running_assessment';
        }
        if (messageLower.includes('olá') || messageLower.includes('oi') || messageLower.includes('bom dia')) {
            return 'greeting';
        }
        return 'question';
    }
    /**
     * Extrair entidades da mensagem
     */
    async extractEntities(message) {
        const entities = {};
        // Extrair possível nome (primeira palavra capitalizada)
        const words = message.split(' ');
        const capitalizedWords = words.filter((w) => /^[A-Z]/.test(w));
        if (capitalizedWords.length > 0 && capitalizedWords.length <= 3) {
            entities.nome = capitalizedWords.join(' ');
        }
        // Extrair telefone
        const phoneMatch = message.match(/\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}/);
        if (phoneMatch) {
            entities.telefone = phoneMatch[0];
        }
        // Extrair localização da dor
        const bodyParts = ['joelho', 'ombro', 'costas', 'lombar', 'cervical', 'tornozelo', 'pé', 'mão', 'cotovelo'];
        const foundBodyParts = bodyParts.filter((part) => message.toLowerCase().includes(part));
        if (foundBodyParts.length > 0) {
            entities.localizacao_dor = foundBodyParts[0];
        }
        // Extrair duração (há X dias/semanas/meses)
        const durationMatch = message.match(/há\s+(\d+)\s+(dia|semana|mês|meses|ano)/i);
        if (durationMatch) {
            entities.duracao_dor = `${durationMatch[1]} ${durationMatch[2]}`;
        }
        // Extrair esporte
        const sports = ['corrida', 'futebol', 'vôlei', 'basquete', 'tênis', 'natação', 'ciclismo'];
        const foundSports = sports.filter((sport) => message.toLowerCase().includes(sport));
        if (foundSports.length > 0) {
            entities.esporte = foundSports[0];
        }
        return entities;
    }
    /**
     * Sugerir ações para o agente humano
     */
    getSuggestedActions(intent, entities) {
        const actions = [];
        if (intent === 'schedule') {
            actions.push('Abrir agenda para agendamento');
        }
        if (intent === 'pain_sports' || intent === 'pain_atm') {
            actions.push('Criar prontuário preliminar');
            actions.push('Marcar como lead quente');
        }
        if (entities.nome && entities.telefone) {
            actions.push('Atualizar informações do lead');
        }
        if (intent === 'question' || intent === 'other') {
            actions.push('Encaminhar para especialista');
        }
        return actions;
    }
    /**
     * Calcular confiança da IA
     */
    calculateConfidence(intent) {
        // Intenções simples têm alta confiança
        const highConfidenceIntents = [
            'schedule',
            'reschedule',
            'cancel',
            'info_price',
            'info_location',
            'info_hours',
        ];
        if (highConfidenceIntents.includes(intent)) {
            return 0.9;
        }
        // Intenções complexas têm confiança média
        if (['pain_sports', 'pain_atm', 'running_assessment'].includes(intent)) {
            return 0.75;
        }
        // Outras intenções têm confiança baixa
        return 0.5;
    }
    /**
     * Gerenciar histórico de conversas
     */
    getHistory(leadId) {
        return this.conversationHistory.get(leadId) || [];
    }
    addToHistory(leadId, message) {
        const history = this.getHistory(leadId);
        history.push(message);
        // Limitar histórico a 10 mensagens
        if (history.length > 10) {
            history.shift();
        }
        this.conversationHistory.set(leadId, history);
    }
    clearHistory(leadId) {
        this.conversationHistory.delete(leadId);
    }
}
// Singleton
let agentInstance = null;
export const getConversationalAgent = () => {
    if (!agentInstance) {
        agentInstance = new ConversationalAgent();
    }
    return agentInstance;
};
