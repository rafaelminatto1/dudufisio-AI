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
  | { type: 'EXPORT_DATA'; payload: { patients: any[]; format: 'csv' | 'excel' } }
  | { type: 'CALCULATE_ASSESSMENT_STATS'; payload: { fieldName: string; data: { value: number; unit?: string; measuredAt?: string }[] } };

// Tipos de respostas do worker
type WorkerResponse =
  | { type: 'METRICS_READY'; payload: any }
  | { type: 'RISK_CALCULATED'; payload: { level: string; reasons: string[] } }
  | { type: 'EXPORT_READY'; payload: { data: string; filename: string } }
  | { type: 'ASSESSMENT_STATS_READY'; payload: { fieldName: string; unit?: string; count: number; min: number; max: number; average: number; latest: number; percentChange: number; trend: 'improving' | 'stable' | 'declining' } }
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

      case 'CALCULATE_ASSESSMENT_STATS': {
        const { fieldName, data } = payload;
        const values = data.map(d => d.value).filter(v => typeof v === 'number');
        const unit = data.find(d => d.unit)?.unit;

        const count = values.length;
        if (count === 0) {
          const response: WorkerResponse = {
            type: 'ASSESSMENT_STATS_READY',
            payload: {
              fieldName,
              unit,
              count: 0,
              min: 0,
              max: 0,
              average: 0,
              latest: 0,
              percentChange: 0,
              trend: 'stable'
            }
          };
          self.postMessage(response);
          break;
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        const average = values.reduce((a, b) => a + b, 0) / count;
        const latest = values[count - 1];
        const first = values[0];
        const percentChange = first !== 0 ? ((latest - first) / first) * 100 : 0;

        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (values.length >= 3) {
          const lastThree = values.slice(-3);
          const isIncreasing = lastThree[2] > lastThree[0];
          const changePercent = Math.abs(((lastThree[2] - lastThree[0]) / lastThree[0]) * 100);
          if (changePercent > 5) {
            trend = isIncreasing ? 'improving' : 'declining';
            if (fieldName.toLowerCase().includes('dor') || fieldName.toLowerCase().includes('edema')) {
              trend = isIncreasing ? 'declining' : 'improving';
            }
          }
        }

        const response: WorkerResponse = {
          type: 'ASSESSMENT_STATS_READY',
          payload: {
            fieldName,
            unit,
            count,
            min,
            max,
            average,
            latest,
            percentChange,
            trend,
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


