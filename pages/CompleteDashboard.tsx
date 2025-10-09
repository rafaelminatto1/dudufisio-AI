import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Calendar, Users, Activity, BarChart3, Download, RefreshCw, Star, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import { PageSkeleton, DashboardSkeleton } from '../components/ui/PageSkeleton';
import { LazyPages, LazyComponents, createLazyComponent } from '../lib/lazyLoading';

// ✅ IMPORTANTE: Todos os lazy imports agora vêm de LazyPages/LazyComponents centralizados
// Isso evita múltiplas instâncias do React e erros "Cannot read properties of null"
import AgendaPage from './AgendaPage';
const PatientListPage = LazyPages.PatientListPage; // ✅ FIX: Usar LazyPages centralizado
const PatientDetailPage = LazyPages.PatientDetailPage; // ✅ FIX: Usar LazyPages centralizado
const PatientEditPage = createLazyComponent(() => import('./PatientEditPage'));
const SessionFormPage = LazyPages.SessionFormPage;
const SessionViewPage = LazyPages.SessionViewPage;
const FinancialPage = LazyPages.FinancialPage;
const FinancialDashboardPage = LazyPages.FinancialDashboardPage; // Alias para compatibilidade
const AdminDashboardPage = LazyPages.AdminDashboardPage; // ✅ FIX: Usar LazyPages centralizado
const ReportsPage = LazyPages.ReportsPage;
const AiAnalyticsPage = LazyPages.AiAnalyticsPage;
const InventoryPage = LazyPages.InventoryPage;
const UserManagementPage = LazyPages.UserManagementPage;
const DashboardPage = LazyPages.DashboardPage;
const TherapistDashboard = LazyPages.TherapistDashboard; // ✅ FIX: Usar LazyPages centralizado

// Páginas que não estão no LazyPages ainda - usando createLazyComponent
const ExerciseLibraryPage = createLazyComponent(() => import('./ExerciseLibraryPage'));
const EnhancedExerciseLibraryPage = createLazyComponent(() => import('./EnhancedExerciseLibraryPage'));
const ExerciseLibraryTestPage = createLazyComponent(() => import('./ExerciseLibraryTestPage'));
const SessionPage = createLazyComponent(() => import('./SessionPage'));
const AtendimentoPage = createLazyComponent(() => import('./AtendimentoPageNew'));
const AtendimentoPageDemo = createLazyComponent(() => import('./AtendimentoPageDemo'));
const SpecialtyAssessmentsPage = createLazyComponent(() => import('./SpecialtyAssessmentsPage'));
const AcompanhamentoPage = createLazyComponent(() => import('./AcompanhamentoPage'));
const TreatmentPage = createLazyComponent(() => import('./TreatmentPage'));
const IntegrationsTestPage = createLazyComponent(() => import('./IntegrationsTestPage'));
const BIIntegrationTestPage = createLazyComponent(() => import('./BIIntegrationTestPage'));
const MentoriaPage = createLazyComponent(() => import('./MentoriaPageNew'));
const TeleconsultaPage = createLazyComponent(() => import('./TeleconsultaPage'));
const AdvancedReportsPage = createLazyComponent(() => import('./AdvancedReportsPage'));
const SimpleDashboard = createLazyComponent(() => import('./SimpleDashboard'));
const PartnerDashboard = createLazyComponent(() => import('./PartnerDashboard'));
const SessionEvolutionPage = createLazyComponent(() => import('./SessionEvolutionPage'));
const EventDetailPage = createLazyComponent(() => import('./EventDetailPage'));
const EventsListPage = createLazyComponent(() => import('./EventsListPage'));
const MaterialDetailPage = createLazyComponent(() => import('./MaterialDetailPage'));
const MaterialsPage = createLazyComponent(() => import('./MaterialsPage'));
const GerarLaudoPage = createLazyComponent(() => import('./GerarLaudoPage'));

// Páginas de Exercícios - Sistema Completo
const ExercisesPage = createLazyComponent(() => import('./ExercisesPage'));
const ExerciseEditPage = createLazyComponent(() => import('./ExerciseEditPage'));

// Páginas de Protocolos - Sistema de Protocolos
const ProtocolsPage = createLazyComponent(() => import('./ProtocolsPage'));
const ProtocolEditPage = createLazyComponent(() => import('./ProtocolEditPage'));

// Páginas de Atribuições e Tracking
const AssignmentsPage = createLazyComponent(() => import('./AssignmentsPage'));
const SessionTrackingPage = createLazyComponent(() => import('./SessionTrackingPage'));
const ProgressDashboardPage = createLazyComponent(() => import('./ProgressDashboardPage'));

// Páginas de Templates e Analytics
const TemplatesPage = createLazyComponent(() => import('./TemplatesPage'));
const TemplateEditPage = createLazyComponent(() => import('./TemplateEditPage'));
const ExerciseAnalyticsPage = createLazyComponent(() => import('./ExerciseAnalyticsPage'));
const MedicalReportPage = createLazyComponent(() => import('./MedicalReportPage'));
const EvaluationReportPage = createLazyComponent(() => import('./EvaluationReportPage'));
const ClinicalLibraryPage = createLazyComponent(() => import('./ClinicalLibraryPage'));
const ClinicalContentPage = createLazyComponent(() => import('./ClinicalContentPage'));
const EnhancedProtocolsPage = createLazyComponent(() => import('./EnhancedProtocolsPage'));
const EnhancedAssessmentsPage = createLazyComponent(() => import('./EnhancedAssessmentsPage'));
// ✅ MANTIDO: Apenas o gerador de vídeo principal
const FreeVideoGeneratorReal = createLazyComponent(() => import('./FreeVideoGeneratorReal'));
const InventoryDashboardPage = createLazyComponent(() => import('./InventoryDashboardPage'));
const NotificationCenterPage = createLazyComponent(() => import('./NotificationCenterPage'));
const NotFoundPage = LazyPages.NotFoundPage;
const SubscriptionPage = createLazyComponent(() => import('./SubscriptionPage'));
const LegalPage = createLazyComponent(() => import('./LegalPage'));
const KnowledgeBasePage = createLazyComponent(() => import('./KnowledgeBasePage'));
const WhatsAppPage = createLazyComponent(() => import('./WhatsAppPage'));
const InactivePatientEmailPage = createLazyComponent(() => import('./InactivePatientEmailPage'));
const HepGeneratorPage = createLazyComponent(() => import('./HepGeneratorPage'));
const AgendaSettingsPage = createLazyComponent(() => import('./AgendaSettingsPage'));
const AuditLogPage = createLazyComponent(() => import('./AuditLogPage'));
const BackupManagementPage = createLazyComponent(() => import('./BackupManagementPage'));
const MentoriaPageOld = createLazyComponent(() => import('./MentoriaPage'));
const GroupsPage = createLazyComponent(() => import('./GroupsPage'));
import KanbanPage from './KanbanPage';
const RiskAnalysisPage = createLazyComponent(() => import('./RiskAnalysisPage'));
const RiskStratificationPage = createLazyComponent(() => import('./RiskStratificationPage'));
const SportsRehabilitationPage = createLazyComponent(() => import('./SportsRehabilitationPage'));
const PopulationHealthDashboardPage = createLazyComponent(() => import('./PopulationHealthDashboardPage'));
const FamilyPortalPage = createLazyComponent(() => import('./FamilyPortalPage'));
const QualityAssuranceDashboardPage = createLazyComponent(() => import('./QualityAssuranceDashboardPage'));
const PredictiveAnalyticsPage = createLazyComponent(() => import('./PredictiveAnalyticsPage'));
const ClinicalAnalyticsPage = createLazyComponent(() => import('./ClinicalAnalyticsPage'));
const SettingsPage = createLazyComponent(() => import('./SettingsPage'));
const PartnershipPage = createLazyComponent(() => import('./PartnershipPage'));
const AiSettingsPage = createLazyComponent(() => import('./AiSettingsPage'));

// Componentes consolidados
const ConsolidatedReportsDashboard = LazyComponents.ConsolidatedReportsDashboard;
const ConsolidatedAITools = LazyComponents.ConsolidatedAITools;
const PerformanceDashboard = createLazyComponent(() => import('../components/admin/PerformanceDashboard'));

// Loading component for lazy pages
const PageLoader = () => <PageSkeleton />;

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
StatCard.displayName = 'StatCard';

// 🚀 DashboardContent memoizado
const DashboardContent = React.memo(() => {
    const [timeframe, setTimeframe] = useState('today');

    // 🚀 Stats memoizados
    const stats = useMemo(() => [
        { icon: Calendar, title: 'Consultas Hoje', value: '12', change: '+2 vs ontem', changeType: 'positive' },
        { icon: Users, title: 'Pacientes Ativos', value: '156', change: '+8 esta semana', changeType: 'positive' },
        { icon: Activity, title: 'Sessões Concluídas', value: '8', change: '67% da meta', changeType: 'neutral' },
        { icon: BarChart3, title: 'Taxa de Sucesso', value: '94%', change: '+3% vs mês passado', changeType: 'positive' }
    ], []);

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
                        aria-label="Selecionar período de tempo"
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
                        <button 
                            className="text-slate-400 hover:text-slate-600"
                            title="Baixar relatório de receita"
                            aria-label="Baixar relatório de receita"
                        >
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
});
DashboardContent.displayName = 'DashboardContent';

interface CompleteDashboardProps {
    user: any;
    onLogout: () => void;
}

const LazyElement = (Component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

// Alternative wrapper for router components
const RouterElement = (Component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

const SessionRoute: React.FC<{ mode?: 'view' | 'form' }> = ({ mode = 'view' }) => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    if (!appointmentId) return <Navigate to="/agenda" replace />;

    if (mode === 'form') {
        return (
            <Suspense fallback={<PageLoader />}>
                <SessionFormPage
                    appointmentId={appointmentId}
                    onClose={() => navigate('/agenda')}
                />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<PageLoader />}>
            <SessionPage
                appointmentId={appointmentId}
                onClose={() => navigate('/agenda')}
            />
        </Suspense>
    );
};

const CompleteDashboard: React.FC<CompleteDashboardProps> = ({ user, onLogout }) => {
    return (
        <ErrorBoundary>
            <Layout user={user} onLogout={onLogout}>
                <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardContent />} />
                
                {/* Dashboard Routes */}
                <Route path="/admin-dashboard" element={LazyElement(AdminDashboardPage)} />
                <Route path="/therapist-dashboard" element={LazyElement(TherapistDashboard)} />
                <Route path="/partner-dashboard" element={LazyElement(PartnerDashboard)} />
                <Route path="/admin/performance" element={LazyElement(PerformanceDashboard)} />
                <Route path="/simple-dashboard" element={LazyElement(SimpleDashboard)} />
                <Route path="/dashboard-page" element={LazyElement(DashboardPage)} />
                
                {/* Main Navigation */}
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/patients" element={LazyElement(PatientListPage)} />
                <Route path="/patients/new" element={LazyElement(PatientEditPage)} />
                <Route path="/patients/:id" element={LazyElement(PatientEditPage)} />
                <Route path="/patients/:id/view" element={LazyElement(PatientDetailPage)} />
                <Route path="/acompanhamento" element={LazyElement(AcompanhamentoPage)} />
                <Route path="/notifications" element={LazyElement(NotificationCenterPage)} />
                <Route path="/tasks" element={<KanbanPage />} />
                <Route path="/session-evolution" element={LazyElement(SessionEvolutionPage)} />
                
                {/* Sessions and Treatment */}
                <Route path="/sessions/:appointmentId" element={<SessionRoute mode="view" />} />
                <Route path="/sessions/:appointmentId/form" element={<SessionRoute mode="form" />} />
                <Route path="/session-view/:sessionId" element={LazyElement(SessionViewPage)} />
                <Route path="/atendimento/:appointmentId" element={LazyElement(AtendimentoPage)} />
                <Route path="/atendimento-demo" element={LazyElement(AtendimentoPageDemo)} />
                <Route path="/teleconsulta/:appointmentId" element={LazyElement(TeleconsultaPage)} />
                <Route path="/treatments" element={LazyElement(TreatmentPage)} />
                
                {/* Analytics & Reports */}
                <Route path="/clinical-analytics" element={LazyElement(ClinicalAnalyticsPage)} />
                <Route path="/ai-analytics" element={LazyElement(AiAnalyticsPage)} />
                <Route path="/financials" element={LazyElement(FinancialDashboardPage)} />
                <Route path="/financial-dashboard" element={LazyElement(FinancialDashboardPage)} />
                <Route path="/reports" element={LazyElement(ReportsPage)} />
                <Route path="/reports/consolidated" element={LazyElement(ConsolidatedReportsDashboard)} />
                <Route path="/advanced-reports" element={LazyElement(AdvancedReportsPage)} />
                <Route path="/medical-reports" element={LazyElement(MedicalReportPage)} />
                <Route path="/evaluation-reports" element={LazyElement(EvaluationReportPage)} />
                
                {/* AI Tools */}
                <Route path="/ai-tools/consolidated" element={LazyElement(ConsolidatedAITools)} />
                <Route path="/gerar-laudo" element={LazyElement(GerarLaudoPage)} />
                <Route path="/medical-report/new/:patientId" element={LazyElement(MedicalReportPage)} />
                <Route path="/gerar-evolucao" element={LazyElement(SessionEvolutionPage)} />
                <Route path="/hep-generator" element={LazyElement(HepGeneratorPage)} />
                <Route path="/risk-analysis" element={LazyElement(RiskAnalysisPage)} />
                <Route path="/risk-stratification/:patientId" element={LazyElement(RiskStratificationPage)} />
                <Route path="/sports-rehab/:patientId" element={LazyElement(SportsRehabilitationPage)} />
                <Route path="/population-health" element={LazyElement(PopulationHealthDashboardPage)} />
                <Route path="/family-portal/:patientId" element={LazyElement(FamilyPortalPage)} />
                <Route path="/quality-assurance" element={LazyElement(QualityAssuranceDashboardPage)} />
                <Route path="/predictive-analytics/:patientId" element={LazyElement(PredictiveAnalyticsPage)} />
                <Route path="/ia-economica" element={LazyElement(AiAnalyticsPage)} />
                
                {/* Management */}
                <Route path="/user-management" element={LazyElement(UserManagementPage)} />
                <Route path="/groups" element={LazyElement(GroupsPage)} />
                <Route path="/exercise-library" element={<EnhancedExerciseLibraryPage />} />
                <Route path="/exercise-library-test" element={<ExerciseLibraryTestPage />} />
                <Route path="/materials" element={<MaterialsPage />} />
                <Route path="/clinical-library" element={<ClinicalLibraryPage />} />
                <Route path="/clinical-content" element={<ClinicalContentPage />} />
            <Route path="/enhanced-protocols" element={<EnhancedProtocolsPage />} />
            <Route path="/enhanced-assessments" element={<EnhancedAssessmentsPage />} />
            {/* ✅ ÚNICA ROTA DE VÍDEO MANTIDA */}
            <Route path="/free-video-generator" element={<FreeVideoGeneratorReal />} />
                <Route path="/material-detail" element={LazyElement(MaterialDetailPage)} />
                <Route path="/protocols" element={LazyElement(ProtocolsPage)} />
                <Route path="/specialty-assessments" element={LazyElement(SpecialtyAssessmentsPage)} />
                <Route path="/evaluations" element={LazyElement(SpecialtyAssessmentsPage)} />
                
                {/* Inventory */}
                <Route path="/inventory" element={LazyElement(InventoryPage)} />
                <Route path="/estoque" element={LazyElement(InventoryPage)} />
                <Route path="/inventory-dashboard" element={<Navigate to="/inventory" replace />} />
                
                {/* Events */}
                <Route path="/events" element={LazyElement(EventsListPage)} />
                <Route path="/events-list" element={LazyElement(EventsListPage)} />
                <Route path="/event-detail" element={LazyElement(EventDetailPage)} />
                
                {/* Communication */}
                <Route path="/whatsapp" element={LazyElement(WhatsAppPage)} />
                <Route path="/email-inativos" element={LazyElement(InactivePatientEmailPage)} />
                <Route path="/inactive-patient-email" element={LazyElement(InactivePatientEmailPage)} />
                
                {/* Mentorship & Knowledge */}
                <Route path="/mentoria" element={LazyElement(MentoriaPage)} />
                <Route path="/knowledge-base" element={LazyElement(KnowledgeBasePage)} />
                
                {/* Settings & Configuration */}
                <Route path="/backup" element={LazyElement(BackupManagementPage)} />
                <Route path="/backup-management" element={LazyElement(BackupManagementPage)} />
                <Route path="/agenda-settings" element={LazyElement(AgendaSettingsPage)} />
                <Route path="/integrations" element={LazyElement(IntegrationsTestPage)} />
                <Route path="/integrations-test" element={LazyElement(IntegrationsTestPage)} />
                <Route path="/bi-integration-test" element={LazyElement(BIIntegrationTestPage)} />
                <Route path="/ai-settings" element={LazyElement(AiSettingsPage)} />
                <Route path="/audit-log" element={LazyElement(AuditLogPage)} />
                <Route path="/audit-log-page" element={LazyElement(AuditLogPage)} />
                <Route path="/partnerships" element={LazyElement(PartnershipPage)} />
                <Route path="/subscriptions" element={LazyElement(SubscriptionPage)} />
                <Route path="/legal" element={LazyElement(LegalPage)} />
                <Route path="/settings" element={LazyElement(SettingsPage)} />
                <Route path="/settings-page" element={LazyElement(SettingsPage)} />
                
                {/* Exercise Management Routes - Sistema Completo de Exercícios */}
                <Route path="/exercises" element={LazyElement(ExercisesPage)} />
                <Route path="/exercises/new" element={LazyElement(ExerciseEditPage)} />
                <Route path="/exercises/:id" element={LazyElement(ExerciseEditPage)} />
                <Route path="/exercises/:id/view" element={LazyElement(ExerciseEditPage)} />

                {/* Protocol Management Routes - Sistema de Protocolos */}
                <Route path="/protocols" element={LazyElement(ProtocolsPage)} />
                <Route path="/protocols/new" element={LazyElement(ProtocolEditPage)} />
                <Route path="/protocols/:id" element={LazyElement(ProtocolEditPage)} />
                <Route path="/protocols/:id/view" element={LazyElement(ProtocolEditPage)} />

                {/* Assignment Management Routes - Atribuições */}
                <Route path="/assignments" element={LazyElement(AssignmentsPage)} />
                <Route path="/session-tracking" element={LazyElement(SessionTrackingPage)} />
                <Route path="/progress-dashboard" element={LazyElement(ProgressDashboardPage)} />

                {/* Templates and Analytics */}
                <Route path="/templates" element={LazyElement(TemplatesPage)} />
                <Route path="/templates/new" element={LazyElement(TemplateEditPage)} />
                <Route path="/templates/:id" element={LazyElement(TemplateEditPage)} />
                <Route path="/exercise-analytics" element={LazyElement(ExerciseAnalyticsPage)} />

                {/* Legacy Routes */}
                <Route path="/admin" element={LazyElement(AdminDashboardPage)} />
                <Route path="/financial" element={LazyElement(FinancialDashboardPage)} />
                
                {/* 404 - Catch all unknown routes */}
                <Route path="*" element={LazyElement(NotFoundPage)} />
            </Routes>
        </Layout>
        </ErrorBoundary>
    );
};

export default CompleteDashboard;
