import React, { memo, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import SkipToContent from './ui/SkipToContent';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();

    // Detectar tamanho da tela
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fechar sidebar ao mudar de rota em mobile
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    // Controlar overflow do body quando sidebar está aberta
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

    return (
        <div className="flex h-screen bg-fisio-neutral-50 overflow-hidden">
            {/* Skip Links para acessibilidade */}
            <SkipToContent />
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-fisio-primary-DEFAULT focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold transition-all"
            >
                Pular para conteúdo principal
            </a>
            <a 
                href="#sidebar-navigation" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-[100] focus:px-4 focus:py-2 focus:bg-fisio-secondary-DEFAULT focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold transition-all"
            >
                Pular para navegação
            </a>

            {/* Overlay para mobile quando sidebar está aberta */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - Responsiva */}
            <div
                id="navigation"
                className={`
                    ${isMobile
                        ? `fixed left-0 top-0 bottom-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
                           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : 'relative'
                    }
                    bg-white border-r border-fisio-neutral-200 flex flex-col shadow-lg
                `}
            >
                <Sidebar />
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Navbar Superior - Apenas em mobile/tablet */}
                {(isMobile || isTablet) && (
                    <header className="bg-white border-b border-fisio-neutral-200 h-16 flex items-center px-4 shadow-sm">
                        <div className="flex items-center justify-between w-full">
                            {/* Menu Hambúrguer */}
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors focus-ring"
                                aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                            >
                                <Menu className="w-5 h-5 text-fisio-neutral-700" />
                            </button>

                            {/* Logo */}
                            <div className="flex items-center">
                                <span className="text-lg font-bold">
                                    <span className="text-fisio-neutral-800">Fisio</span>
                                    <span className="text-fisio-primary-DEFAULT">Flow</span>
                                </span>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center space-x-2">
                                <button 
                                    className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors"
                                    aria-label="Notificações"
                                >
                                    <Bell className="w-5 h-5 text-fisio-neutral-700" />
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors"
                                    aria-label="Sair do sistema"
                                >
                                    <LogOut className="w-5 h-5 text-fisio-neutral-700" />
                                </button>
                            </div>
                        </div>
                    </header>
                )}

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

                {/* Bottom Navigation - Apenas em mobile */}
                {isMobile && (
                    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-fisio-neutral-200 shadow-lg">
                        <div className="flex items-center justify-around h-16 px-2">
                            <button className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-fisio-primary-DEFAULT">
                                <span className="text-xs font-medium">Dashboard</span>
                            </button>
                            <button className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-fisio-neutral-500">
                                <span className="text-xs font-medium">Agenda</span>
                            </button>
                            <button className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-fisio-neutral-500">
                                <span className="text-xs font-medium">Pacientes</span>
                            </button>
                            <button className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-fisio-neutral-500">
                                <span className="text-xs font-medium">Mais</span>
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default memo(Layout);
