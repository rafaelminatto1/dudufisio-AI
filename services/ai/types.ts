/**
 * Tipos e interfaces para o sistema de AI providers
 * Suporta múltiplos providers (Groq, Gemini) com roteamento automático
 */

// ==================== ENUMS ====================

/**
 * Providers de IA disponíveis
 */
export enum AIProvider {
  GROQ = 'groq',
  GEMINI = 'gemini',
  AUTO = 'auto', // Seleção automática baseada no caso de uso
}

/**
 * Casos de uso para roteamento automático de provider
 */
export enum AIUseCase {
  // Casos de uso GROQ (velocidade/tempo real)
  REALTIME_SUGGESTIONS = 'realtime_suggestions',
  AUTOCOMPLETE = 'autocomplete',
  QUICK_SEARCH = 'quick_search',
  SYMPTOM_ANALYSIS = 'symptom_analysis',
  CLASSIFICATION = 'classification',
  VALIDATION = 'validation',
  BODY_MAP_ANNOTATION = 'body_map_annotation',
  
  // Casos de uso GEMINI (complexidade/multimodal)
  PATIENT_ANALYSIS = 'patient_analysis',
  REPORT_GENERATION = 'report_generation',
  IMAGE_ANALYSIS = 'image_analysis',
  TREATMENT_PROTOCOL = 'treatment_protocol',
  SOAP_NOTE = 'soap_note',
  LONG_CONTEXT = 'long_context',
  
  // Casos neutros (pode usar qualquer um)
  GENERAL = 'general',
  CHAT = 'chat',
}

/**
 * Modelos disponíveis por provider
 */
export enum AIModel {
  // Groq Models
  GROQ_LLAMA_70B = 'llama-3.3-70b-versatile',
  GROQ_LLAMA_8B = 'llama-3.1-8b-instant',
  GROQ_MIXTRAL = 'mixtral-8x7b-32768',
  
  // Gemini Models
  GEMINI_PRO = 'gemini-pro',
  GEMINI_FLASH = 'gemini-1.5-flash',
  GEMINI_PRO_VISION = 'gemini-pro-vision',
}

/**
 * Status de uma requisição de IA
 */
export enum AIRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  FALLBACK = 'fallback', // Usou fallback para outro provider
}

// ==================== INTERFACES ====================

/**
 * Configuração de uma requisição de IA
 */
export interface AIRequest {
  // Conteúdo
  prompt: string;
  systemPrompt?: string;
  context?: string[];
  
  // Configuração
  useCase: AIUseCase;
  provider?: AIProvider; // Se não especificado, usa roteamento automático
  model?: AIModel;
  
  // Parâmetros de geração
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  
  // Streaming
  stream?: boolean;
  onChunk?: (chunk: string) => void;
  
  // Metadata
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Resposta de uma requisição de IA
 */
export interface AIResponse {
  // Conteúdo
  text: string;
  
  // Metadata da resposta
  provider: AIProvider;
  model: string;
  status: AIRequestStatus;
  
  // Métricas
  latencyMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  estimatedCost?: number;
  
  // Fallback info
  usedFallback: boolean;
  fallbackReason?: string;
  originalProvider?: AIProvider;
  
  // Metadata adicional
  timestamp: Date;
  requestId: string;
  metadata?: Record<string, any>;
}

/**
 * Configuração de streaming de texto
 */
export interface AIStreamConfig {
  onStart?: () => void;
  onChunk: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Configuração global do sistema de IA
 */
export interface AIConfig {
  // Providers
  primaryProvider: AIProvider;
  fallbackProvider: AIProvider;
  enableFallback: boolean;
  
  // Rate limiting
  maxRequestsPerMinute: {
    [AIProvider.GROQ]: number;
    [AIProvider.GEMINI]: number;
  };
  
  // Retry logic
  maxRetries: number;
  retryDelayMs: number;
  
  // Caching
  enableCache: boolean;
  cacheTTLSeconds: number;
  
  // Monitoring
  enableMetrics: boolean;
  logRequests: boolean;
  
  // Custos (USD por 1M tokens)
  costs: {
    [key: string]: {
      input: number;
      output: number;
    };
  };
}

/**
 * Métricas de uso de IA
 */
export interface AIMetrics {
  provider: AIProvider;
  model: string;
  
  // Contadores
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  fallbackRequests: number;
  
  // Latência
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  
  // Tokens
  totalTokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  
  // Custos
  estimatedCostUSD: number;
  
  // Período
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Interface base para serviços de IA
 */
export interface IAIService {
  // Identificação
  readonly provider: AIProvider;
  readonly defaultModel: AIModel;
  
  // Métodos principais
  generateText(request: AIRequest): Promise<AIResponse>;
  streamText(request: AIRequest, config: AIStreamConfig): Promise<void>;
  chat(messages: ChatMessage[], config?: Partial<AIRequest>): Promise<AIResponse>;
  
  // Validação
  isAvailable(): Promise<boolean>;
  getModels(): AIModel[];
  
  // Métricas
  getMetrics(): AIMetrics;
  resetMetrics(): void;
}

/**
 * Mensagem de chat
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Resultado de roteamento de provider
 */
export interface ProviderRoutingResult {
  provider: AIProvider;
  model: AIModel;
  reason: string;
  confidence: number; // 0-1
}

/**
 * Configuração de fallback
 */
export interface FallbackConfig {
  enabled: boolean;
  maxAttempts: number;
  fallbackChain: AIProvider[];
  shouldFallback: (error: Error) => boolean;
}

/**
 * Cache entry para respostas de IA
 */
export interface AICacheEntry {
  key: string;
  response: AIResponse;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
}

/**
 * Erro customizado para operações de IA
 */
export class AIError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code: string,
    public retryable: boolean = false,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Códigos de erro de IA
 */
export enum AIErrorCode {
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  INVALID_REQUEST = 'invalid_request',
  MODEL_UNAVAILABLE = 'model_unavailable',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error',
  PROVIDER_ERROR = 'provider_error',
  UNKNOWN = 'unknown',
}

// ==================== TYPES ====================

/**
 * Tipo helper para extrair o provider de um modelo
 */
export type ModelProvider<T extends AIModel> = 
  T extends `${infer P}_${string}` ? P : never;

/**
 * Opções de configuração para cada provider
 */
export type ProviderConfig = {
  [AIProvider.GROQ]: {
    apiKey: string;
    baseURL?: string;
    defaultModel: AIModel;
  };
  [AIProvider.GEMINI]: {
    apiKey: string;
    defaultModel: AIModel;
  };
};

/**
 * Tipo para callback de progresso
 */
export type ProgressCallback = (progress: {
  percentage: number;
  message: string;
  currentStep: number;
  totalSteps: number;
}) => void;


