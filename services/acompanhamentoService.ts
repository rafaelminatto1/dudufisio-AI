
// services/acompanhamentoService.ts
import { Patient, Appointment, AppointmentStatus, AlertPatient, TreatmentPlan } from '../types';
import { mockPatients } from '../data/mockData';
import * as treatmentService from './treatmentService';

interface CategorizedPatients {
    abandonment: AlertPatient[];
    highRisk: AlertPatient[];
    attention: AlertPatient[];
    regular: Patient[];
}

export interface IntelligentAlertSummary {
    abandonment: AlertPatient[];
    highRisk: AlertPatient[];
    attention: AlertPatient[];
    nearDischarge: AlertPatient[];
    pendingDischarge: AlertPatient[];
}

export interface DashboardMetrics {
    totalActivePatients: number;
    abandonmentRate: number;
    adherenceAverage: number;
    dischargeForecast: {
        totalScheduled: number;
        nextSevenDays: number;
        overdueDischarges: number;
    };
}

export interface PatientAttendancePoint {
    date: string;
    status: 'Completed' | 'NoShow' | 'Scheduled';
}

export interface PatientTimelineEntry {
    patientId: string;
    patientName: string;
    lastVisit: string;
    nextVisit?: string;
    daysSinceLastVisit: number;
    status: 'on_track' | 'risk' | 'abandonment';
}

export interface QuickActionsData {
    whatsappContacts: Array<{ patientId: string; patientName: string; phone: string; message: string }>;
    rescheduleSuggestions: Array<{ patientId: string; patientName: string; lastVisit: string; reason: string }>;
    contactLogsPending: Array<{ patientId: string; patientName: string; lastCommunication?: string }>;
    observations: Array<{ patientId: string; patientName: string; summary: string }>;
}

const hasFutureAppointment = (patientId: string, allAppointments: Appointment[]): boolean => {
    const now = new Date();
    return allAppointments.some(app => 
        app.patientId === patientId && 
        app.startTime > now && 
        app.status === AppointmentStatus.Scheduled
    );
};

const getDaysSince = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getPlanSessions = (plan?: TreatmentPlan | null) => {
    if (!plan) return { totalSessions: 0, sessionsPerWeek: 0 };
    const totalSessions = plan.durationWeeks * plan.frequencyPerWeek;
    return { totalSessions, sessionsPerWeek: plan.frequencyPerWeek };
};

export const getCategorizedPatients = async (
    allPatients: Patient[],
    allAppointments: Appointment[],
): Promise<CategorizedPatients> => {

    const categorized: CategorizedPatients = {
        abandonment: [],
        highRisk: [],
        attention: [],
        regular: [],
    };

    const patientIdsInAlerts = new Set<string>();
    const treatmentPlans = new Map<string, TreatmentPlan | null>();

    for (const patient of allPatients) {
        if (patient.status !== 'Active') continue;

        const patientAppointments = allAppointments.filter(app => app.patientId === patient.id)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

        // 1. Check for Abandonment (highest priority)
        const daysSinceLastVisit = getDaysSince(patient.lastVisit);
        if (daysSinceLastVisit > 7 && !hasFutureAppointment(patient.id, allAppointments)) {
            categorized.abandonment.push({
                ...patient,
                alertType: 'abandonment',
                alertReason: `Última visita há ${daysSinceLastVisit} dias, sem novo agendamento.`
            });
            patientIdsInAlerts.add(patient.id);
            continue; 
        }

        // 2. Check for High Risk
        const recentScheduled = patientAppointments
            .filter(app => app.startTime < new Date())
            .slice(0, 2);
            
        if (recentScheduled.length >= 2 && recentScheduled.every(app => app.status === AppointmentStatus.NoShow)) {
            categorized.highRisk.push({
                ...patient,
                alertType: 'highRisk',
                alertReason: `Faltou às últimas ${recentScheduled.length} consultas. Contato urgente.`
            });
            patientIdsInAlerts.add(patient.id);
            continue;
        }

        // 3. Check for Attention Points
        if (!treatmentPlans.has(patient.id)) {
            treatmentPlans.set(patient.id, await treatmentService.getPlanByPatientId(patient.id));
        }
        const plan = treatmentPlans.get(patient.id);
        
        if (plan) {
            const { totalSessions } = getPlanSessions(plan);
            const completedSessions = patientAppointments.filter(a => a.status === AppointmentStatus.Completed).length;

            if (totalSessions > 0 && completedSessions >= totalSessions * 0.8 && completedSessions < totalSessions) {
                 categorized.attention.push({
                    ...patient,
                    alertType: 'attention',
                    alertReason: `Próximo da alta (${completedSessions}/${totalSessions} sessões). Planejar próximos passos.`
                 });
                 patientIdsInAlerts.add(patient.id);
                 continue;
            }
        }
    }
    
    // 4. Regular Patients (everyone else active)
    allPatients.forEach(patient => {
        if (patient.status === 'Active' && !patientIdsInAlerts.has(patient.id)) {
            categorized.regular.push(patient);
        }
    });


    return categorized;
};

export const getIntelligentAlerts = async (
    patients: Patient[] = mockPatients,
    appointments: Appointment[],
): Promise<IntelligentAlertSummary> => {
    const categorized = await getCategorizedPatients(patients, appointments);
    const nearDischarge = categorized.attention;

    const pendingDischarge: AlertPatient[] = [];

    for (const patient of patients) {
        if (patient.status !== 'Active') continue;

        const plan = await treatmentService.getPlanByPatientId(patient.id);
        if (!plan) continue;

        const { totalSessions } = getPlanSessions(plan);
        if (totalSessions === 0) continue;

        const patientAppointments = appointments.filter(app => app.patientId === patient.id);
        const completedSessions = patientAppointments.filter(app => app.status === AppointmentStatus.Completed).length;
        const hasFuture = hasFutureAppointment(patient.id, appointments);

        if (completedSessions >= totalSessions && !hasFuture) {
            pendingDischarge.push({
                ...patient,
                alertType: 'attention',
                alertReason: `Plano concluído (${completedSessions}/${totalSessions}), agendar alta imediata.`
            });
        }
    }

    return {
        abandonment: categorized.abandonment,
        highRisk: categorized.highRisk,
        attention: categorized.attention,
        nearDischarge,
        pendingDischarge,
    };
};

const calculateAdherenceRate = (patientAppointments: Appointment[], totalSessions: number) => {
    if (totalSessions === 0) return 100;
    const attended = patientAppointments.filter(app => app.status === AppointmentStatus.Completed).length;
    const scheduled = patientAppointments.filter(app => app.status === AppointmentStatus.Scheduled && app.startTime < new Date()).length;
    return Math.min(100, Math.round((attended / Math.max(1, attended + scheduled)) * 100));
};

export const getDashboardMetrics = async (
    patients: Patient[] = mockPatients,
    appointments: Appointment[],
): Promise<DashboardMetrics> => {
    const activePatients = patients.filter(p => p.status === 'Active');
    const totalActivePatients = activePatients.length;

    let abandonmentCount = 0;
    let adherenceAccumulator = 0;
    let adherenceSamples = 0;

    let totalScheduledDischarge = 0;
    let dischargesNextSevenDays = 0;
    let overdueDischarges = 0;

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    for (const patient of activePatients) {
        const patientAppointments = appointments.filter(app => app.patientId === patient.id);
        const lastVisit = new Date(patient.lastVisit);
        const daysSinceLastVisit = getDaysSince(patient.lastVisit);

        if (daysSinceLastVisit > 7 && !hasFutureAppointment(patient.id, appointments)) {
            abandonmentCount += 1;
        }

        const plan = await treatmentService.getPlanByPatientId(patient.id);
        if (plan) {
            const { totalSessions, sessionsPerWeek } = getPlanSessions(plan);
            const adherence = calculateAdherenceRate(patientAppointments, totalSessions);
            adherenceAccumulator += adherence;
            adherenceSamples += 1;

            const completedSessions = patientAppointments.filter(app => app.status === AppointmentStatus.Completed).length;

            if (totalSessions > 0) {
                const remainingSessions = Math.max(0, totalSessions - completedSessions);
                const weeksToFinish = sessionsPerWeek > 0 ? remainingSessions / sessionsPerWeek : 0;
                const predictedDischargeDate = new Date(lastVisit);
                predictedDischargeDate.setDate(predictedDischargeDate.getDate() + Math.ceil(weeksToFinish * 7));

                if (remainingSessions > 0) {
                    totalScheduledDischarge += 1;
                    if (predictedDischargeDate <= sevenDaysFromNow) {
                        dischargesNextSevenDays += 1;
                    }
                } else if (!hasFutureAppointment(patient.id, appointments)) {
                    overdueDischarges += 1;
                }
            }
        }
    }

    const abandonmentRate = totalActivePatients === 0 ? 0 : Math.round((abandonmentCount / totalActivePatients) * 100);
    const adherenceAverage = adherenceSamples === 0 ? 0 : Math.round(adherenceAccumulator / adherenceSamples);

    return {
        totalActivePatients,
        abandonmentRate,
        adherenceAverage,
        dischargeForecast: {
            totalScheduled: totalScheduledDischarge,
            nextSevenDays: dischargesNextSevenDays,
            overdueDischarges,
        },
    };
};

export const getPatientAttendanceSeries = (
    appointments: Appointment[],
): Record<string, PatientAttendancePoint[]> => {
    const series: Record<string, PatientAttendancePoint[]> = {};

    for (const appointment of appointments) {
        const date = appointment.startTime.toISOString().split('T')[0];
        const status = appointment.status === AppointmentStatus.Completed
            ? 'Completed'
            : appointment.status === AppointmentStatus.NoShow
                ? 'NoShow'
                : 'Scheduled';

        if (!series[appointment.patientId]) {
            series[appointment.patientId] = [];
        }

        series[appointment.patientId].push({
            date,
            status,
        });
    }

    Object.values(series).forEach(points => points.sort((a, b) => a.date.localeCompare(b.date)));

    return series;
};

export const getPatientTimelines = (
    patients: Patient[] = mockPatients,
    appointments: Appointment[],
): PatientTimelineEntry[] => {
    return patients
        .filter(patient => patient.status === 'Active')
        .map(patient => {
            const patientAppointments = appointments
                .filter(app => app.patientId === patient.id)
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            const lastVisitDate = new Date(patient.lastVisit);
            const daysSinceLastVisit = getDaysSince(patient.lastVisit);
            const nextAppointment = patientAppointments.find(app => app.startTime > new Date() && app.status === AppointmentStatus.Scheduled);

            let status: 'on_track' | 'risk' | 'abandonment' = 'on_track';
            if (daysSinceLastVisit > 7 && !nextAppointment) {
                status = 'abandonment';
            } else if (daysSinceLastVisit >= 4) {
                status = 'risk';
            }

            return {
                patientId: patient.id,
                patientName: patient.name,
                lastVisit: lastVisitDate.toLocaleDateString('pt-BR'),
                nextVisit: nextAppointment ? nextAppointment.startTime.toLocaleDateString('pt-BR') : undefined,
                daysSinceLastVisit,
                status,
            };
        })
        .sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
};

export const getQuickActionsData = async (
    patients: Patient[] = mockPatients,
    appointments: Appointment[],
): Promise<QuickActionsData> => {
    const alerts = await getIntelligentAlerts(patients, appointments);
    const abandonmentAndRisk = [...alerts.abandonment, ...alerts.highRisk];

    const whatsappContacts = abandonmentAndRisk.map(patient => ({
        patientId: patient.id,
        patientName: patient.name,
        phone: patient.phone,
        message: `Olá ${patient.name.split(' ')[0]}, aqui é da equipe DuduFisio. Notamos que você faltou recentemente e queremos ajudar a retomar seu tratamento. Podemos agendar um novo horário?`,
    }));

    const rescheduleSuggestions = abandonmentAndRisk.map(patient => ({
        patientId: patient.id,
        patientName: patient.name,
        lastVisit: new Date(patient.lastVisit).toLocaleDateString('pt-BR'),
        reason: patient.alertReason,
    }));

    const contactLogsPending: Array<{ patientId: string; patientName: string; lastCommunication?: string }> = [];
    const observations: Array<{ patientId: string; patientName: string; summary: string }> = [];

    for (const patient of patients) {
        if (!patient.communicationLogs || patient.communicationLogs.length === 0) {
            contactLogsPending.push({
                patientId: patient.id,
                patientName: patient.name,
            });
        } else {
            contactLogsPending.push({
                patientId: patient.id,
                patientName: patient.name,
                lastCommunication: patient.communicationLogs[0]?.date,
            });
        }

        if (patient.medicalAlerts) {
            observations.push({
                patientId: patient.id,
                patientName: patient.name,
                summary: patient.medicalAlerts,
            });
        }
    }

    return {
        whatsappContacts,
        rescheduleSuggestions,
        contactLogsPending,
        observations,
    };
};
