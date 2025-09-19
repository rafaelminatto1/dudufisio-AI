import { render, screen } from '@testing-library/react';
import { DashboardPage } from '@/pages/DashboardPage';
import { AgendaPage } from '@/pages/AgendaPage';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('TC019 - Testar responsividade da interface em diferentes dispositivos', () => {
  const mockMatchMedia = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve se ajustar corretamente em dispositivos mobile', () => {
    // Mock: Tela mobile (max-width: 768px)
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(max-width: 768px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    render(<DashboardPage />);

    // Verificar se elementos responsivos estão presentes
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('deve se ajustar corretamente em tablets', () => {
    // Mock: Tela tablet (min-width: 769px, max-width: 1024px)
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(min-width: 769px) and (max-width: 1024px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    render(<AgendaPage />);

    // Verificar layout tablet
    expect(screen.getByTestId('tablet-layout')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('deve se ajustar corretamente em desktop', () => {
    // Mock: Tela desktop (min-width: 1025px)
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(min-width: 1025px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    render(<DashboardPage />);

    // Verificar layout desktop
    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    expect(screen.getByTestId('full-sidebar')).toBeInTheDocument();
  });

  it('deve manter funcionalidade em todas as resoluções', () => {
    // Testar em diferentes breakpoints
    const breakpoints = [
      { media: '(max-width: 480px)', name: 'mobile-small' },
      { media: '(max-width: 768px)', name: 'mobile' },
      { media: '(min-width: 769px) and (max-width: 1024px)', name: 'tablet' },
      { media: '(min-width: 1025px)', name: 'desktop' },
    ];

    breakpoints.forEach(breakpoint => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: breakpoint.media,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      const { container } = render(<DashboardPage />);

      // Verificar se elementos essenciais estão presentes
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Verificar se não há overflow horizontal
      const body = document.body;
      expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth);
    });
  });
});
