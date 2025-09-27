import { SchedulingAlert } from '../../types';
import { db } from '../mockDb';
import { normalizeAppointmentStatus } from './schedulingUtils';

type AlertPayload = Record<string, unknown>;

export interface CreateAlertInput {
  alertType: SchedulingAlert['alertType'];
  patientId?: string;
  appointmentId?: string;
  payload: AlertPayload;
  expiresAt?: Date;
}

function buildAlert(input: CreateAlertInput): SchedulingAlert {
  const now = new Date();
  return {
    id: `alert_${now.getTime()}`,
    alertType: input.alertType,
    patientId: input.patientId,
    appointmentId: input.appointmentId,
    payload: input.payload,
    resolved: false,
    createdAt: now,
    expiresAt: input.expiresAt,
  };
}

export const alertService = {
  listActive(): SchedulingAlert[] {
    return db
      .getSchedulingAlerts()
      .filter(alert => !alert.resolved && (!alert.expiresAt || alert.expiresAt > new Date()));
  },

  create(input: CreateAlertInput): SchedulingAlert {
    const alert = buildAlert(input);
    db.saveSchedulingAlert(alert);
    return alert;
  },

  resolve(alertId: string): void {
    db.resolveSchedulingAlert(alertId);
  },

  delete(alertId: string): void {
    db.deleteSchedulingAlert(alertId);
  },

  patientHasRecentNoShows(patientId: string, threshold: number): boolean {
    const appointments = db
      .getAppointments()
      .filter(appointment => appointment.patientId === patientId);

    const recentNoShows = appointments.filter(appointment => {
      const status = normalizeAppointmentStatus(appointment.status);
      return status === 'no_show';
    });

    return recentNoShows.length >= threshold;
  },

  getPatientAlerts(patientId: string): SchedulingAlert[] {
    return db
      .getSchedulingAlerts()
      .filter(alert => alert.patientId === patientId && !alert.resolved);
  },
};

