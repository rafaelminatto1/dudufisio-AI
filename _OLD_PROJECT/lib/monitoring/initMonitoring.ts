/**
 * Inicialização do Sistema de Monitoramento
 * 
 * Configura Sentry, métricas e outros serviços de observabilidade
 */

import { initSentry, setSentryUser } from './sentryConfig';
import { cleanupOldMetrics } from './errorMetrics';
import type { User } from '../../types';

/**
 * Inicializa todos os sistemas de monitoramento
 */
export function initMonitoring() {
  console.log('🔍 Inicializando sistema de monitoramento...');

  // 1. Inicializar Sentry
  initSentry();

  // 2. Limpar métricas antigas (> 7 dias)
  cleanupOldMetrics(7);

  // 3. Configurar listeners globais
  setupGlobalErrorListeners();

  console.log('✅ Sistema de monitoramento inicializado');
}

/**
 * Configura listeners globais para capturar erros não tratados
 */
function setupGlobalErrorListeners() {
  // Erros não capturados
  window.addEventListener('error', (event) => {
    console.error('❌ Erro não capturado:', event.error);
    
    // Prevenir que o erro seja exibido no console novamente
    event.preventDefault();
  });

  // Promises rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejeitada não tratada:', event.reason);
    
    // Prevenir que o erro seja exibido no console novamente
    event.preventDefault();
  });
}

/**
 * Configura usuário no monitoramento
 */
export function setMonitoringUser(user: User) {
  setSentryUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role,
  });
}

/**
 * Limpa usuário do monitoramento (logout)
 */
export function clearMonitoringUser() {
  // Implementar quando necessário
}

export default {
  init: initMonitoring,
  setUser: setMonitoringUser,
  clearUser: clearMonitoringUser,
};

