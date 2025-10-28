import { Appointment } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';
import { mockPatients } from '../data/mockData';
import { RecurrenceTemplate, ScheduleBlock, WaitlistStatus, WaitlistEntry, SchedulingAlert } from '../types';
import { supabaseAppointmentService } from './supabase/appointmentServiceSupabase';
import { supabase } from '../lib/supabaseClient';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Verificar se Supabase está disponível e configurado
const isSupabaseEnabled = () => {
    const enabled = supabase !== null && supabase !== undefined;
    console.log('🔍 isSupabaseEnabled:', enabled);
    if (enabled) {
        console.log('✅ Supabase está configurado e disponível');
    } else {
        console.log('⚠️ Supabase NÃO disponível, usando mock');
    }
    return enabled;
};

export const getAppointments = async (startDate?: Date, endDate?: Date): Promise<Appointment[]> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            console.log('🔍 getAppointments - Usando Supabase');
            if (startDate && endDate) {
                const appointments = await supabaseAppointmentService.getAppointmentsByDateRange(
                    startDate.toISOString(),
                    endDate.toISOString()
                );
                console.log('📋 Agendamentos do Supabase:', appointments.length);
                return appointments;
            } else {
                const appointments = await supabaseAppointmentService.getAllAppointments();
                console.log('📋 Todos os agendamentos do Supabase:', appointments.length);
                return appointments;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar agendamentos do Supabase, usando mock:', error);
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(500);
    console.log('🔍 getAppointments - Usando Mock DB - Parâmetros:', { startDate, endDate });
    const appointments = db.getAppointments();
    console.log('📋 Todos os agendamentos no banco mock:', appointments);

    if (startDate && endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const filteredAppointments = [...appointments].filter(app => {
            const appTime = app.startTime.getTime();
            return appTime >= startDate.getTime() && appTime <= endOfDay.getTime();
        });
        console.log('📅 Agendamentos filtrados (mock):', filteredAppointments);
        return filteredAppointments;
    }

    console.log('📋 Retornando todos os agendamentos (mock):', appointments);
    return [...appointments];
};

export const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            console.log('🔍 getAppointmentById - Usando Supabase - ID:', id);
            const appointment = await supabaseAppointmentService.getAppointmentById(id);
            if (appointment) {
                console.log('✅ Agendamento encontrado no Supabase:', appointment);
                return appointment;
            }
            console.log('❌ Agendamento não encontrado no Supabase');
            return undefined;
        } catch (error) {
            console.error('❌ Erro ao buscar agendamento do Supabase, usando mock:', error);
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(300);
    console.log('🔍 getAppointmentById - Usando Mock DB - ID:', id);
    const appointments = db.getAppointments();
    console.log('📋 getAppointmentById - Total de agendamentos (mock):', appointments.length);
    console.log('📋 getAppointmentById - IDs disponíveis (mock):', appointments.map(a => a.id));
    
    const appointment = appointments.find(appointment => appointment.id === id);
    if (appointment) {
        console.log('✅ getAppointmentById - Agendamento encontrado (mock):', appointment);
    } else {
        console.log('❌ getAppointmentById - Agendamento não encontrado (mock) para ID:', id);
    }
    
    return appointment;
};

export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
    await delay(300);
    return db.getAppointments().filter(a => a.patientId === patientId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export const saveAppointment = async (appointmentData: Appointment): Promise<Appointment> => {
    console.log('🔍 appointmentService.saveAppointment - Dados recebidos:', appointmentData);
    
    const patient = mockPatients.find(p => p.id === appointmentData.patientId);
    const fullAppointmentData = {
        ...appointmentData,
        patientAvatarUrl: patient?.avatarUrl || ''
    };

    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            console.log('💾 appointmentService - Salvando no Supabase:', fullAppointmentData);
            console.log('   ID do agendamento:', fullAppointmentData.id);
            // SEGURO: Log sem expor nome do paciente
            console.log('   Paciente ID:', fullAppointmentData.patientId);
            console.log('   Horário:', fullAppointmentData.startTime);
            console.log('   TherapistId:', fullAppointmentData.therapistId);
            
            // Validar se therapistId é um UUID válido ou está vazio
            // IDs de mock começam com "therapist_" - não são UUIDs válidos
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            if (fullAppointmentData.therapistId && !isValidUUID.test(fullAppointmentData.therapistId)) {
                console.warn('⚠️ therapistId não é um UUID válido:', fullAppointmentData.therapistId);
                console.warn('   Isso é um ID de mock. Não vou salvar no Supabase.');
                console.warn('   Use dados reais do Supabase ou deixe o therapistId vazio.');
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
                console.log('   → Criando NOVO agendamento no Supabase');
                const created = await supabaseAppointmentService.createAppointment(dataParaSupabase);
                console.log('✅ appointmentService - Agendamento CRIADO no Supabase com ID:', created.id);
                console.log('   Dados salvos:', created);
                eventService.emit('appointments:changed');
                return created;
            } else if (fullAppointmentData.id) {
                console.log('   → Atualizando agendamento existente no Supabase');
                const updated = await supabaseAppointmentService.updateAppointment(
                    fullAppointmentData.id,
                    dataParaSupabase
                );
                console.log('✅ appointmentService - Agendamento ATUALIZADO no Supabase');
                eventService.emit('appointments:changed');
                return updated;
            } else {
                console.log('   → Criando NOVO agendamento (sem ID local)');
                const created = await supabaseAppointmentService.createAppointment(dataParaSupabase);
                console.log('✅ appointmentService - Agendamento CRIADO no Supabase com ID:', created.id);
                eventService.emit('appointments:changed');
                return created;
            }
        } catch (error) {
            console.error('❌ appointmentService - Erro ao salvar no Supabase:', error);
            console.error('   Detalhes do erro:', JSON.stringify(error, null, 2));
            console.warn('⚠️ FALLBACK: Salvando apenas no mock (dados não persistirão após reload)');
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(400);
    console.log('💾 Salvando no banco de dados mock:', fullAppointmentData);
    db.saveAppointment(fullAppointmentData);
    console.log('📢 Emitindo evento appointments:changed');
    eventService.emit('appointments:changed');
    console.log('✅ Agendamento salvo com sucesso no mock');
    return fullAppointmentData;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            console.log('🗑️ Deletando agendamento do Supabase - ID:', id);
            await supabaseAppointmentService.deleteAppointment(id);
            console.log('✅ Agendamento deletado do Supabase');
            eventService.emit('appointments:changed');
            return;
        } catch (error) {
            console.error('❌ Erro ao deletar do Supabase, usando mock:', error);
            // Fallback para mock se houver erro
        }
    }

    // Usar mock database (desenvolvimento local ou fallback)
    await delay(400);
    console.log('🗑️ Deletando agendamento do mock - ID:', id);
    db.deleteAppointment(id);
    eventService.emit('appointments:changed');
};

export const deleteAppointmentSeries = async (seriesId: string, fromDate: Date): Promise<void> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            console.log('🗑️ Deletando série de agendamentos do Supabase - seriesId:', seriesId);
            // TODO: Implementar deleteAppointmentSeries no supabaseAppointmentService
            // Por enquanto, usando mock
            console.warn('⚠️ deleteAppointmentSeries ainda não implementado no Supabase, usando mock');
        } catch (error) {
            console.error('❌ Erro ao deletar série do Supabase:', error);
        }
    }

    // Usar mock database
    await delay(400);
    console.log('🗑️ Deletando série de agendamentos do mock');
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
