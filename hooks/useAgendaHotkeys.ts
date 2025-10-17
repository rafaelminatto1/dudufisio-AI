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
  enabled?: boolean;
}

/**
 * Hook para gerenciar atalhos de teclado na página de Agenda
 * 
 * Atalhos disponíveis:
 * - N: Novo agendamento
 * - F: Focar busca
 * - T: Ir para hoje
 * - ←: Período anterior
 * - →: Próximo período
 * - Esc: Fechar modais
 * - /: Toggle filtros
 * - W: Ver lista de espera
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

      // / - Toggle filtros
      if (event.key === '/' && !event.shiftKey) {
        event.preventDefault();
        onToggleFilters?.();
        return;
      }

      // W - Ver lista de espera
      if (event.key === 'w' || event.key === 'W') {
        event.preventDefault();
        onViewWaitlist?.();
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
    onViewWaitlist
  ]);
};

