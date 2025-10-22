/**
 * Configuração para Sistema de Evolução de Sessão
 * Permite alternar entre as 3 opções de implementação
 */

export type SessionEvolutionMode = 'page' | 'modal' | 'expanded' | 'existing';

interface SessionEvolutionConfig {
  // Modo de implementação ativo
  mode: SessionEvolutionMode;
  
  // Rota para navegação
  route: string;
  
  // Configurações de UI
  showMandatoryAlerts: boolean;
  showGoalsPanel: boolean;
  showSurgeryTimeline: boolean;
  showEvolutionCharts: boolean;
  showMedicalInsights: boolean;
  
  // Configurações de comportamento
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // segundos
  blockSaveOnCriticalAlerts: boolean;
}

/**
 * Configuração padrão
 * Para alternar entre as opções, basta mudar o 'mode'
 * 
 * Opções disponíveis:
 * - 'page': Nova página fullscreen (SessionEvolutionPage.tsx)
 * - 'modal': Modal fullscreen (SessionEvolutionModal.tsx)
 * - 'expanded': Expansão da SessionFormPage (SessionFormPageExpanded.tsx)
 * - 'existing': Usa a AtendimentoPage.tsx existente (padrão atual)
 */
export const sessionEvolutionConfig: SessionEvolutionConfig = {
  // ⚙️ ESCOLHA A OPÇÃO AQUI:
  // 'page' | 'modal' | 'expanded' | 'existing'
  mode: 'existing', // Padrão: usa a página existente
  
  // Rota baseada no modo
  route: '/atendimento', // Será concatenado com /:appointmentId
  
  // Features ativadas
  showMandatoryAlerts: true,
  showGoalsPanel: true,
  showSurgeryTimeline: true,
  showEvolutionCharts: true,
  showMedicalInsights: true,
  
  // Comportamento
  autoSaveEnabled: true,
  autoSaveInterval: 30, // 30 segundos
  blockSaveOnCriticalAlerts: true,
};

/**
 * Helper para alternar entre modos
 */
export function setSessionEvolutionMode(mode: SessionEvolutionMode): void {
  sessionEvolutionConfig.mode = mode;
  console.log(`✅ Modo de evolução alterado para: ${mode}`);
}

/**
 * Helper para obter rota completa
 */
export function getSessionRoute(appointmentId: string): string {
  return `${sessionEvolutionConfig.route}/${appointmentId}`;
}

/**
 * Instruções de uso:
 * 
 * Para testar cada opção de implementação:
 * 
 * 1. OPÇÃO 1 - Página Nova:
 *    setSessionEvolutionMode('page');
 *    - Usa: SessionEvolutionPage.tsx
 *    - Rota: /atendimento/:appointmentId
 *    - Layout: 4 colunas fullscreen
 *    - Navegação: botão voltar
 * 
 * 2. OPÇÃO 2 - Modal Fullscreen:
 *    setSessionEvolutionMode('modal');
 *    - Usa: SessionEvolutionModal.tsx
 *    - Abre: modal sobre a agenda
 *    - Layout: 4 colunas em modal
 *    - Fechamento: X ou ESC
 * 
 * 3. OPÇÃO 3 - Expansão:
 *    setSessionEvolutionMode('expanded');
 *    - Usa: SessionFormPageExpanded.tsx
 *    - Integração: com SessionFormPage existente
 *    - Layout: 4 colunas adaptado
 * 
 * 4. EXISTING - Página Atual (padrão):
 *    setSessionEvolutionMode('existing');
 *    - Usa: AtendimentoPage.tsx (página atual robusta)
 *    - Mantém: funcionalidade atual
 */

export default sessionEvolutionConfig;

