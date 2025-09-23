import React, { useState, lazy, Suspense } from 'react';
import {
    LayoutGrid, Users, Activity, DollarSign, LogOut, Stethoscope
} from 'lucide-react';

// Lazy load partner portal pages
const EducatorDashboardPage = lazy(() => import('./partner-portal/EducatorDashboardPage'));
const ClientListPage = lazy(() => import('./partner-portal/ClientListPage'));
const PartnerExerciseLibraryPage = lazy(() => import('./partner-portal/PartnerExerciseLibraryPage'));
const FinancialsPage = lazy(() => import('./partner-portal/FinancialsPage'));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
);

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
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">Portal do Parceiro</h1>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                            <Stethoscope className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Bem-vindo ao portal do parceiro</h3>
                            <p className="text-slate-600">Gerencie seus clientes, exercícios e acompanhe o financeiro</p>
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
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                currentPage === item.id
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{item.label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 shadow-sm">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center">
                            <Stethoscope className="w-8 h-8 text-indigo-500" />
                            <h1 className="text-xl font-bold text-slate-900 ml-2">
                                Dudu<span className="text-indigo-500">Fisio</span>
                            </h1>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Portal do Parceiro</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="space-y-1">
                            <h3 className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                Principal
                            </h3>
                            {menuItems.map((item) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* User Section */}
                    <div className="border-t border-slate-200 p-3">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">Educador Físico</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
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
    );
};

export default PartnerPortalDashboard;