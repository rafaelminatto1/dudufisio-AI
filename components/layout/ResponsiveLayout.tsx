import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ResponsiveSidebar from './ResponsiveSidebar';
import BottomNavigation from './BottomNavigation';
import Navbar from './Navbar';
import Breadcrumbs from '../Breadcrumbs';

// Context para gerenciar o estado do layout
interface LayoutContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within ResponsiveLayout');
  }
  return context;
};

interface ResponsiveLayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const location = useLocation();

  // Breakpoints para responsividade
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Atualizar largura da janela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fechar sidebar ao mudar de rota em mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Gerenciar overflow do body quando sidebar está aberta em mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const contextValue: LayoutContextType = {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobile,
    isTablet,
    isDesktop,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="flex h-screen bg-fisio-neutral-50 overflow-hidden">
        {/* Overlay para mobile quando sidebar está aberta */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Responsiva */}
        <ResponsiveSidebar
          user={user}
          onLogout={onLogout}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Navbar Superior */}
          <Navbar
            user={user}
            onLogout={onLogout}
            onMenuClick={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />

          {/* Área de Conteúdo */}
          <main 
            className={`
              flex-1 overflow-y-auto bg-fisio-neutral-50
              ${isMobile ? 'pb-16' : ''}
            `}
            id="main-content"
            role="main"
            aria-label="Conteúdo principal"
          >
            <div className="container-mobile py-4 md:py-6">
              {/* Breadcrumbs apenas em desktop */}
              {!isMobile && (
                <div className="mb-4">
                  <Breadcrumbs />
                </div>
              )}
              
              {/* Conteúdo da Página */}
              <div className="transition-responsive">
                {children}
              </div>
            </div>
          </main>

          {/* Bottom Navigation para Mobile */}
          {isMobile && (
            <BottomNavigation user={user} />
          )}
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default ResponsiveLayout;