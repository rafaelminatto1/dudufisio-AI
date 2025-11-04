/**
 * Fetch with Retry Logic
 * 
 * Implementa requisições HTTP com retry automático em caso de falha
 * Usa backoff exponencial para evitar sobrecarregar o servidor
 */

export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Verifica se o erro é recuperável (vale a pena tentar novamente)
 */
function isRetriableError(error: any, response?: Response): boolean {
  // Network errors (sem resposta)
  if (!response) {
    return true;
  }

  // Status codes que valem a pena retry
  const retriableStatusCodes = [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ];

  return retriableStatusCodes.includes(response.status);
}

/**
 * Calcula o delay para o próximo retry usando backoff exponencial
 */
function calculateBackoffDelay(attempt: number, baseDelay: number): number {
  // Backoff exponencial: baseDelay * (2 ^ attempt) com jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Adicionar jitter (variação aleatória de ±25%)
  const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
  
  // Limitar máximo a 30 segundos
  return Math.min(exponentialDelay + jitter, 30000);
}

/**
 * Adiciona timeout a uma Promise
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Fetch com retry automático
 * 
 * @example
 * ```typescript
 * // Uso básico
 * const data = await fetchWithRetry('/api/users');
 * 
 * // Com opções customizadas
 * const data = await fetchWithRetry('/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'João' }),
 *   retries: 5,
 *   retryDelay: 2000,
 *   timeout: 10000,
 *   onRetry: (attempt, error) => {
 *     
 *   }
 * });
 * ```
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error | undefined;
  let response: Response | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      

      // Fazer request com timeout
      const fetchPromise = fetch(url, fetchOptions);
      response = await withTimeout(fetchPromise, timeout);

      // Verificar se response é OK
      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          response
        );
      }

      // Parsear resposta
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as unknown as T;
      } else {
        data = (await response.blob()) as unknown as T;
      }

      
      return data;

    } catch (error: any) {
      lastError = error;
      
      console.error(`❌ [FETCH] Tentativa ${attempt + 1} falhou: ${error.message}`);

      // Se não for o último retry e o erro for recuperável
      if (attempt < retries && isRetriableError(error, response)) {
        const delay = calculateBackoffDelay(attempt, retryDelay);
        
        console.log(`⏳ [FETCH] Aguardando ${delay.toFixed(0)}ms antes do próximo retry...`);
        
        // Callback de retry (para analytics/logging)
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        // Aguardar antes do próximo retry
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        continue; // Tentar novamente
      }

      // Se não for recuperável ou é o último retry, lançar erro
      break;
    }
  }

  // Todas as tentativas falharam
  const errorMessage = `Request falhou após ${retries + 1} tentativas: ${lastError?.message || 'Unknown error'}`;
  console.error(`❌ [FETCH] ${errorMessage}`);
  
  throw new FetchError(
    errorMessage,
    response?.status,
    response?.statusText,
    response
  );
}

/**
 * Helper para fazer GET request com retry
 */
export async function get<T = any>(
  url: string,
  options?: FetchWithRetryOptions
): Promise<T> {
  return fetchWithRetry<T>(url, { ...options, method: 'GET' });
}

/**
 * Helper para fazer POST request com retry
 */
export async function post<T = any>(
  url: string,
  data?: any,
  options?: FetchWithRetryOptions
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper para fazer PUT request com retry
 */
export async function put<T = any>(
  url: string,
  data?: any,
  options?: FetchWithRetryOptions
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper para fazer DELETE request com retry
 */
export async function del<T = any>(
  url: string,
  options?: FetchWithRetryOptions
): Promise<T> {
  return fetchWithRetry<T>(url, { ...options, method: 'DELETE' });
}

export default fetchWithRetry;

