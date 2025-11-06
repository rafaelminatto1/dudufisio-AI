import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarV2 } from '../navigation/SidebarV2';
import { NavBreadcrumb } from '../navigation/NavBreadcrumb';
import BottomNavigation from './BottomNavigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
    throw new Error('useLayoutContext must be used within ResponsiveLayoutV2');
  }
  return context;
};

interface ResponsiveLayoutV2Props {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

const ResponsiveLayoutV2: React.FC<ResponsiveLayoutV2Props> = ({
  user,
  onLogout,
  children,
}) => {
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
    setIsSidebarOpen((prev) => !prev);
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
      <div className="flex h-screen overflow-hidden bg-neutral-bg">
        {/* Desktop Sidebar */}
        {isDesktop && <SidebarV2 />}

        {/* Mobile Sidebar (Drawer) */}
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarV2 />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <header className="sticky top-0 z-40 flex h-16 items-center gap-md border-b border-neutral-border bg-white px-md shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  Mooca<span className="text-primary">Fisio</span>
                </span>
              </div>
            </header>
          )}

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
              {/* Breadcrumb */}
              <NavBreadcrumb />

              {/* Page Content */}
              {children}
            </div>
          </main>

          {/* Bottom Navigation (Mobile only) */}
          {isMobile && <BottomNavigation />}
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default ResponsiveLayoutV2;

