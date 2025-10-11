import React, { useState, useCallback, memo, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutGrid, Users, Calendar, Stethoscope, ChevronLeft, ChevronRight, BarChart3,
    LogOut, Bell, User, Menu, X, Activity, DollarSign, ClipboardList
} from 'lucide-react';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import SkipToContent from './ui/SkipToContent';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

type MenuGroup = 'main' | 'clinical' | 'management';

interface MenuItem {
  id: string;
  path: string;
  icon: typeof LayoutGrid;
  label: string;
  group: MenuGroup;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
    console.log('🔍 [LAYOUT] Componente renderizando:', {
        hasUser: !!user,
        userId: user?.id,
        userRole: user?.role
    });
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const menuItems: MenuItem[] = useMemo(() => [
        { id: 'dashboard', path: '/dashboard', icon: LayoutGrid, label: 'Dashboard', group: 'main' },
        { id: 'appointments', path: '/agenda', icon: Calendar, label: 'Agenda', group: 'main' },
        { id: 'patients', path: '/patients', icon: Users, label: 'Pacientes', group: 'main' },
        { id: 'exercises', path: '/exercises', icon: Activity, label: 'Exercícios', group: 'clinical' },
        { id: 'treatments', path: '/treatments', icon: Stethoscope, label: 'Tratamentos', group: 'clinical' },
        { id: 'reports', path: '/reports', icon: BarChart3, label: 'Relatórios', group: 'management' },
        { id: 'financial', path: '/financial', icon: DollarSign, label: 'Financeiro', group: 'management' },
        { id: 'evaluations', path: '/evaluations', icon: ClipboardList, label: 'Avaliações', group: 'clinical' },
        { id: 'integrations', path: '/integrations', icon: Bell, label: 'Integrações', group: 'management' },
    ], []);

    const isItemActive = useCallback((path: string) => {
        if (path === '/') {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    }, [location.pathname]);

    const NavItem = memo(({ item }: { item: MenuItem }) => (
        <NavLink
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            end={item.path === '/dashboard'}
            className={({ isActive }) => {
                const active = isActive || isItemActive(item.path);
                return `w-full flex items-center p-2.5 rounded-lg transition-colors duration-200 ${
                    active
                        ? 'bg-sky-50 text-sky-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`;
            }}
            title={isCollapsed ? item.label : undefined}
        >
            <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-sm text-left">{item.label}</span>}
        </NavLink>
    ));

    const groupItems = useCallback((items: any[], group: string) => items.filter(item => item.group === group), []);

    return (
        <div className="flex h-screen bg-slate-50">
            <SkipToContent />
            
            {/* Sidebar */}
            <Sidebar />

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h1 className="text-xl font-bold text-slate-900">
                                Fisio<span className="text-sky-500">Flow</span>
                            </h1>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Fechar menu"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        <div className="py-4 px-3">
                            {menuItems.map((item) => (
                                <NavItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            aria-label="Abrir menu de navegação"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">
                            Fisio<span className="text-sky-500">Flow</span>
                        </h1>
                        <div className="flex items-center space-x-2">
                            <button 
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Notificações"
                            >
                                <Bell className="w-5 h-5 text-slate-600" />
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Sair do sistema"
                            >
                                <LogOut className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main 
                    id="main-content"
                    className="flex-1 overflow-y-auto bg-slate-50" 
                    data-testid="main-content"
                    role="main"
                    aria-label="Conteúdo principal"
                >
                    <div className="p-6">
                        <Breadcrumbs />
                    {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default memo(Layout);
