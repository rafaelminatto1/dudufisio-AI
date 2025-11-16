// services/patientMonitoringService.ts
import {
  Patient,
  Appointment,
  AppointmentStatus,
  PatientStatus,
  PatientWithMonitoringMetrics,
  RiskLevel,
  KPIMetrics,
  PresenceDataPoint,
  PainDistributionData,
} from '../types';
import * as bodyMapService from './bodyMapService';

/**
 * Calcula o nível de risco de um paciente baseado em múltiplos critérios
 */
export function calculatePatientRisk(
  consecutiveMisses: number,
  daysSinceLastSession: number,
  painTrend: 'improving' | 'stable' | 'worsening' | 'no_data',
  painChange?: number
): { level: RiskLevel; reasons: string[] } {
  const reasons: string[] = [];
  let riskScore = 0;

  // Critério 1: Faltas consecutivas
  if (consecutiveMisses >= 3) {
    riskScore += 3;
    reasons.push(`${consecutiveMisses} faltas consecutivas`);
  } else if (consecutiveMisses >= 2) {
    riskScore += 2;
    reasons.push(`${consecutiveMisses} faltas consecutivas`);
  } else if (consecutiveMisses === 1) {
    riskScore += 1;
    reasons.push('1 falta recente');
  }

  // Critério 2: Tempo sem sessão
  if (daysSinceLastSession >= 30) {
    riskScore += 3;
    reasons.push(`${daysSinceLastSession} dias sem sessão`);
  } else if (daysSinceLastSession >= 15) {
    riskScore += 2;
    reasons.push(`${daysSinceLastSession} dias sem sessão`);
  } else if (daysSinceLastSession >= 7) {
    riskScore += 1;
  }

  // Critério 3: Piora de dor
  if (painTrend === 'worsening') {
    if (painChange && painChange >= 3) {
      riskScore += 3;
      reasons.push(`Piora significativa de dor (+${painChange.toFixed(1)} pontos)`);
    } else if (painChange && painChange >= 1) {
      riskScore += 2;
      reasons.push(`Piora de dor (+${painChange.toFixed(1)} pontos)`);
    } else {
      riskScore += 1;
      reasons.push('Tendência de piora de dor');
    }
  }

  // Determinar nível de risco
  let level: RiskLevel;
  if (riskScore >= 5) {
    level = 'high';
  } else if (riskScore >= 2) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // Se não há razões específicas, adicionar mensagem padrão
  if (reasons.length === 0) {
    reasons.push('Acompanhamento regular');
  }

  return { level, reasons };
}

/**
 * Calcula métricas de presença para um paciente
 */
function calculateAttendanceMetrics(
  patientId: string,
  appointments: Appointment[]
): {
  attendanceRate: number;
  totalSessions: number;
  totalMisses: number;
  consecutiveMisses: number;
  lastSessionDate: string | null;
  daysSinceLastSession: number;
  nextScheduledSession?: string;
} {
  const patientAppointments = appointments
    .filter(apt => apt.patientId === patientId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const completedSessions = patientAppointments.filter(
    apt => apt.status === AppointmentStatus.Completed
  );
  const missedSessions = patientAppointments.filter(
    apt => apt.status === AppointmentStatus.NoShow
  );

  const totalSessions = completedSessions.length;
  const totalMisses = missedSessions.length;
  const totalRelevant = totalSessions + totalMisses;

  const attendanceRate = totalRelevant > 0 
    ? (totalSessions / totalRelevant) * 100 
    : 100;

  // Calcular faltas consecutivas (a partir da mais recente)
  let consecutiveMisses = 0;
  for (const apt of patientAppointments) {
    if (apt.status === AppointmentStatus.NoShow) {
      consecutiveMisses++;
    } else if (apt.status === AppointmentStatus.Completed) {
      break;
    }
  }

  // Última sessão realizada
  const lastSession = completedSessions[0];
  const lastSessionDate = lastSession ? lastSession.startTime : null;
  
  const daysSinceLastSession = lastSessionDate
    ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Próxima sessão agendada
  const upcomingSession = patientAppointments.find(
    apt => apt.status === AppointmentStatus.Scheduled && new Date(apt.startTime) > new Date()
  );

  return {
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    totalSessions,
    totalMisses,
    consecutiveMisses,
    lastSessionDate,
    daysSinceLastSession,
    nextScheduledSession: upcomingSession?.startTime,
  };
}

/**
 * Calcula tendência e nível de dor de um paciente
 */
async function calculatePainMetrics(patientId: string): Promise<{
  averagePainLevel: number;
  painTrend: 'improving' | 'stable' | 'worsening' | 'no_data';
  painChange?: number;
}> {
  try {
    const cache = await bodyMapService.getBodyMapAnalyticsCache(patientId);
    
    if (!cache) {
      return {
        averagePainLevel: 0,
        painTrend: 'no_data',
      };
    }

    const sessions = await bodyMapService.getSessionsByPatient(patientId);
    
    // Calcular mudança de dor (comparar últimas 2 sessões)
    let painChange: number | undefined;
    if (sessions.length >= 2) {
      const latestAvg = calculateSessionAveragePain(sessions[0]);
      const previousAvg = calculateSessionAveragePain(sessions[1]);
      painChange = latestAvg - previousAvg;
    }

    return {
      averagePainLevel: cache.averagePainLevel,
      painTrend: cache.painTrend,
      painChange,
    };
  } catch (error) {
    console.error('Error calculating pain metrics:', error);
    return {
      averagePainLevel: 0,
      painTrend: 'no_data',
    };
  }
}

/**
 * Calcula nível médio de dor de uma sessão
 */
function calculateSessionAveragePain(session: any): number {
  if (!session.painRegions || session.painRegions.length === 0) {
    return 0;
  }
  
  const sum = session.painRegions.reduce((acc: number, region: any) => acc + region.intensity, 0);
  return sum / session.painRegions.length;
}

/**
 * Obtém métricas completas de monitoramento para todos os pacientes
 */
export async function getPatientMonitoringMetrics(
  patients: Patient[],
  appointments: Appointment[]
): Promise<PatientWithMonitoringMetrics[]> {
  const metricsPromises = patients.map(async (patient) => {
    const attendanceMetrics = calculateAttendanceMetrics(patient.id, appointments);
    const painMetrics = await calculatePainMetrics(patient.id);

    const { level: riskLevel, reasons: riskReasons } = calculatePatientRisk(
      attendanceMetrics.consecutiveMisses,
      attendanceMetrics.daysSinceLastSession,
      painMetrics.painTrend,
      painMetrics.painChange
    );

    return {
      ...patient,
      ...attendanceMetrics,
      ...painMetrics,
      riskLevel,
      riskReasons,
    };
  });

  return Promise.all(metricsPromises);
}

/**
 * Calcula KPIs agregados para o dashboard
 */
export function getKPISummary(
  patientsWithMetrics: PatientWithMonitoringMetrics[],
  periodDays: number = 30
): KPIMetrics {
  const activePatients = patientsWithMetrics.filter(
    p => p.status === PatientStatus.Active
  );

  const totalActivePatients = activePatients.length;

  const averageAttendanceRate = activePatients.length > 0
    ? activePatients.reduce((sum, p) => sum + p.attendanceRate, 0) / activePatients.length
    : 0;

  const patientsAtRisk = activePatients.filter(
    p => p.riskLevel === 'medium' || p.riskLevel === 'high'
  ).length;

  const totalMissesInPeriod = activePatients.reduce((sum, p) => sum + p.totalMisses, 0);

  // Para trends, precisaríamos de dados históricos
  // Por ora, retornamos 0 como placeholder
  return {
    totalActivePatients,
    averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
    patientsAtRisk,
    totalMissesInPeriod,
    trends: {
      activePatients: 0,
      attendanceRate: 0,
      patientsAtRisk: 0,
      misses: 0,
    },
  };
}

/**
 * Obtém dados de evolução de presença ao longo do tempo
 */
export function getPresenceEvolutionData(
  appointments: Appointment[],
  days: number = 30
): PresenceDataPoint[] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const dataPoints: PresenceDataPoint[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
      return aptDate === dateStr;
    });

    const completed = dayAppointments.filter(
      apt => apt.status === AppointmentStatus.Completed
    ).length;
    const missed = dayAppointments.filter(
      apt => apt.status === AppointmentStatus.NoShow
    ).length;
    const total = completed + missed;

    const attendanceRate = total > 0 ? (completed / total) * 100 : 0;

    dataPoints.push({
      date: dateStr,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      totalSessions: total,
      completed,
      missed,
    });
  }

  return dataPoints;
}

/**
 * Obtém dados de distribuição de níveis de dor
 */
export async function getPainDistributionData(
  patients: Patient[]
): Promise<PainDistributionData[]> {
  const painLevels = await Promise.all(
    patients.map(async (patient) => {
      try {
        const cache = await bodyMapService.getBodyMapAnalyticsCache(patient.id);
        return cache?.averagePainLevel ?? 0;
      } catch {
        return 0;
      }
    })
  );

  const distribution = {
    none: 0,      // 0
    low: 0,       // 1-3
    moderate: 0,  // 4-6
    severe: 0,    // 7-10
  };

  painLevels.forEach(level => {
    if (level === 0) {
      distribution.none++;
    } else if (level <= 3) {
      distribution.low++;
    } else if (level <= 6) {
      distribution.moderate++;
    } else {
      distribution.severe++;
    }
  });

  const total = patients.length;

  return [
    {
      category: 'none',
      label: 'Sem dor (0)',
      count: distribution.none,
      percentage: total > 0 ? Math.round((distribution.none / total) * 100) : 0,
      color: '#10b981', // green-500
    },
    {
      category: 'low',
      label: 'Leve (1-3)',
      count: distribution.low,
      percentage: total > 0 ? Math.round((distribution.low / total) * 100) : 0,
      color: '#fbbf24', // amber-400
    },
    {
      category: 'moderate',
      label: 'Moderada (4-6)',
      count: distribution.moderate,
      percentage: total > 0 ? Math.round((distribution.moderate / total) * 100) : 0,
      color: '#f97316', // orange-500
    },
    {
      category: 'severe',
      label: 'Severa (7-10)',
      count: distribution.severe,
      percentage: total > 0 ? Math.round((distribution.severe / total) * 100) : 0,
      color: '#ef4444', // red-500
    },
  ];
}

