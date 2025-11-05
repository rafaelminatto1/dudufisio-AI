
import React, { useMemo, useEffect, memo, Suspense } from 'react';
import PageHeader from '../components/PageHeader';
const KPICards = React.lazy(() => import('../components/dashboard/KPICards'));
const RevenueChart = React.lazy(() => import('../components/financial/RevenueChart'));
const PatientFlowChart = React.lazy(() => import('../components/dashboard/PatientFlowChart'));
const TeamProductivityChart = React.lazy(() => import('../components/dashboard/TeamProductivityChart'));
const AppointmentHeatmap = React.lazy(() => import('../components/dashboard/AppointmentHeatmap'));
import { Activity, Users, Calendar, DollarSign, TrendingUp, Users as UsersIcon, Clock } from 'lucide-react';
import { useData } from "../contexts/AppContext";
import TodaysAppointments from '../components/dashboard/glance/TodaysAppointments';
import PendingTasks from '../components/dashboard/glance/PendingTasks';
import RecentActivity from '../components/dashboard/glance/RecentActivity';
import { IncompleteRegistrationsCard } from '../components/dashboard/IncompleteRegistrationsCard';
import useDashboardStats from '../hooks/useDashboardStats';
import { AppointmentTypeColors, EnrichedAppointment } from '../types';
import { useOptimizedPatients, useOptimizedAppointments } from '../hooks/useOptimizedData';
import { eventService } from '../services/eventService';
import { useComponentPerformance } from '../hooks/usePerformanceMetrics';
import OptimizedLoader from '../components/ui/OptimizedLoader';
import { useMemoWithTTL } from '../lib/performanceOptimization';
import ResponsiveContainer from '../components/ui/ResponsiveContainer';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import ResponsiveCard from '../components/ui/ResponsiveCard';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import FeatureCard from '../components/ui/FeatureCard';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import ScrollReveal from '../components/ui/ScrollReveal';
import PageTransition from '../components/ui/PageTransition';
import LoadingAnnouncer from '../components/ui/LoadingAnnouncer';

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const DashboardPage: React.FC = () => {
    // 🚀 Monitoramento de performance
    useComponentPerformance('DashboardPage');

    // 📊 Hooks otimizados para dados
    const { therapists, isLoading: isTherapistsLoading } = useData();
    const { 
        data: patientsData, 
        isLoading: isPatientsLoading, 
        refetch: refetchPatients 
    } = useOptimizedPatients({ ttl: 2 * 60 * 1000 });
    
    const { 
        data: appointmentsData, 
        isLoading: isAppointmentsLoading,
        refetch: refetchAppointments 
    } = useOptimizedAppointments({ ttl: 1 * 60 * 1000 });
    
    // Garantir que sempre temos arrays, mesmo quando os dados são null
    const patients = patientsData ?? [];
    const appointments = appointmentsData ?? [];

    // 🔄 Event listeners para invalidação de cache
    useEffect(() => {
        const handleDataChange = () => {
            refetchPatients();
            refetchAppointments();
        };

        eventService.on('patients:changed', handleDataChange);
        eventService.on('appointments:changed', handleDataChange);
        
        return () => {
            eventService.off('patients:changed', handleDataChange);
            eventService.off('appointments:changed', handleDataChange);
        };
    }, [refetchPatients, refetchAppointments]);

    const isLoading = isTherapistsLoading || isPatientsLoading || isAppointmentsLoading;
    
    // 📊 Dados enriquecidos com memoização otimizada
    const enrichedTodaysAppointments = useMemoWithTTL(() => {
        const todays = appointments.filter(app => isToday(new Date(app.startTime)));

        const therapistMap = new Map(therapists.map(t => [t.id, t]));
        const patientMap = new Map(patients.map(p => [p.id, p]));

        return todays.map(app => {
            const patient = patientMap.get(app.patientId);
            const therapist = therapistMap.get(app.therapistId);
            return {
                ...app,
                therapistColor: therapist?.color || 'slate',
                therapistName: therapist?.name || 'Unknown',
                typeColor: AppointmentTypeColors[app.type] || 'slate',
                patientPhone: patient?.phone || '',
                patientMedicalAlerts: patient?.medicalAlerts,
            } as EnrichedAppointment;
        });
    }, [appointments, patients, therapists], 15000); // Cache por 15 segundos

    const { stats } = useDashboardStats({ 
        patients, 
        appointments 
    });

    // 🎨 Loading state otimizado com skeleton
    if (isLoading) {
        return (
            <div className="space-y-6 pb-20 lg:pb-6">
                {/* Skeleton Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>

                {/* Skeleton Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-40"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skeleton Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <LoadingAnnouncer 
                isLoading={isLoading || isPatientsLoading || isAppointmentsLoading} 
                message="Carregando dados do dashboard..."
            />
            <ResponsiveContainer className="space-responsive" role="main">
                {/* Welcome Header with Gradient Background */}
                <AnimatedContainer animation="fadeInUp" className="mb-8">
                    <GlassCard 
                        variant="colored"
                        className="p-8 text-center"
                        hover={false}
                    >
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                                Bom dia, Dr. Eduardo! 👋
                            </h1>
                            <p className="text-white/90 text-lg max-w-2xl mx-auto">
                                Aqui está um resumo completo da sua clínica hoje
                            </p>
                        </div>
                    </GlassCard>
                </AnimatedContainer>

                {/* Quick Stats */}
                <AnimatedContainer animation="stagger" className="mb-8">
                    <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg" className="space-responsive">
                        <StatCard
                            title="Pacientes Hoje"
                            value={enrichedTodaysAppointments.length}
                            icon={UsersIcon}
                            variant="primary"
                            trend={{ value: 12, period: "vs ontem" }}
                        />
                        <StatCard
                            title="Faturamento"
                            value={stats.monthlyRevenue.value}
                            icon={DollarSign}
                            variant="success"
                            trend={{ value: 8, period: "este mês" }}
                        />
                        <StatCard
                            title="Taxa de Ocupação"
                            value={`${Math.round(stats.occupancyRate)}%`}
                            icon={TrendingUp}
                            variant="warning"
                            trend={{ value: 3, period: "vs semana passada" }}
                        />
                        <StatCard
                            title="Próxima Consulta"
                            value="14:30"
                            icon={Clock}
                            variant="default"
                            subtitle="Maria Silva"
                        />
                    </ResponsiveGrid>
                </AnimatedContainer>

                {/* Incomplete Registrations Alert */}
                <AnimatedContainer animation="fadeInUp" className="mb-8">
                    <IncompleteRegistrationsCard patients={patients || []} />
                </AnimatedContainer>

                {/* Quick Actions */}
                <ScrollReveal animation="slideInLeft" className="mb-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Ações Rápidas
                        </h2>
                        <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3 }} gap="lg" className="space-responsive">
                            <FeatureCard
                                icon={Calendar}
                                title="Agendar Consulta"
                                description="Marcar nova consulta para paciente"
                                variant="primary"
                                size="md"
                            />
                            <FeatureCard
                                icon={Users}
                                title="Novo Paciente"
                                description="Cadastrar novo paciente no sistema"
                                variant="success"
                                size="md"
                            />
                            <FeatureCard
                                icon={Activity}
                                title="Relatório Financeiro"
                                description="Gerar relatório de faturamento"
                                variant="warning"
                                size="md"
                            />
                        </ResponsiveGrid>
                    </div>
                </ScrollReveal>

                {/* KPI Cards */}
                <ScrollReveal animation="fadeInUp" className="mb-8">
                    <Suspense fallback={<OptimizedLoader />}>
                        <KPICards stats={stats} isLoading={isLoading} />
                    </Suspense>
                </ScrollReveal>

                {/* Daily Summary */}
                <ScrollReveal animation="slideInRight" className="mb-8">
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Resumo do Dia
                        </h2>
                        <ResponsiveGrid cols={{ base: 1, lg: 3 }} gap="lg" className="space-responsive">
                            <GlassCard variant="default">
                                <TodaysAppointments appointments={enrichedTodaysAppointments} />
                            </GlassCard>
                            <GlassCard variant="default">
                                <PendingTasks />
                            </GlassCard>
                            <GlassCard variant="default">
                                <RecentActivity />
                            </GlassCard>
                        </ResponsiveGrid>
                    </div>
                </ScrollReveal>

                {/* Charts Section */}
                <ScrollReveal animation="fadeInUp" className="mb-8">
                    <ResponsiveGrid cols={{ base: 1, xl: 2 }} gap="lg" className="space-responsive">
                        <GlassCard 
                            header={{ 
                                title: "Evolução da Receita",
                                subtitle: "Últimos 30 dias"
                            }}
                            variant="default"
                        >
                            <Suspense fallback={<OptimizedLoader />}>
                                <RevenueChart appointments={appointments ?? []} />
                            </Suspense>
                        </GlassCard>
                        <GlassCard 
                            header={{ 
                                title: "Fluxo de Pacientes",
                                subtitle: "Novos vs Retornos"
                            }}
                            variant="default"
                        >
                            <Suspense fallback={<OptimizedLoader />}>
                                <PatientFlowChart patients={patients ?? []} />
                            </Suspense>
                        </GlassCard>
                    </ResponsiveGrid>
                </ScrollReveal>

                {/* Analytics Section */}
                <ScrollReveal animation="scaleIn" className="mb-8">
                    <ResponsiveGrid cols={{ base: 1, lg: 3 }} gap="lg" className="space-responsive">
                        <GlassCard 
                            className="lg:col-span-2"
                            header={{ 
                                title: "Mapa de Calor de Agendamentos",
                                subtitle: "Distribuição por horário e dia"
                            }}
                            variant="default"
                            overflow="auto"
                        >
                            <div className="overflow-x-auto">
                                <Suspense fallback={<OptimizedLoader />}>
                                    <AppointmentHeatmap appointments={appointments ?? []} />
                                </Suspense>
                            </div>
                        </GlassCard>
                        
                        <GlassCard 
                            header={{ 
                                title: "Produtividade da Equipe",
                                subtitle: "Consultas por terapeuta"
                            }}
                            variant="default"
                        >
                            <Suspense fallback={<OptimizedLoader />}>
                                <TeamProductivityChart appointments={appointments ?? []} therapists={therapists} />
                            </Suspense>
                        </GlassCard>
                    </ResponsiveGrid>
                </ScrollReveal>
            </ResponsiveContainer>
        </PageTransition>
    );
};

export default memo(DashboardPage);