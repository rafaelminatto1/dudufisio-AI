
import React, { useMemo, useEffect, memo } from 'react';
import PageHeader from '../components/PageHeader';
import KPICards from '../components/dashboard/KPICards';
import RevenueChart from '../components/dashboard/RevenueChart';
import PatientFlowChart from '../components/dashboard/PatientFlowChart';
import TeamProductivityChart from '../components/dashboard/TeamProductivityChart';
import AppointmentHeatmap from '../components/dashboard/AppointmentHeatmap';
import { Activity, Users } from 'lucide-react';
import { useData } from "../contexts/AppContext";
import TodaysAppointments from '../components/dashboard/glance/TodaysAppointments';
import PendingTasks from '../components/dashboard/glance/PendingTasks';
import RecentActivity from '../components/dashboard/glance/RecentActivity';
import useDashboardStats from '../hooks/useDashboardStats';
import { AppointmentTypeColors, EnrichedAppointment } from '../types';
import { useOptimizedPatients, useOptimizedAppointments } from '../hooks/useOptimizedData';
import { eventService } from '../services/eventService';
import { useComponentPerformance } from '../hooks/usePerformanceMetrics';
import OptimizedLoader from '../components/ui/OptimizedLoader';
import { useMemoWithTTL, usePerformanceMonitor } from '../lib/performanceOptimization';

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const DashboardPage: React.FC = () => {
    // 🚀 Monitoramento de performance
    useComponentPerformance('DashboardPage');
    usePerformanceMonitor('DashboardPage');

    // 📊 Hooks otimizados para dados
    const { therapists, isLoading: isTherapistsLoading } = useData();
    const { 
        data: patients, 
        isLoading: isPatientsLoading, 
        refetch: refetchPatients 
    } = useOptimizedPatients({ ttl: 2 * 60 * 1000 });
    
    const { 
        data: appointments, 
        isLoading: isAppointmentsLoading,
        refetch: refetchAppointments 
    } = useOptimizedAppointments({ ttl: 1 * 60 * 1000 });

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
        if (!appointments || !patients) return [];
        
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
        patients: patients || [], 
        appointments: appointments || [] 
    });

    // 🎨 Loading state otimizado
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <OptimizedLoader size="lg" text="Carregando dashboard..." />
            </div>
        );
    }

    return (
        <main className="space-y-8" role="main">
            <header>
                <PageHeader
                    title="Dashboard Administrativo"
                    subtitle="Visão 360° do negócio com métricas financeiras, operacionais e clínicas."
                />
            </header>

            <div className="space-y-8">
                <KPICards stats={stats} isLoading={isLoading} />

                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Resumo do Dia</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <TodaysAppointments appointments={enrichedTodaysAppointments} />
                        <PendingTasks />
                        <RecentActivity />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RevenueChart appointments={appointments ?? []} />
                    <PatientFlowChart patients={patients ?? []} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-teal-500" /> Mapa de Calor de Agendamentos
                        </h3>
                        <AppointmentHeatmap appointments={appointments ?? []} />
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-teal-500" /> Produtividade da Equipe
                        </h3>
                        <TeamProductivityChart appointments={appointments ?? []} therapists={therapists} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default memo(DashboardPage);