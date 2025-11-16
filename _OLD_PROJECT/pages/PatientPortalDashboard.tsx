import React, { useState, Suspense } from 'react';
import {
    Home, Calendar, Dumbbell, FileText, TrendingUp, Gift,
    Target, Award, Settings, LogOut, Users, MessageSquare
} from 'lucide-react';
import { createLazyComponent } from '../lib/lazyLoading';
import ErrorBoundary from '../components/ErrorBoundary';
import { PageSkeleton } from '../components/ui/PageSkeleton';

// ✅ Lazy load patient portal pages usando createLazyComponent centralizado
const PatientDashboardPage = createLazyComponent(() => import('./patient-portal/PatientDashboardPage'));
const MyAppointmentsPage = createLazyComponent(() => import('./patient-portal/MyAppointmentsPage'));
const MyExercisesPage = createLazyComponent(() => import('./patient-portal/MyExercisesPage'));
const DocumentsPage = createLazyComponent(() => import('./patient-portal/DocumentsPage'));
const PatientProgressPage = createLazyComponent(() => import('./patient-portal/PatientProgressPage'));
const MyVouchersPage = createLazyComponent(() => import('./patient-portal/MyVouchersPage'));
const VoucherStorePage = createLazyComponent(() => import('./patient-portal/VoucherStorePage'));
const GamificationPage = createLazyComponent(() => import('./patient-portal/GamificationPage'));
const PatientPainDiaryPage = createLazyComponent(() => import('./patient-portal/PatientPainDiaryPage'));
const MessagesPage = createLazyComponent(() => import('./patient-portal/MessagesPage'));

// Loading component
const PageLoader = () => <PageSkeleton />;

interface PatientPortalDashboardProps {
    user: any;
    onLogout: () => void;
}

const PatientPortalDashboard: React.FC<PatientPortalDashboardProps> = ({ user, onLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'Início', group: 'main' },
        { id: 'appointments', icon: Calendar, label: 'Consultas', group: 'main' },
        { id: 'messages', icon: MessageSquare, label: 'Mensagens', group: 'main' },
        { id: 'exercises', icon: Dumbbell, label: 'Exercícios', group: 'main' },
        { id: 'pain-diary', icon: FileText, label: 'Diário da Dor', group: 'health' },
        { id: 'progress', icon: TrendingUp, label: 'Progresso', group: 'health' },
        { id: 'documents', icon: FileText, label: 'Documentos', group: 'health' },
        { id: 'vouchers', icon: Gift, label: 'Meus Vouchers', group: 'store' },
        { id: 'store', icon: Users, label: 'Loja de Vouchers', group: 'store' },
        { id: 'gamification', icon: Award, label: 'Conquistas', group: 'fun' },
    ];

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <PatientDashboardPage />
                    </Suspense>
                );
            case 'appointments':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <MyAppointmentsPage />
                    </Suspense>
                );
            case 'exercises':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <MyExercisesPage />
                    </Suspense>
                );
            case 'pain-diary':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <PatientPainDiaryPage />
                    </Suspense>
                );
            case 'progress':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <PatientProgressPage />
                    </Suspense>
                );
            case 'documents':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <DocumentsPage />
                    </Suspense>
                );
            case 'vouchers':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <MyVouchersPage />
                    </Suspense>
                );
            case 'store':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <VoucherStorePage />
                    </Suspense>
                );
            case 'gamification':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <GamificationPage />
                    </Suspense>
                );
            case 'messages':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <MessagesPage />
                    </Suspense>
                );
            default:
                return (
                    <div className="p-lg">
                        <h1 className="text-2xl font-bold text-neutral-text mb-md">Portal do Paciente</h1>
                        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-xl text-center">
                            <Home className="w-16 h-16 text-neutral-textTertiary mx-auto mb-md" />
                            <h3 className="text-lg font-semibold text-neutral-text mb-sm">Bem-vindo ao seu portal</h3>
                            <p className="text-neutral-textSecondary">Gerencie seus tratamentos, exercícios e acompanhe seu progresso</p>
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
                    ? 'bg-teal-50 text-teal-600 font-semibold'
                    : 'text-neutral-textSecondary hover:bg-neutral-bgDark hover:text-neutral-text'
            }`}
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{item.label}</span>
        </button>
    );

    const groupItems = (items: any[], group: string) => items.filter(item => item.group === group);

    return (
        <ErrorBoundary>
        <div className="flex h-screen bg-gradient-to-br from-teal-50 to-blue-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-neutral-border shadow-card">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-md border-b border-neutral-border">
                        <h1 className="text-xl font-bold text-neutral-text">
                            Dudu<span className="text-teal-500">Fisio</span>
                        </h1>
                        <p className="text-sm text-neutral-textSecondary">Portal do Paciente</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-md px-md">
                        {/* Main */}
                        <div className="space-y-1 mb-xl">
                            <h3 className="px-md py-sm text-xs font-semibold uppercase text-neutral-textTertiary tracking-wider">
                                Principal
                            </h3>
                            {groupItems(menuItems, 'main').map((item: any) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Health */}
                        <div className="space-y-1 mb-xl">
                            <h3 className="px-md py-sm text-xs font-semibold uppercase text-neutral-textTertiary tracking-wider">
                                Saúde
                            </h3>
                            {groupItems(menuItems, 'health').map((item: any) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Store */}
                        <div className="space-y-1 mb-xl">
                            <h3 className="px-md py-sm text-xs font-semibold uppercase text-neutral-textTertiary tracking-wider">
                                Loja
                            </h3>
                            {groupItems(menuItems, 'store').map((item: any) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Fun */}
                        <div className="space-y-1">
                            <h3 className="px-md py-sm text-xs font-semibold uppercase text-neutral-textTertiary tracking-wider">
                                Diversão
                            </h3>
                            {groupItems(menuItems, 'fun').map((item: any) => (
                                <NavLink key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* User Section */}
                    <div className="border-t border-neutral-border p-md">
                        <div className="flex items-center space-x-3 mb-md">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-teal-600 font-semibold">
                                    {(user.fullName || user.name || 'U').split(' ').filter(n => n.length > 0).map((n: string) => n[0].toUpperCase()).join('').slice(0, 2) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-text truncate">{user.fullName || user.name || 'Usuário'}</p>
                                <p className="text-xs text-neutral-textSecondary truncate">Paciente</p>
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

export default PatientPortalDashboard;