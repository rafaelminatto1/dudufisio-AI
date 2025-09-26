import React, { useState, lazy, Suspense } from 'react';
import Layout from '../components/Layout';

// Lazy load all pages for better performance
const AgendaPage = lazy(() => import('./AgendaPage'));
const PatientListPage = lazy(() => import('./PatientListPage'));
const PatientDetailPage = lazy(() => import('./PatientDetailPage'));
const SessionPage = lazy(() => import('./SessionPage'));
const SessionFormPage = lazy(() => import('./SessionFormPage'));
const AtendimentoPage = lazy(() => import('./AtendimentoPage'));
const FinancialDashboardPage = lazy(() => import('./FinancialDashboardPage'));
const ExerciseLibraryPage = lazy(() => import('./ExerciseLibraryPage'));
const ReportsPage = lazy(() => import('./ReportsPage'));
const SpecialtyAssessmentsPage = lazy(() => import('./SpecialtyAssessmentsPage'));
const AcompanhamentoPage = lazy(() => import('./AcompanhamentoPage'));
const IntegrationsTestPage = lazy(() => import('./IntegrationsTestPage'));
const BIIntegrationTestPage = lazy(() => import('./BIIntegrationTestPage'));
import {
    Calendar, Users, Activity, BarChart3,
    Download, RefreshCw,
    Star
} from 'lucide-react';

// Loading component for lazy pages
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
);

// StatCard component for dashboard - memoized for performance
const StatCard = React.memo(({ icon: Icon, title, value, change, changeType }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center">
            <div className="p-3 bg-sky-100 rounded-lg">
                <Icon className="w-6 h-6 text-sky-600" />
            </div>
            <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-slate-600'}`}>
                    {change}
                </p>
            </div>
        </div>
    </div>
));

const DashboardContent = () => {
    const [timeframe, setTimeframe] = useState('today');

    const stats = [
        { icon: Calendar, title: 'Consultas Hoje', value: '12', change: '+2 vs ontem', changeType: 'positive' },
        { icon: Users, title: 'Pacientes Ativos', value: '156', change: '+8 esta semana', changeType: 'positive' },
        { icon: Activity, title: 'Sessões Concluídas', value: '8', change: '67% da meta', changeType: 'neutral' },
        { icon: BarChart3, title: 'Taxa de Sucesso', value: '94%', change: '+3% vs mês passado', changeType: 'positive' }
    ];

    const todayAppointments = [
        { patient: 'Ana Silva', treatment: 'Fisioterapia - Joelho', time: '09:00', status: 'confirmed' },
        { patient: 'Carlos Santos', treatment: 'Reabilitação - Ombro', time: '10:30', status: 'confirmed' },
        { patient: 'Maria Oliveira', treatment: 'Avaliação Inicial', time: '14:00', status: 'pending' },
        { patient: 'João Costa', treatment: 'Pilates Terapêutico', time: '15:30', status: 'confirmed' },
        { patient: 'Lucia Ferreira', treatment: 'Massoterapia', time: '16:00', status: 'confirmed' }
    ];

    const recentPatients = [
        { name: 'Ana Silva', condition: 'Lesão no Joelho', age: 32, phone: '(11) 99999-1234', rating: 5 },
        { name: 'Carlos Santos', condition: 'Bursite no Ombro', age: 45, phone: '(11) 99999-5678', rating: 4 },
        { name: 'Maria Oliveira', condition: 'Hérnia de Disco', age: 38, phone: '(11) 99999-9012', rating: 5 },
        { name: 'João Costa', condition: 'Escoliose', age: 28, phone: '(11) 99999-3456', rating: 4 }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Visão geral das atividades da clínica</p>
                </div>
                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                        <option value="today">Hoje</option>
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mês</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        <span>Atualizar</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Receita Mensal</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500">Gráfico de receita será exibido aqui</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Estatísticas Rápidas</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Receita do Mês</span>
                            <span className="font-semibold text-green-600">R$ 24.500</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Novos Pacientes</span>
                            <span className="font-semibold text-blue-600">18</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Taxa de Retorno</span>
                            <span className="font-semibold text-purple-600">87%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Avaliação Média</span>
                            <span className="font-semibold text-yellow-600">4.8/5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Consultas de Hoje</h3>
                        <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">Ver todas</button>
                    </div>
                    <div className="space-y-3">
                        {todayAppointments.slice(0, 4).map((appointment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium text-slate-900">{appointment.patient}</h4>
                                    <p className="text-sm text-slate-600">{appointment.treatment}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-900">{appointment.time}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        appointment.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Pacientes Recentes</h3>
                        <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">Ver todos</button>
                    </div>
                    <div className="space-y-3">
                        {recentPatients.map((patient, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                                    <span className="text-sky-600 font-semibold text-sm">
                                        {patient.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-slate-900">{patient.name}</h4>
                                    <p className="text-sm text-slate-600">{patient.condition}</p>
                                </div>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < patient.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface CompleteDashboardProps {
    user: any;
    onLogout: () => void;
}

const CompleteDashboard: React.FC<CompleteDashboardProps> = ({ user, onLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Expose the setCurrentPage function globally for navigation
    React.useEffect(() => {
        (window as any).__setCurrentPage = setCurrentPage;
        return () => {
            delete (window as any).__setCurrentPage;
        };
    }, []);

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardContent />;
            case 'appointments':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <AgendaPage />
                    </Suspense>
                );
            case 'patients':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <PatientListPage />
                    </Suspense>
                );
            case 'patient-detail':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <PatientDetailPage />
                    </Suspense>
                );
            case 'session':
                const appointmentId = (window as any).__selectedAppointmentId;
                if (!appointmentId) {
                    setCurrentPage('appointments');
                    return null;
                }
                return (
                    <SessionPage
                        appointmentId={appointmentId}
                        onClose={() => {
                            delete (window as any).__selectedAppointmentId;
                            setCurrentPage('appointments');
                        }}
                    />
                );
            case 'session-form':
                const sessionFormAppointmentId = (window as any).__selectedAppointmentId;
                if (!sessionFormAppointmentId) {
                    setCurrentPage('appointments');
                    return null;
                }
                return (
                    <SessionFormPage
                        appointmentId={sessionFormAppointmentId}
                        onClose={() => {
                            delete (window as any).__selectedAppointmentId;
                            setCurrentPage('appointments');
                        }}
                    />
                );
            case 'atendimento':
                const atendimentoId = (window as any).__selectedAppointmentId;
                if (!atendimentoId) {
                    setCurrentPage('appointments');
                    return null;
                }
                return (
                    <Suspense fallback={<PageLoader />}>
                        <AtendimentoPage />
                    </Suspense>
                );
            case 'exercises':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <ExerciseLibraryPage />
                    </Suspense>
                );
            case 'treatments':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <AcompanhamentoPage />
                    </Suspense>
                );
            case 'reports':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <ReportsPage />
                    </Suspense>
                );
            case 'financial':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <FinancialDashboardPage />
                    </Suspense>
                );
            case 'evaluations':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <SpecialtyAssessmentsPage />
                    </Suspense>
                );
            case 'integrations':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <IntegrationsTestPage />
                    </Suspense>
                );
            case 'bi-test':
                return (
                    <Suspense fallback={<PageLoader />}>
                        <BIIntegrationTestPage />
                    </Suspense>
                );
            default:
                return (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">Em Desenvolvimento</h1>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                            <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Módulo em Desenvolvimento</h3>
                            <p className="text-slate-600">Esta funcionalidade será implementada em breve</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Layout
            user={user}
            onLogout={onLogout}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
        >
            {renderContent()}
        </Layout>
    );
};

export default CompleteDashboard;