import { useEffect } from 'react';

export interface AgendaHotkeysConfig {
  onNewAppointment?: () => void;
  onSearch?: () => void;
  onToday?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onCloseModal?: () => void;
  onToggleFilters?: () => void;
  onViewWaitlist?: () => void;
  onManageBlocks?: () => void;
  onShowHelp?: () => void;
  onViewChange?: (view: 'daily' | 'weekly' | 'monthly' | 'list') => void;
  enabled?: boolean;
}

/**
 * Hook para gerenciar atalhos de teclado na página de Agenda
 * 
 * Atalhos disponíveis:
 * - N: Novo agendamento
 * - F ou /: Focar busca
 * - T: Ir para hoje
 * - ←: Período anterior
 * - →: Próximo período
 * - Esc: Fechar modais
 * - W: Ver lista de espera
 * - B: Gerenciar bloqueios
 * - 1-4: Alternar visualizações (diária, semanal, mensal, lista)
 * - ?: Mostrar ajuda de atalhos
 */
export const useAgendaHotkeys = ({
  onNewAppointment,
  onSearch,
  onToday,
  onPrevious,
  onNext,
  onCloseModal,
  onToggleFilters,
  onViewWaitlist,
  onManageBlocks,
  onShowHelp,
  onViewChange,
  enabled = true
}: AgendaHotkeysConfig) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // N - Novo agendamento
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        onNewAppointment?.();
        return;
      }

      // F - Focar busca
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        onSearch?.();
        return;
      }

      // T - Ir para hoje
      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        onToday?.();
        return;
      }

      // ← - Período anterior
      if (event.key === 'ArrowLeft' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        onPrevious?.();
        return;
      }

      // → - Próximo período
      if (event.key === 'ArrowRight' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        onNext?.();
        return;
      }

      // Esc - Fechar modais
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseModal?.();
        return;
      }

      // / - Focar busca
      if (event.key === '/' && !event.shiftKey) {
        event.preventDefault();
        onSearch?.();
        return;
      }

      // W - Ver lista de espera
      if (event.key === 'w' || event.key === 'W') {
        event.preventDefault();
        onViewWaitlist?.();
        return;
      }

      // B - Gerenciar bloqueios
      if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        onManageBlocks?.();
        return;
      }

      // ? - Mostrar ajuda
      if (event.key === '?') {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      // 1-4 - Alternar visualizações
      if (event.key >= '1' && event.key <= '4') {
        event.preventDefault();
        const views = ['daily', 'weekly', 'monthly', 'list'] as const;
        const viewIndex = parseInt(event.key) - 1;
        onViewChange?.(views[viewIndex]);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    onNewAppointment,
    onSearch,
    onToday,
    onPrevious,
    onNext,
    onCloseModal,
    onToggleFilters,
    onViewWaitlist,
    onManageBlocks,
    onShowHelp,
    onViewChange
  ]);
};

