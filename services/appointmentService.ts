import { Appointment } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';
import { mockPatients } from '../data/mockData';
import { RecurrenceTemplate, ScheduleBlock, WaitlistStatus, WaitlistEntry, SchedulingAlert } from '../types';
import { supabaseAppointmentService } from './supabase/appointmentServiceSupabase';
import { supabase } from '../lib/supabaseClient';
import { secureLogger } from '../lib/secureLogger';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Verificar se Supabase está disponível e configurado
const isSupabaseEnabled = () => {
    const enabled = supabase !== null && supabase !== undefined;
    secureLogger.debug('isSupabaseEnabled check', { component: 'appointmentService', enabled });
    if (enabled) {
        secureLogger.info('Supabase está configurado e disponível', { component: 'appointmentService' });
    } else {
        secureLogger.warn('Supabase NÃO disponível, usando mock', { component: 'appointmentService' });
    }
    return enabled;
};

export const getAppointments = async (startDate?: Date, endDate?: Date): Promise<Appointment[]> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            secureLogger.debug('getAppointments - Usando Supabase', { component: 'appointmentService' });
            if (startDate && endDate) {
                const appointments = await supabaseAppointmentService.getAppointmentsByDateRange(
                    startDate.toISOString(),
                    endDate.toISOString()
                );
                secureLogger.info('Agendamentos recuperados do Supabase', { 
                    component: 'appointmentService',
                    count: appointments.length,
                    dateRange: { startDate, endDate }
                });
                return appointments;
            } else {
                const appointments = await supabaseAppointmentService.getAllAppointments();
                secureLogger.info('Todos os agendamentos recuperados do Supabase', { 
                    component: 'appointmentService',
                    count: appointments.length
                });
                return appointments;
            }
        } catch (error) {
            secureLogger.error('Erro ao buscar agendamentos do Supabase, usando mock', error, { 
                component: 'appointmentService'
            });
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(500);
    secureLogger.debug('getAppointments - Usando Mock DB', { 
        component: 'appointmentService',
        startDate,
        endDate
    });
    const appointments = db.getAppointments();
    secureLogger.debug('Agendamentos do banco mock', {
        component: 'appointmentService',
        count: appointments.length
    });

    if (startDate && endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const filteredAppointments = [...appointments].filter(app => {
            const appTime = app.startTime.getTime();
            return appTime >= startDate.getTime() && appTime <= endOfDay.getTime();
        });
        secureLogger.debug('Returning filtered appointments from mock', {
            component: 'appointmentService',
            action: 'getAppointments',
            count: filteredAppointments.length
        });
        return filteredAppointments;
    }

    secureLogger.debug('Returning all appointments from mock', {
        component: 'appointmentService',
        action: 'getAppointments',
        count: appointments.length
    });
    return [...appointments];
};

export const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            secureLogger.debug('Getting appointment by ID from Supabase', {
                component: 'appointmentService',
                action: 'getAppointmentById'
            });
            const appointment = await supabaseAppointmentService.getAppointmentById(id);
            if (appointment) {
                secureLogger.debug('Appointment found in Supabase', {
                    component: 'appointmentService',
                    action: 'getAppointmentById'
                });
                return appointment;
            }
            secureLogger.debug('Appointment not found in Supabase', {
                component: 'appointmentService',
                action: 'getAppointmentById'
            });
            return undefined;
        } catch (error) {
            secureLogger.error('Failed to get appointment from Supabase, using mock', error, {
                component: 'appointmentService',
                action: 'getAppointmentById'
            });
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(300);
    secureLogger.debug('Getting appointment by ID from mock', {
        component: 'appointmentService',
        action: 'getAppointmentById'
    });
    const appointments = db.getAppointments();
    secureLogger.debug('Total appointments in mock', {
        component: 'appointmentService',
        action: 'getAppointmentById',
        count: appointments.length
    });

    const appointment = appointments.find(appointment => appointment.id === id);
    if (appointment) {
        secureLogger.debug('Appointment found in mock', {
            component: 'appointmentService',
            action: 'getAppointmentById'
        });
    } else {
        secureLogger.debug('Appointment not found in mock', {
            component: 'appointmentService',
            action: 'getAppointmentById'
        });
    }

    return appointment;
};

export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
    await delay(300);
    return db.getAppointments().filter(a => a.patientId === patientId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export const saveAppointment = async (appointmentData: Appointment): Promise<Appointment> => {
    secureLogger.debug('Saving appointment', {
        component: 'appointmentService',
        action: 'saveAppointment'
    });

    const patient = mockPatients.find(p => p.id === appointmentData.patientId);
    const fullAppointmentData = {
        ...appointmentData,
        patientAvatarUrl: patient?.avatarUrl || ''
    };

    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            secureLogger.info('Saving appointment to Supabase', {
                component: 'appointmentService',
                action: 'saveAppointment',
                appointmentId: fullAppointmentData.id,
                patientId: fullAppointmentData.patientId,
                therapistId: fullAppointmentData.therapistId
            });
            
            // Validar se therapistId é um UUID válido ou está vazio
            // IDs de mock começam com "therapist_" - não são UUIDs válidos
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            if (fullAppointmentData.therapistId && !isValidUUID.test(fullAppointmentData.therapistId)) {
                secureLogger.warn('Invalid therapistId - not a valid UUID', {
                    component: 'appointmentService',
                    action: 'saveAppointment',
                    therapistId: fullAppointmentData.therapistId
                });
                throw new Error(`TherapistId "${fullAppointmentData.therapistId}" não é um UUID válido. Use IDs do Supabase ou deixe vazio.`);
            }
            
            // Se therapistId é inválido mas está vazio/null, converter para undefined
            const dataParaSupabase = {
                ...fullAppointmentData,
                therapistId: fullAppointmentData.therapistId || undefined
            };
            
            // Se o agendamento tem ID que começa com "app_", é um novo agendamento (ID gerado localmente)
            // O Supabase vai gerar um ID próprio (UUID)
            if (fullAppointmentData.id && fullAppointmentData.id.startsWith('app_')) {
                secureLogger.info('Creating new appointment in Supabase', {
                    component: 'appointmentService',
                    action: 'createAppointment'
                });
                const created = await supabaseAppointmentService.createAppointment(dataParaSupabase);
                secureLogger.info('Appointment created successfully', {
                    component: 'appointmentService',
                    action: 'createAppointment',
                    appointmentId: created.id
                });
                eventService.emit('appointments:changed');
                return created;
            } else if (fullAppointmentData.id) {
                secureLogger.info('Updating existing appointment in Supabase', {
                    component: 'appointmentService',
                    action: 'updateAppointment',
                    appointmentId: fullAppointmentData.id
                });
                const updated = await supabaseAppointmentService.updateAppointment(
                    fullAppointmentData.id,
                    dataParaSupabase
                );
                secureLogger.info('Appointment updated successfully', {
                    component: 'appointmentService',
                    action: 'updateAppointment'
                });
                eventService.emit('appointments:changed');
                return updated;
            } else {
                secureLogger.info('Creating new appointment without local ID', {
                    component: 'appointmentService',
                    action: 'createAppointment'
                });
                const created = await supabaseAppointmentService.createAppointment(dataParaSupabase);
                secureLogger.info('Appointment created successfully', {
                    component: 'appointmentService',
                    action: 'createAppointment',
                    appointmentId: created.id
                });
                eventService.emit('appointments:changed');
                return created;
            }
        } catch (error) {
            secureLogger.error('Failed to save appointment to Supabase', error, {
                component: 'appointmentService',
                action: 'saveAppointment'
            });
            secureLogger.warn('Falling back to mock storage', {
                component: 'appointmentService',
                action: 'saveAppointment'
            });
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(400);
    secureLogger.info('Saving appointment to mock database', {
        component: 'appointmentService',
        action: 'saveAppointment'
    });
    db.saveAppointment(fullAppointmentData);
    eventService.emit('appointments:changed');
    secureLogger.info('Appointment saved successfully to mock', {
        component: 'appointmentService',
        action: 'saveAppointment'
    });
    return fullAppointmentData;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            secureLogger.info('Deleting appointment from Supabase', {
                component: 'appointmentService',
                action: 'deleteAppointment'
            });
            await supabaseAppointmentService.deleteAppointment(id);
            secureLogger.info('Appointment deleted successfully', {
                component: 'appointmentService',
                action: 'deleteAppointment'
            });
            eventService.emit('appointments:changed');
            return;
        } catch (error) {
            secureLogger.error('Failed to delete appointment from Supabase, using mock', error, {
                component: 'appointmentService',
                action: 'deleteAppointment'
            });
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(400);
    secureLogger.info('Deleting appointment from mock', {
        component: 'appointmentService',
        action: 'deleteAppointment'
    });
    db.deleteAppointment(id);
    eventService.emit('appointments:changed');
};

export const deleteAppointmentSeries = async (seriesId: string, fromDate: Date): Promise<void> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            secureLogger.info('Deleting appointment series from Supabase', {
                component: 'appointmentService',
                action: 'deleteAppointmentSeries'
            });
            // TODO: Implementar deleteAppointmentSeries no supabaseAppointmentService
            // Por enquanto, usando mock
            secureLogger.warn('deleteAppointmentSeries not yet implemented in Supabase', {
                component: 'appointmentService',
                action: 'deleteAppointmentSeries'
            });
        } catch (error) {
            secureLogger.error('Failed to delete appointment series from Supabase', error, {
                component: 'appointmentService',
                action: 'deleteAppointmentSeries'
            });
        }
    }

    // Usar mock database
    await delay(400);
    secureLogger.info('Deleting appointment series from mock', {
        component: 'appointmentService',
        action: 'deleteAppointmentSeries'
    });
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
