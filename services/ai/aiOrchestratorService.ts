import { AIProvider, AIQueryLog, AIResponse, KnowledgeBaseEntry } from '../../types';
import { cacheService } from './cacheService';
import { knowledgeService } from './knowledgeService';
import {
  AIConsultationCategory,
  AIQueryContext,
  ContributionRequest,
  ContributionSubmission,
  OrchestratorMetrics,
  PremiumAccount,
  ProviderUsageSnapshot,
} from './types';

const DEFAULT_CATEGORY: AIConsultationCategory = 'patient_question';
const KNOWLEDGE_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

export class AiOrchestratorService {
  private readonly accounts: PremiumAccount[];
  private rotationIndex = 0;
  private readonly metrics: OrchestratorMetrics;
  private queryLogs: AIQueryLog[] = [];
  private contributions: ContributionSubmission[] = [];
  private logCounter = 0;

  constructor(
    private readonly knowledge = knowledgeService,
    private readonly cache = cacheService,
  ) {
    this.accounts = this.createAccountPool();
    this.metrics = this.createInitialMetrics();
  }

  async getResponse(prompt: string, context?: AIQueryContext): Promise<AIResponse> {
    const category = context?.category ?? DEFAULT_CATEGORY;
    const startedAt = Date.now();

    // Step 1: Knowledge base lookup
    if (!context?.skipKnowledgeBase) {
      const knowledgeHit = this.searchKnowledgeBase(prompt, context);
      if (knowledgeHit) {
        const latency = Date.now() - startedAt;
        const response: AIResponse = {
          content: knowledgeHit.entry.content,
          source: AIProvider.KnowledgeBase,
          metadata: {
            provider: AIProvider.KnowledgeBase,
            category,
            strategy: 'knowledge_base',
            knowledgeBaseEntryId: knowledgeHit.entry.id,
            latencyMs: latency,
          },
        };

        this.metrics.totalQueries += 1;
        this.metrics.knowledgeHits += 1;
        this.recordLog(prompt, response, category, latency);

        if (knowledgeHit.shouldCache) {
          this.cache.set(category, prompt, response, knowledgeHit.cacheTtl ?? KNOWLEDGE_CACHE_TTL);
        }

        return response;
      }
    }

    // Step 2: Cache lookup
    const cached = this.cache.get(category, prompt);
    if (cached) {
      const latency = Date.now() - startedAt;
      cached.metadata = {
        ...cached.metadata,
        provider: cached.metadata?.provider ?? AIProvider.Cache,
        category,
        strategy: 'cache',
        latencyMs: latency,
        cached: true,
      };

      this.metrics.totalQueries += 1;
      this.metrics.cacheHits += 1;
      this.recordLog(prompt, cached, category, latency, { cached: true });

      return cached;
    }

    // Step 3: Rotate premium accounts
    const account = this.selectAccount(context?.preferredProvider);
    if (!account) {
      const latency = Date.now() - startedAt;
      const fallback: AIResponse = {
        content:
          'Nenhum provedor premium está disponível no momento. Tente novamente em alguns instantes ou consulte os protocolos internos.',
        source: AIProvider.Mock,
        metadata: {
          provider: AIProvider.Mock,
          category,
          strategy: 'premium_account',
          warnings: ['no-provider-available'],
          latencyMs: latency,
        },
      };

      this.metrics.totalQueries += 1;
      this.recordLog(prompt, fallback, category, latency, { warnings: ['no-provider-available'] });
      return fallback;
    }

    const aiResponse = await this.invokePremiumAccount(account, prompt, category, context);
    const latency = Date.now() - startedAt;

    aiResponse.metadata = {
      ...aiResponse.metadata,
      latencyMs: latency,
      category,
    };

    this.metrics.totalQueries += 1;
    this.registerUsage(account, latency, aiResponse.metadata?.warnings);
    this.recordLog(prompt, aiResponse, category, latency);
    this.cache.set(category, prompt, aiResponse, context?.cacheTtlMs);

    return aiResponse;
  }

  async query(prompt: string, providerOrContext?: string | AIQueryContext): Promise<AIResponse> {
    if (typeof providerOrContext === 'string') {
      return this.getResponse(prompt, { preferredProvider: providerOrContext as AIProvider });
    }
    return this.getResponse(prompt, providerOrContext);
  }

  getQueryHistory(): AIQueryLog[] {
    return [...this.queryLogs];
  }

  getAvailableProviders(): AIProvider[] {
    const premiumProviders = new Set<AIProvider>(this.accounts.map(account => account.provider));
    premiumProviders.add(AIProvider.KnowledgeBase);
    premiumProviders.add(AIProvider.Cache);
    return Array.from(premiumProviders);
  }

  getMetrics(): OrchestratorMetrics {
    const providerUsage = Object.fromEntries(
      Object.entries(this.metrics.providerUsage).map(([key, snapshot]) => [
        key,
        { ...snapshot },
      ]),
    );

    return {
      ...this.metrics,
      providerUsage,
    };
  }

  getAccounts(): PremiumAccount[] {
    return this.accounts.map(account => ({ ...account, usage: { ...account.usage } }));
  }

  submitContribution(request: ContributionRequest): ContributionSubmission {
    const submission: ContributionSubmission = {
      ...request,
      id: `kb_submission_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date(),
    };

    this.contributions = [submission, ...this.contributions];
    return submission;
  }

  reviewContribution(
    submissionId: string,
    outcome: 'approved' | 'rejected',
    reviewerId: string,
    notes?: string,
  ): ContributionSubmission | null {
    const index = this.contributions.findIndex(contribution => contribution.id === submissionId);
    if (index === -1) {
      return null;
    }

    const submission = this.contributions[index];
    submission.status = outcome;
    submission.reviewNotes = notes;
    submission.reviewedAt = new Date();
    submission.reviewerId = reviewerId;

    if (outcome === 'approved') {
      this.publishContribution(submission);
    }

    this.contributions[index] = submission;
    return submission;
  }

  getPendingContributions(): ContributionSubmission[] {
    return this.contributions.filter(contribution => contribution.status === 'pending');
  }

  private searchKnowledgeBase(prompt: string, context?: AIQueryContext):
    | { entry: KnowledgeBaseEntry; shouldCache: boolean; cacheTtl?: number }
    | null {
    const entry = this.knowledge.search(context?.metadata?.knowledgeQuery ?? prompt);
    if (!entry) {
      return null;
    }

    const shouldCache = (context?.category ?? DEFAULT_CATEGORY) !== 'knowledge_update';
    return {
      entry,
      shouldCache,
      cacheTtl: shouldCache ? context?.cacheTtlMs ?? KNOWLEDGE_CACHE_TTL : undefined,
    };
  }

  private selectAccount(preferred?: AIProvider): PremiumAccount | null {
    const now = new Date();
    const available = this.accounts.filter(account => this.isAccountAvailable(account, now));

    if (!available.length) {
      return null;
    }

    if (preferred) {
      const preferredAccount = available.find(account => account.provider === preferred);
      if (preferredAccount) {
        return preferredAccount;
      }
    }

    for (let i = 0; i < this.accounts.length; i += 1) {
      const candidateIndex = (this.rotationIndex + i) % this.accounts.length;
      const candidate = this.accounts[candidateIndex];
      if (available.includes(candidate)) {
        this.rotationIndex = (candidateIndex + 1) % this.accounts.length;
        this.metrics.lastRotationIndex = candidateIndex;
        return candidate;
      }
    }

    return available[0];
  }

  private isAccountAvailable(account: PremiumAccount, referenceDate: Date): boolean {
    this.resetUsageIfNeeded(account, referenceDate);

    if (account.status === 'cooldown' && account.cooldownUntil && Date.now() >= account.cooldownUntil) {
      account.status = 'active';
      account.cooldownUntil = undefined;
    }

    if (account.status === 'exhausted') {
      return false;
    }

    if (account.status === 'cooldown') {
      return false;
    }

    if (account.usage.today >= account.dailyLimit) {
      account.status = 'exhausted';
      return false;
    }

    if (account.usage.thisMonth >= account.monthlyLimit) {
      account.status = 'exhausted';
      return false;
    }

    return true;
  }

  private registerUsage(account: PremiumAccount, latencyMs: number, warnings?: string[]): void {
    account.usage.today += 1;
    account.usage.thisMonth += 1;
    account.usage.lastResetAt = Date.now();

    const usageSnapshot = this.metrics.providerUsage[account.id];
    if (!usageSnapshot) {
      this.metrics.providerUsage[account.id] = this.createUsageSnapshot(account);
    }

    const snapshot = this.metrics.providerUsage[account.id];
    snapshot.requests += 1;
    snapshot.lastUsedAt = Date.now();
    if (warnings && warnings.length > 0) {
      snapshot.failures += 1;
    }

    if (account.usage.today >= account.dailyLimit) {
      account.status = 'cooldown';
      account.cooldownUntil = Date.now() + account.cooldownMinutes * 60 * 1000;
    }

    if (account.usage.thisMonth >= account.monthlyLimit) {
      account.status = 'exhausted';
    }
  }

  private invokePremiumAccount(
    account: PremiumAccount,
    prompt: string,
    category: AIConsultationCategory,
    context?: AIQueryContext,
  ): Promise<AIResponse> {
    const structured = this.composeStructuredResponse(prompt, category, context);
    const tokensEstimated = this.estimateTokens(prompt, structured);

    const response: AIResponse = {
      content: structured,
      source: account.provider,
      metadata: {
        provider: account.provider,
        accountId: account.id,
        strategy: 'premium_account',
        tokensEstimated,
      },
    };

    return Promise.resolve(response);
  }

  private composeStructuredResponse(
    prompt: string,
    category: AIConsultationCategory,
    context?: AIQueryContext,
  ): string {
    const sanitizedPrompt = prompt.trim();
    const shortPromptExcerpt = sanitizedPrompt.slice(0, 280);

    switch (category) {
      case 'exercise_suggestion':
        return [
          'AVALIAÇÃO:',
          '- Revisar limitações descritas no prompt e confirmar sinais vitais antes de intervir.',
          `- Pontos-chave detectados: ${shortPromptExcerpt || 'sem detalhes adicionais.'}`,
          '',
          'PLANO:',
          '- Incluir exercícios de mobilidade articular, fortalecimento progressivo e orientações de controle de dor.',
          '- Ajustar volume conforme tolerância do paciente e registrar evolução na plataforma.',
        ].join('\n');
      case 'patient_progress':
        return [
          'RESUMO DA EVOLUÇÃO:',
          `- Principais achados do acompanhamento: ${shortPromptExcerpt || 'informações não detalhadas.'}`,
          '- Avaliar escalas funcionais e dor para comparar com sessões anteriores.',
          '',
          'RECOMENDAÇÕES:',
          '- Reforçar adesão à fisioterapia domiciliar e atualizar o plano terapêutico.',
          '- Registrar feedback do paciente para calibrar metas.',
        ].join('\n');
      case 'differential_diagnosis':
        return [
          'HIPÓTESES PRINCIPAIS:',
          `- Analisar sinais e sintomas relatados: ${shortPromptExcerpt || 'insuficientes para diferenciação.'}`,
          '- Considerar exames complementares e encaminhar para avaliação médica quando necessário.',
          '',
          'PRÓXIMOS PASSOS:',
          '- Realizar testes clínicos específicos e monitorar resposta às intervenções iniciais.',
          '- Documentar achados no prontuário para discussão multidisciplinar.',
        ].join('\n');
      case 'discharge_report':
        return [
          'RESUMO DO TRATAMENTO:',
          `- Evolução registrada: ${shortPromptExcerpt || 'não informada.'}`,
          '- Destacar ganhos funcionais, controle da dor e adesão às orientações.',
          '',
          'RECOMENDAÇÕES PÓS-ALTA:',
          '- Entregar programa domiciliar com revisões periódicas.',
          '- Alinhar sinais de alerta que exigem retorno imediato.',
        ].join('\n');
      case 'patient_question':
        return [
          'Resposta ao paciente:',
          `${shortPromptExcerpt || 'Orientação solicitada pelo paciente.'}`,
          'Sugestão rápida: seguir orientações já prescritas e comunicar qualquer piora súbita.',
        ].join(' ');
      case 'knowledge_update':
        return [
          'ATUALIZAÇÃO DE CONHECIMENTO:',
          `- Conteúdo recebido: ${shortPromptExcerpt || 'sem detalhes fornecidos.'}`,
          '- Encaminhar para revisão clínica antes da publicação.',
        ].join('\n');
      default:
        return [
          'AVALIAÇÃO PRELIMINAR:',
          `- Pontos analisados: ${shortPromptExcerpt || 'dados não especificados.'}`,
          '',
          'PLANO SUGERIDO:',
          '- Aplicar protocolo padrão de fisioterapia com ajustes individuais.',
          '- Reavaliar evolução a cada sessão e manter documentação atualizada.',
        ].join('\n');
    }
  }

  private estimateTokens(prompt: string, response: string): number {
    const promptTokens = prompt.split(/\s+/).filter(Boolean).length;
    const responseTokens = response.split(/\s+/).filter(Boolean).length;
    return Math.round((promptTokens + responseTokens) * 1.2);
  }

  private resetUsageIfNeeded(account: PremiumAccount, now: Date): void {
    const lastReset = new Date(account.usage.lastResetAt);
    if (!this.isSameDay(lastReset, now)) {
      account.usage.today = 0;
      account.status = 'active';
      account.cooldownUntil = undefined;
      account.usage.lastResetAt = now.getTime();
    }

    const currentMonth = this.formatMonth(now);
    if (account.usage.monthReference !== currentMonth) {
      account.usage.thisMonth = 0;
      account.usage.monthReference = currentMonth;
      account.status = 'active';
      account.cooldownUntil = undefined;
    }
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  private formatMonth(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private recordLog(
    prompt: string,
    response: AIResponse,
    category: AIConsultationCategory,
    latencyMs: number,
    extras?: { cached?: boolean; warnings?: string[] },
  ): void {
    const provider = (response.metadata?.provider ?? response.source) as AIProvider;
    const id = ++this.logCounter;

    const log: AIQueryLog = {
      id,
      prompt,
      content: response.content,
      source: provider,
      timestamp: new Date(),
      category,
      accountId: response.metadata?.accountId,
      latencyMs,
      cached: extras?.cached ?? response.metadata?.cached ?? false,
      knowledgeBaseEntryId: response.metadata?.knowledgeBaseEntryId,
      warnings: extras?.warnings ?? response.metadata?.warnings,
    };

    this.queryLogs = [log, ...this.queryLogs].slice(0, 100);
  }

  private publishContribution(submission: ContributionSubmission): void {
    this.knowledge.add({
      title: submission.title,
      type: submission.type,
      content: submission.content,
      tags: submission.tags,
    });
  }

  private createAccountPool(): PremiumAccount[] {
    const now = new Date();
    const month = this.formatMonth(now);
    const baseUsage = {
      today: 0,
      thisMonth: 0,
      lastResetAt: now.getTime(),
      monthReference: month,
    };

    return [
      {
        id: 'openai_plus',
        label: 'ChatGPT Plus',
        provider: AIProvider.OpenAI,
        accountEmail: 'chatgpt.plus@fisioflow.ai',
        dailyLimit: 180,
        monthlyLimit: 4000,
        cooldownMinutes: 15,
        usage: { ...baseUsage },
        status: 'active',
        notes: 'Uso geral para sínteses clínicas em português.',
      },
      {
        id: 'claude_pro',
        label: 'Claude Pro',
        provider: AIProvider.Anthropic,
        accountEmail: 'claude.pro@fisioflow.ai',
        dailyLimit: 120,
        monthlyLimit: 2500,
        cooldownMinutes: 20,
        usage: { ...baseUsage },
        status: 'active',
        notes: 'Preferido para raciocínio clínico complexo.',
      },
      {
        id: 'gemini_pro',
        label: 'Gemini Pro',
        provider: AIProvider.Gemini,
        accountEmail: 'gemini.pro@fisioflow.ai',
        dailyLimit: 150,
        monthlyLimit: 3200,
        cooldownMinutes: 10,
        usage: { ...baseUsage },
        status: 'active',
        notes: 'Utilizado para cruzamento com protocolos e dados estruturados.',
      },
      {
        id: 'perplexity_pro',
        label: 'Perplexity Pro',
        provider: AIProvider.Perplexity,
        accountEmail: 'perplexity.pro@fisioflow.ai',
        dailyLimit: 90,
        monthlyLimit: 2000,
        cooldownMinutes: 30,
        usage: { ...baseUsage },
        status: 'active',
        notes: 'Adequado para buscas rápidas e contextualização.',
      },
    ];
  }

  private createInitialMetrics(): OrchestratorMetrics {
    const providerUsage: Record<string, ProviderUsageSnapshot> = {};
    this.accounts.forEach(account => {
      providerUsage[account.id] = this.createUsageSnapshot(account);
    });

    return {
      totalQueries: 0,
      knowledgeHits: 0,
      cacheHits: 0,
      providerUsage,
      lastRotationIndex: 0,
      lastMetricsResetAt: new Date(),
    };
  }

  private createUsageSnapshot(account: PremiumAccount): ProviderUsageSnapshot {
    return {
      accountId: account.id,
      provider: account.provider,
      requests: 0,
      failures: 0,
    };
  }
}

export const aiOrchestratorService = new AiOrchestratorService();
