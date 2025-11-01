/**
 * 🧪 Testes Unitários - UnifiedOfflineIndicator
 * 
 * Testa o componente unificado de indicação offline.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import UnifiedOfflineIndicator from '../../../components/offline/UnifiedOfflineIndicator';
import type { OfflineContextType } from '../../../contexts/SafeOfflineContext';

// Mock do SafeOfflineContext
const mockUseSafeOffline = vi.fn<[], OfflineContextType>();

vi.mock('../../../contexts/SafeOfflineContext', () => ({
  useSafeOffline: () => mockUseSafeOffline(),
}));

// Mock do framer-motion para evitar erros de animação
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('UnifiedOfflineIndicator', () => {
  const defaultMockContext: OfflineContextType = {
    isOnline: true,
    isSyncing: false,
    queueSize: 0,
    pendingCount: 0,
    failedCount: 0,
    queueItems: [],
    sync: vi.fn().mockResolvedValue(undefined),
    retryFailed: vi.fn().mockResolvedValue(undefined),
    clearQueue: vi.fn().mockResolvedValue(undefined),
    hasError: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSafeOffline.mockReturnValue(defaultMockContext);
  });

  it('não deve renderizar quando online e sem itens pendentes', () => {
    const { container } = render(<UnifiedOfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar indicador offline quando desconectado', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: false,
    });

    render(<UnifiedOfflineIndicator />);

    expect(screen.getByText('Você está offline')).toBeInTheDocument();
    expect(screen.getByText(/Suas alterações serão sincronizadas/)).toBeInTheDocument();
  });

  it('deve mostrar contador de itens pendentes quando offline', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: false,
      queueSize: 3,
    });

    render(<UnifiedOfflineIndicator showSyncDetails />);

    expect(screen.getByText(/3 itens pendentes/)).toBeInTheDocument();
  });

  it('deve mostrar indicador de sincronização quando há itens pendentes online', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: true,
      pendingCount: 2,
    });

    render(<UnifiedOfflineIndicator />);

    expect(screen.getByText('Itens pendentes')).toBeInTheDocument();
    expect(screen.getByText(/2 pendentes/)).toBeInTheDocument();
  });

  it('deve mostrar indicador de falha quando há itens falhos', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: true,
      failedCount: 1,
      pendingCount: 0,
    });

    render(<UnifiedOfflineIndicator />);

    expect(screen.getByText('Falha na sincronização')).toBeInTheDocument();
    expect(screen.getByText(/1 falhou/)).toBeInTheDocument();
  });

  it('deve chamar sync quando botão Sincronizar é clicado', async () => {
    const mockSync = vi.fn().mockResolvedValue(undefined);
    
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: true,
      pendingCount: 2,
      sync: mockSync,
    });

    const user = userEvent.setup();
    render(<UnifiedOfflineIndicator />);

    const syncButton = screen.getByRole('button', { name: /Sincronizar/i });
    await user.click(syncButton);

    await waitFor(() => {
      expect(mockSync).toHaveBeenCalled();
    });
  });

  it('deve chamar retryFailed quando botão Retentar é clicado', async () => {
    const mockRetryFailed = vi.fn().mockResolvedValue(undefined);
    
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: true,
      failedCount: 1,
      retryFailed: mockRetryFailed,
    });

    const user = userEvent.setup();
    render(<UnifiedOfflineIndicator />);

    const retryButton = screen.getByRole('button', { name: /Retentar/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockRetryFailed).toHaveBeenCalled();
    });
  });

  it('deve ocultar notificação quando botão dispensar é clicado', async () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: false,
    });

    const user = userEvent.setup();
    render(<UnifiedOfflineIndicator />);

    expect(screen.getByText('Você está offline')).toBeInTheDocument();

    const dismissButton = screen.getByRole('button', { name: /Dispensar/i });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('Você está offline')).not.toBeInTheDocument();
    });
  });

  it('deve ter roles ARIA corretos para acessibilidade', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: false,
    });

    const { container } = render(<UnifiedOfflineIndicator />);

    // Container principal
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveAttribute('role', 'status');
    expect(mainContainer).toHaveAttribute('aria-live', 'polite');
    expect(mainContainer).toHaveAttribute('aria-atomic', 'true');

    // Card de offline deve ter role alert
    const offlineCard = screen.getByText('Você está offline').closest('[role="alert"]');
    expect(offlineCard).toBeInTheDocument();
  });

  it('deve respeitar diferentes posições configuradas', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: false,
    });

    const { container, rerender } = render(
      <UnifiedOfflineIndicator position="top-left" />
    );

    let mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('top-4 left-4');

    rerender(<UnifiedOfflineIndicator position="bottom-right" />);
    mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('bottom-4 right-4');

    rerender(<UnifiedOfflineIndicator position="top-center" />);
    mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('top-4 left-1/2');
  });

  it('deve mostrar spinner quando está sincronizando', () => {
    mockUseSafeOffline.mockReturnValue({
      ...defaultMockContext,
      isOnline: true,
      isSyncing: true,
      pendingCount: 1,
    });

    render(<UnifiedOfflineIndicator />);

    // Verificar que RefreshCw com spin está presente
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

