import React, { useEffect, useMemo, useState } from 'react';
import AlertsOverview from '../components/acompanhamento/AlertsOverview';
import AttendanceChart from '../components/acompanhamento/AttendanceChart';
import TimelineBoard from '../components/acompanhamento/TimelineBoard';
import QuickActionsPanel from '../components/acompanhamento/QuickActionsPanel';
import BodyMapSummaryCard from '../components/body-map/BodyMapSummaryCard';
import { useData, useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import PageHeader from '../components/PageHeader';
import { Skeleton } from '../components/ui/skeleton';
import * as acompanhamentoService from '../services/acompanhamentoService';
import * as patientService from '../services/patientService';
import * as bodyMapService from '../services/bodyMapService';
import { useNavigate } from 'react-router-dom';

const AcompanhamentoPage: React.FC = () => {
    const { user } = useApp();
    const { patients, appointments, isLoading, refetch } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState<acompanhamentoService.IntelligentAlertSummary | null>(null);
    const [metrics, setMetrics] = useState<acompanhamentoService.DashboardMetrics | null>(null);
    const [timeline, setTimeline] = useState<acompanhamentoService.PatientTimelineEntry[]>([]);
    const [attendanceSeries, setAttendanceSeries] = useState<Record<string, acompanhamentoService.PatientAttendancePoint[]>>({});
    const [quickActions, setQuickActions] = useState<acompanhamentoService.QuickActionsData | null>(null);
    const [bodyMapUpdates, setBodyMapUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [alertData, metricData, timelineData, attendanceData, quickActionsData] = await Promise.all([
                    acompanhamentoService.getIntelligentAlerts(patients, appointments),
                    acompanhamentoService.getDashboardMetrics(patients, appointments),
                    acompanhamentoService.getPatientTimelines(patients, appointments),
                    Promise.resolve(acompanhamentoService.getPatientAttendanceSeries(appointments)),
                    acompanhamentoService.getQuickActionsData(patients, appointments),
                ]);

                setAlerts(alertData);
                setMetrics(metricData);
                setTimeline(timelineData);
                setAttendanceSeries(attendanceData);
                setQuickActions(quickActionsData);

                // Carregar atualizações do mapa corporal
                await loadBodyMapUpdates();
            } catch (error) {
                console.error('Erro ao carregar dados de acompanhamento:', error);
                showToast('Não foi possível carregar os dados do dashboard de acompanhamento.', 'error');
            } finally {
                setLoading(false);
            }
        };

        const loadBodyMapUpdates = async () => {
            try {
                // Buscar últimas sessões de cada paciente
                const updates = await Promise.all(
                    patients.slice(0, 5).map(async (patient) => {
                        const cache = await bodyMapService.getBodyMapAnalyticsCache(patient.id);
                        const latestSession = await bodyMapService.getLatestBodyMapSession(patient.id);

                        if (!cache || !latestSession) return null;

                        return {
                            ...patient,
                            lastPainLevel: cache.averagePainLevel,
                            painTrend: cache.painTrend,
                            lastSessionDate: latestSession.sessionDate,
                        };
                    })
                );

                setBodyMapUpdates(updates.filter(Boolean));
            } catch (error) {
                console.error('Erro ao carregar atualizações do mapa corporal:', error);
            }
        };

        if (patients.length > 0 || appointments.length > 0) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [patients, appointments, showToast]);

    const activePatients = useMemo(() => patients.filter(patient => patient.status === 'Active'), [patients]);

    const handleLogContact = async (patientId: string, type: 'WhatsApp' | 'Ligação') => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient || !user) return;

        try {
            await patientService.addCommunicationLog(patientId, {
                date: new Date().toISOString(),
                type,
                notes: `Tentativa de contato registrada via ${type}.`,
                actor: user.name,
            });
            showToast('Contato registrado com sucesso.', 'success');
            const updatedQuickActions = await acompanhamentoService.getQuickActionsData(patients, appointments);
            setQuickActions(updatedQuickActions);
            refetch();
        } catch (error) {
            showToast('Falha ao registrar contato.', 'error');
        }
    };

    const handleReschedule = (patientId: string) => {
        navigate('/agenda', { state: { patientId } });
    };

    const handleAddObservation = (patientId: string) => {
        navigate(`/patients/${patientId}`);
    };

    const renderSkeletons = () => (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Skeleton className="h-96 rounded-xl" />
                <Skeleton className="h-96 rounded-xl" />
                <Skeleton className="h-96 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Acompanhamento de Pacientes"
                subtitle="Monitore presença, evolução clínica e priorize ações para retenção."
            />

            {loading || !alerts || !metrics || !quickActions ? (
                renderSkeletons()
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 space-y-6">
                            <AlertsOverview alerts={alerts} metrics={metrics} />
                            <AttendanceChart attendanceSeries={attendanceSeries} patients={activePatients} />
                        </div>
                        <TimelineBoard timeline={timeline.slice(0, 10)} />
                    </div>

                    {/* Card de Mapa Corporal */}
                    {bodyMapUpdates.length > 0 && (
                        <BodyMapSummaryCard patientsWithPainUpdates={bodyMapUpdates} />
                    )}

                    <QuickActionsPanel
                        quickActions={quickActions}
                        onLogContact={handleLogContact}
                        onReschedule={handleReschedule}
                        onAddObservation={handleAddObservation}
                    />
                </div>
            )}
        </div>
    );
};

export default AcompanhamentoPage;
