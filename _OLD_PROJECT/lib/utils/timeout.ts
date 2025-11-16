/**
 * Função helper para adicionar timeout em Promises
 * @param promise - Promise a ser executada
 * @param timeoutMs - Tempo máximo em milissegundos
 * @param errorMessage - Mensagem de erro personalizada
 * @returns Promise com timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(errorMessage || `Operação excedeu o tempo limite de ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise,
  ]);
}

