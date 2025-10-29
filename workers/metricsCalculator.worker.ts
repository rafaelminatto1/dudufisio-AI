// workers/metricsCalculator.worker.ts
/**
 * Web Worker para cálculos pesados de métricas em background
 * Não bloqueia a UI principal
 */

import { Patient, Appointment, AppointmentStatus, PatientStatus } from '../types';

// Tipos de mensagens que o worker pode receber
type WorkerMessage =
  | { type: 'CALCULATE_METRICS'; payload: { patients: Patient[]; appointments: Appointment[] } }
  | { type: 'CALCULATE_RISK'; payload: { consecutiveMisses: number; daysSinceLastSession: number; painChange?: number } }
  | { type: 'EXPORT_DATA'; payload: { patients: any[]; format: 'csv' | 'excel' } };

// Tipos de respostas do worker
type WorkerResponse =
  | { type: 'METRICS_READY'; payload: any }
  | { type: 'RISK_CALCULATED'; payload: { level: string; reasons: string[] } }
  | { type: 'EXPORT_READY'; payload: { data: string; filename: string } }
  | { type: 'ERROR'; payload: { message: string } };

/**
 * Calcula risco de um paciente
 */
function calculateRisk(
  consecutiveMisses: number,
  daysSinceLastSession: number,
  painChange?: number
): { level: string; reasons: string[] } {
  const reasons: string[] = [];
  let riskScore = 0;

  if (consecutiveMisses >= 3) {
    riskScore += 3;
    reasons.push(`${consecutiveMisses} faltas consecutivas`);
  } else if (consecutiveMisses >= 2) {
    riskScore += 2;
    reasons.push(`${consecutiveMisses} faltas consecutivas`);
  }

  if (daysSinceLastSession >= 30) {
    riskScore += 3;
    reasons.push(`${daysSinceLastSession} dias sem sessão`);
  } else if (daysSinceLastSession >= 15) {
    riskScore += 2;
    reasons.push(`${daysSinceLastSession} dias sem sessão`);
  }

  if (painChange && painChange >= 3) {
    riskScore += 3;
    reasons.push(`Piora de dor +${painChange.toFixed(1)}`);
  } else if (painChange && painChange >= 1) {
    riskScore += 2;
    reasons.push(`Piora de dor +${painChange.toFixed(1)}`);
  }

  let level: string;
  if (riskScore >= 5) level = 'high';
  else if (riskScore >= 2) level = 'medium';
  else level = 'low';

  return { level, reasons };
}

/**
 * Calcula métricas de presença
 */
function calculateAttendanceMetrics(
  patientId: string,
  appointments: Appointment[]
) {
  const patientAppointments = appointments
    .filter(apt => apt.patientId === patientId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const completed = patientAppointments.filter(
    apt => apt.status === AppointmentStatus.Completed
  ).length;
  
  const missed = patientAppointments.filter(
    apt => apt.status === AppointmentStatus.NoShow
  ).length;

  const total = completed + missed;
  const attendanceRate = total > 0 ? (completed / total) * 100 : 100;

  let consecutiveMisses = 0;
  for (const apt of patientAppointments) {
    if (apt.status === AppointmentStatus.NoShow) {
      consecutiveMisses++;
    } else if (apt.status === AppointmentStatus.Completed) {
      break;
    }
  }

  const lastSession = patientAppointments.find(
    apt => apt.status === AppointmentStatus.Completed
  );
  const lastSessionDate = lastSession?.startTime || null;
  const daysSinceLastSession = lastSessionDate
    ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    totalSessions: completed,
    totalMisses: missed,
    consecutiveMisses,
    lastSessionDate,
    daysSinceLastSession,
  };
}

/**
 * Processa mensagens recebidas
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'CALCULATE_METRICS': {
        const { patients, appointments } = payload;
        const results = patients.map(patient => {
          const metrics = calculateAttendanceMetrics(patient.id, appointments);
          const risk = calculateRisk(
            metrics.consecutiveMisses,
            metrics.daysSinceLastSession
          );

          return {
            patientId: patient.id,
            ...metrics,
            riskLevel: risk.level,
            riskReasons: risk.reasons,
          };
        });

        const response: WorkerResponse = {
          type: 'METRICS_READY',
          payload: results,
        };
        self.postMessage(response);
        break;
      }

      case 'CALCULATE_RISK': {
        const { consecutiveMisses, daysSinceLastSession, painChange } = payload;
        const risk = calculateRisk(consecutiveMisses, daysSinceLastSession, painChange);

        const response: WorkerResponse = {
          type: 'RISK_CALCULATED',
          payload: risk,
        };
        self.postMessage(response);
        break;
      }

      case 'EXPORT_DATA': {
        const { patients, format } = payload;
        // Processamento pesado de exportação
        const data = format === 'csv' 
          ? patients.map(p => Object.values(p).join(',')).join('\n')
          : JSON.stringify(patients);

        const response: WorkerResponse = {
          type: 'EXPORT_READY',
          payload: {
            data,
            filename: `export-${Date.now()}.${format}`,
          },
        };
        self.postMessage(response);
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'ERROR',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
    self.postMessage(response);
  }
};

// Export vazio para TypeScript reconhecer como módulo
export {};


