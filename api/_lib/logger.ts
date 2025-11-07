/**
 * Logger simplificado para APIs Serverless Vercel
 * 
 * Fornece métodos de logging thread-safe para Edge Functions e Node.js Functions.
 * Não usa window ou import.meta.env, compatível com CommonJS e Edge Runtime.
 * 
 * @example
 * ```typescript
 * import { logger } from '../_lib/logger';
 * 
 * // Log informativo
 * logger.info('Operação iniciada', { userId: '123', action: 'create' });
 * 
 * // Log de erro
 * logger.error('Falha ao processar', { error: err.message, stack: err.stack });
 * 
 * // Log de debug (apenas em desenvolvimento)
 * logger.debug('Valor intermediário', { data: someData });
 * ```
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Contexto estruturado para logs
 * Permite adicionar dados arbitrários aos logs mantendo type safety
 */
interface LogContext {
  [key: string]: unknown;
}

/**
 * Logger simplificado otimizado para Vercel Serverless Functions
 * 
 * Características:
 * - Timestamps automáticos em ISO 8601
 * - Contexto estruturado em JSON
 * - Sem dependências de browser (window, document)
 * - Compatível com Edge Runtime e Node.js Runtime
 * - Debug logs apenas em desenvolvimento
 */
class SimpleLogger {
  /**
   * Formata mensagem de log com timestamp e contexto
   * @private
   * @param level - Nível do log (info, warn, error, debug)
   * @param message - Mensagem descritiva
   * @param context - Dados estruturados adicionais
   * @returns String formatada para console
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Registra mensagem informativa
   * 
   * Use para operações normais, inicializações, conclusões bem-sucedidas.
   * 
   * @param message - Descrição da operação ou evento
   * @param context - Contexto adicional (IDs, valores, metadata)
   * 
   * @example
   * ```typescript
   * logger.info('Appointment criado', { 
   *   appointmentId: 'apt_123', 
   *   patientId: 'pat_456',
   *   duration: '30min'
   * });
   * ```
   */
  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  /**
   * Registra aviso não crítico
   * 
   * Use para situações anormais mas não bloqueantes, deprecations, limites próximos.
   * 
   * @param message - Descrição do aviso
   * @param context - Contexto do problema
   * 
   * @example
   * ```typescript
   * logger.warn('Rate limit próximo', { 
   *   current: 95, 
   *   limit: 100, 
   *   resetIn: '5min' 
   * });
   * ```
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  /**
   * Registra erro crítico
   * 
   * Use para falhas, exceções, operações que não puderam ser completadas.
   * 
   * @param message - Descrição do erro
   * @param context - Detalhes do erro (stack trace, input, estado)
   * 
   * @example
   * ```typescript
   * logger.error('Falha ao salvar no banco', { 
   *   error: err.message, 
   *   stack: err.stack,
   *   table: 'appointments',
   *   operation: 'insert'
   * });
   * ```
   */
  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }

  /**
   * Registra mensagem de debug
   * 
   * Apenas em ambiente de desenvolvimento (NODE_ENV !== 'production').
   * Use para debugging, valores intermediários, fluxo de execução.
   * 
   * @param message - Mensagem de debug
   * @param context - Dados de debug
   * 
   * @example
   * ```typescript
   * logger.debug('Estado intermediário', { 
   *   step: 3, 
   *   data: processedData,
   *   timestamp: Date.now()
   * });
   * ```
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

/**
 * Instância singleton do logger para APIs serverless
 * 
 * Importe e use diretamente em suas Edge Functions e API routes.
 * 
 * @public
 * @example
 * ```typescript
 * import { logger } from '../_lib/logger';
 * 
 * export default async function handler(req: Request) {
 *   logger.info('Request recebido', { method: req.method, url: req.url });
 *   // ... lógica da API
 * }
 * ```
 */
export const logger = new SimpleLogger();

