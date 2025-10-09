import { db } from '../mockDb';
import { normalizeAppointmentStatus } from './schedulingUtils';
function buildAlert(input) {
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
    listActive() {
        return db
            .getSchedulingAlerts()
            .filter(alert => !alert.resolved && (!alert.expiresAt || alert.expiresAt > new Date()));
    },
    create(input) {
        const alert = buildAlert(input);
        db.saveSchedulingAlert(alert);
        return alert;
    },
    resolve(alertId) {
        db.resolveSchedulingAlert(alertId);
    },
    delete(alertId) {
        db.deleteSchedulingAlert(alertId);
    },
    patientHasRecentNoShows(patientId, threshold) {
        const appointments = db
            .getAppointments()
            .filter(appointment => appointment.patientId === patientId);
        const recentNoShows = appointments.filter(appointment => {
            const status = normalizeAppointmentStatus(appointment.status);
            return status === 'no_show';
        });
        return recentNoShows.length >= threshold;
    },
    getPatientAlerts(patientId) {
        return db
            .getSchedulingAlerts()
            .filter(alert => alert.patientId === patientId && !alert.resolved);
    },
};
