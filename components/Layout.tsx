import React, { useState } from 'react';
import {
    LayoutGrid, Users, Calendar, Stethoscope, ChevronLeft, ChevronRight, BarChart3,
    LogOut, Bell, User, Menu, X, Activity, DollarSign, ClipboardList
} from 'lucide-react';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, currentPage = 'dashboard', onPageChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', group: 'main' },
        { id: 'appointments', icon: Calendar, label: 'Agenda', group: 'main' },
        { id: 'patients', icon: Users, label: 'Pacientes', group: 'main' },
        { id: 'exercises', icon: Activity, label: 'Exercícios', group: 'clinical' },
        { id: 'treatments', icon: Stethoscope, label: 'Tratamentos', group: 'clinical' },
        { id: 'reports', icon: BarChart3, label: 'Relatórios', group: 'management' },
        { id: 'financial', icon: DollarSign, label: 'Financeiro', group: 'management' },
        { id: 'evaluations', icon: ClipboardList, label: 'Avaliações', group: 'clinical' },
        { id: 'integrations', icon: Bell, label: 'Integrações', group: 'management' },
    ];

    const NavLink = ({ item }: { item: any }) => (
        <button
            onClick={() => {
                onPageChange?.(item.id);
                setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center p-2.5 rounded-lg transition-colors duration-200 ${
                currentPage === item.id
                    ? 'bg-sky-50 text-sky-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : undefined}
        >
            <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-sm text-left">{item.label}</span>}
        </button>
    );

    const groupItems = (items: any[], group: string) => items.filter(item => item.group === group);

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className={`bg-white border-r border-slate-200 transition-all duration-300 ${
                isCollapsed ? 'w-16' : 'w-64'
            } hidden lg:block`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold text-slate-900">
                                Fisio<span className="text-sky-500">Flow</span>
                            </h1>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            ) : (
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        {/* Main */}
                        <div className="space-y-1">
                            {!isCollapsed && (
                                <h3 className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                    Principal
                                </h3>
                            )}
                            {groupItems(menuItems, 'main').map((item) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Clinical */}
                        <div className="mt-6 space-y-1">
                            {!isCollapsed && (
                                <h3 className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                    Clínico
                                </h3>
                            )}
                            {groupItems(menuItems, 'clinical').map((item) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Management */}
                        <div className="mt-6 space-y-1">
                            {!isCollapsed && (
                                <h3 className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                    Gestão
                                </h3>
                            )}
                            {groupItems(menuItems, 'management').map((item) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* User Section */}
                    <div className="border-t border-slate-200 p-3">
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-sky-600" />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.role}</p>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <button
                                    onClick={onLogout}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Sair"
                                >
                                    <LogOut className="w-4 h-4 text-slate-500" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        <div className="py-4 px-3">
                            {menuItems.map((item) => (
                                <NavLink key={item.id} item={item} />
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
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">
                            Fisio<span className="text-sky-500">Flow</span>
                        </h1>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <Bell className="w-5 h-5 text-slate-600" />
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;