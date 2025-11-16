import React, { useState, Suspense } from 'react';
import {
    LayoutGrid, Users, Activity, DollarSign, LogOut, Stethoscope
} from 'lucide-react';
import { createLazyComponent } from '../lib/lazyLoading';
import ErrorBoundary from '../components/ErrorBoundary';
import { PageSkeleton } from '../components/ui/PageSkeleton';

// ✅ Lazy load partner portal pages usando createLazyComponent centralizado
const EducatorDashboardPage = createLazyComponent(() => import('./partner-portal/EducatorDashboardPage'));
const ClientListPage = createLazyComponent(() => import('./partner-portal/ClientListPage'));
const PartnerExerciseLibraryPage = createLazyComponent(() => import('./partner-portal/PartnerExerciseLibraryPage'));
const FinancialsPage = createLazyComponent(() => import('./partner-portal/FinancialsPage'));

// Loading component
const PageLoader = () => <PageSkeleton />;

interface PartnerPortalDashboardProps {
    user: any;
    onLogout: () => void;
}

const PartnerPortalDashboard: React.FC<PartnerPortalDashboardProps> = ({ user, onLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', group: 'main' },
        { id: 'clients', icon: Users, label: 'Meus Clientes', group: 'main' },
        { id: 'exercises', icon: Activity, label: 'Exercícios', group: 'main' },
        { id: 'financials', icon: DollarSign, label: 'Financeiro', group: 'main' },
    ];

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <EducatorDashboardPage />
                    </Suspense>
                );
            case 'clients':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <ClientListPage />
                    </Suspense>
                );
            case 'exercises':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <PartnerExerciseLibraryPage />
                    </Suspense>
                );
            case 'financials':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <FinancialsPage />
                    </Suspense>
                );
            default:
                return (
                    <div className="p-lg">
                        <h1 className="text-2xl font-bold text-neutral-text mb-md">Portal do Parceiro</h1>
                        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-xl text-center">
                            <Stethoscope className="w-16 h-16 text-neutral-textTertiary mx-auto mb-md" />
                            <h3 className="text-lg font-semibold text-neutral-text mb-sm">Bem-vindo ao portal do parceiro</h3>
                            <p className="text-neutral-textSecondary">Gerencie seus clientes, exercícios e acompanhe o financeiro</p>
                        </div>
                    </div>
                );
        }
    };

    const NavLink = ({ item }: { item: any }) => (
        <button
            onClick={() => {
                setCurrentPage(item.id);
                setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center p-md rounded-lg transition-colors duration-200 ${
                currentPage === item.id
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-neutral-textSecondary hover:bg-neutral-bgDark hover:text-neutral-text'
            }`}
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{item.label}</span>
        </button>
    );

    return (
        <ErrorBoundary>
        <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-neutral-border shadow-card">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-md border-b border-neutral-border">
                        <div className="flex items-center">
                            <Stethoscope className="w-8 h-8 text-indigo-500" />
                            <h1 className="text-xl font-bold text-neutral-text ml-sm">
                                Dudu<span className="text-indigo-500">Fisio</span>
                            </h1>
                        </div>
                        <p className="text-sm text-neutral-textSecondary mt-xs">Portal do Parceiro</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-md px-md">
                        <div className="space-y-1">
                            <h3 className="px-md py-sm text-xs font-semibold uppercase text-neutral-textTertiary tracking-wider">
                                Principal
                            </h3>
                            {menuItems.map((item: any) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* User Section */}
                    <div className="border-t border-neutral-border p-md">
                        <div className="flex items-center space-x-3 mb-md">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-text truncate">{user.name}</p>
                                <p className="text-xs text-neutral-textSecondary truncate">Educador Físico</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center p-sm text-neutral-textSecondary hover:text-error hover:bg-error-light rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-sm" />
                            <span className="text-sm">Sair</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
        </ErrorBoundary>
    );
};

export default PartnerPortalDashboard;