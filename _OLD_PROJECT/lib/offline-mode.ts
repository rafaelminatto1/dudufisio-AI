/**
 * Modo Offline - DuduFisio-AI
 * 
 * Permite desenvolvimento sem conexão com Supabase.
 * Ativa automaticamente quando VITE_OFFLINE_MODE=true
 */

export const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === 'true';

export const OFFLINE_BANNER = {
  enabled: isOfflineMode,
  message: '🔌 Modo Offline Ativo - Usando dados mock',
  description: 'O sistema está rodando em modo offline. Funcionalidades que dependem do Supabase não estarão disponíveis.',
  color: 'warning' as const,
};

/**
 * Verifica se uma funcionalidade está disponível no modo offline
 */
export function isFeatureAvailable(feature: 'database' | 'auth' | 'storage' | 'realtime'): boolean {
  if (!isOfflineMode) return true;
  
  // No modo offline, apenas algumas features estão disponíveis
  const availableFeatures = ['database']; // Mock data disponível
  
  return availableFeatures.includes(feature);
}

/**
 * Retorna mensagem de erro apropriada para modo offline
 */
export function getOfflineErrorMessage(feature: string): string {
  return `Funcionalidade "${feature}" não disponível em modo offline. Desabilite VITE_OFFLINE_MODE para usar esta feature.`;
}

/**
 * Hook para verificar se deve usar mock data
 */
export function shouldUseMockData(): boolean {
  return isOfflineMode || !import.meta.env.VITE_SUPABASE_URL;
}

