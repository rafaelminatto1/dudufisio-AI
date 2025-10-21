import { Appointment } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';
import { mockPatients } from '../data/mockData';
import { RecurrenceTemplate, ScheduleBlock, WaitlistStatus, WaitlistEntry, SchedulingAlert } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAppointments = async (startDate?: Date, endDate?: Date): Promise<Appointment[]> => {
    await delay(500);
    console.log('🔍 getAppointments - Parâmetros:', { startDate, endDate });
    const appointments = db.getAppointments();
    console.log('📋 Todos os agendamentos no banco:', appointments);

    if (startDate && endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const filteredAppointments = [...appointments].filter(app => {
            const appTime = app.startTime.getTime();
            return appTime >= startDate.getTime() && appTime <= endOfDay.getTime();
        });
        console.log('📅 Agendamentos filtrados:', filteredAppointments);
        return filteredAppointments;
    }

    console.log('📋 Retornando todos os agendamentos:', appointments);
    return [...appointments];
};

export const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
    await delay(300);
    return db.getAppointments().find(appointment => appointment.id === id);
};

export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
    await delay(300);
    return db.getAppointments().filter(a => a.patientId === patientId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export const saveAppointment = async (appointmentData: Appointment): Promise<Appointment> => {
    await delay(400);
    console.log('🔍 appointmentService.saveAppointment - Dados recebidos:', appointmentData);
    const patient = mockPatients.find(p => p.id === appointmentData.patientId);
    const fullAppointmentData = {
        ...appointmentData,
        patientAvatarUrl: patient?.avatarUrl || ''
    };

    console.log('💾 Salvando no banco de dados:', fullAppointmentData);
    db.saveAppointment(fullAppointmentData);
    console.log('📢 Emitindo evento appointments:changed');
    eventService.emit('appointments:changed');
    console.log('✅ Agendamento salvo com sucesso no serviço');
    return fullAppointmentData;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    await delay(400);
    db.deleteAppointment(id);
    eventService.emit('appointments:changed');
};

export const deleteAppointmentSeries = async (seriesId: string, fromDate: Date): Promise<void> => {
    await delay(400);
    db.deleteAppointmentSeries(seriesId, fromDate);
    eventService.emit('appointments:changed');
}

export const listRecurrenceTemplates = async (): Promise<RecurrenceTemplate[]> => {
  await delay(200);
  return db.getRecurrenceTemplates();
};

export const listScheduleBlocks = async (): Promise<ScheduleBlock[]> => {
  await delay(200);
  return db.getScheduleBlocks();
};

export const listWaitlistEntries = async (status: WaitlistStatus = 'waiting'): Promise<WaitlistEntry[]> => {
  await delay(200);
  return db.getWaitlistEntries().filter(entry => entry.status === status);
};

export const listActiveAlerts = async (): Promise<SchedulingAlert[]> => {
  await delay(100);
  return db.getSchedulingAlerts().filter(alert => !alert.resolved);
};
