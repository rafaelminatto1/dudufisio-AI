import { Patient, PatientAttachment, PatientSummary, PatientStatus, TrackedMetric } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';
import { supabasePatientService } from './supabase/patientServiceSupabase';
import { SupabaseConfigManager } from '../lib/supabaseConfig';
import { secureLogger } from '../lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation, withSupabaseCritical } from '../lib/supabase/errorHandler';
import { supabase } from '../lib/supabaseClient';
import { handleError } from '../lib/middleware/errorHandler';

// Mock data para desenvolvimento
const MOCK_PATIENT_TRACKING_DATA = {
  'patient_001': {
    id: 'patient_001',
    name: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    trackedMetrics: [
      {
        id: 'metric_001',
        name: 'Escala de Dor (EVA)',
        type: 'pain_scale',
        unit: '',
        isActive: true,
        color: '#ef4444',
        targetValue: 3
      },
      {
        id: 'metric_002',
        name: 'Amplitude de Movimento',
        type: 'range_of_motion',
        unit: 'graus',
        isActive: true,
        color: '#3b82f6',
        targetValue: 90
      },
      {
        id: 'metric_003',
        name: 'Força Muscular',
        type: 'muscle_strength',
        unit: 'kg',
        isActive: true,
        color: '#10b981',
        targetValue: 15
      }
    ]
  }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Usar exclusivamente Supabase - sem fallback para mock
const isSupabaseEnabled = true;

export const getRecentPatients = withSupabaseQuery(
    async (): Promise<Patient[]> => {
        if (isSupabaseEnabled) {
            const patients = await supabasePatientService.getAllPatients();
            return [...patients]
                .sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
                .slice(0, 5);
        }

        await delay(200);
        const patients = db.getPatients();
        return [...patients]
            .sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
            .slice(0, 5);
    },
    {
        operation: 'getRecentPatients',
        fallbackMessage: 'Erro ao buscar pacientes recentes'
    }
);

export const getAllPatients = withSupabaseQuery(
    async (): Promise<Patient[]> => {
        if (isSupabaseEnabled) {
            const patients = await supabasePatientService.getAllPatients();
            return [...patients].sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
        }

        await delay(500);
        const patients = db.getPatients();
        const sortedPatients = [...patients].sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
        return sortedPatients;
    },
    {
        operation: 'getAllPatients',
        fallbackMessage: 'Erro ao buscar todos os pacientes'
    }
);

export const searchPatients = withSupabaseCritical(
    async (term: string): Promise<PatientSummary[]> => {
        if (term.length < 2) return [];
        
        if (isSupabaseEnabled) {
            // Implementar timeout
            const TIMEOUT_MS = 10000;
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout na busca')), TIMEOUT_MS)
            );
            
            const searchPromise = supabasePatientService.searchPatients(term);
            const results = await Promise.race([searchPromise, timeoutPromise]);
            
            return results.map(mapPatientToSummary).slice(0, 10);
        }
        
        // Busca mock (código existente mantido)
        await delay(300);
        const lowerTerm = term.toLowerCase();
        const allPatients = db.getPatients();
        
        return allPatients
            .filter(p => p.name.toLowerCase().includes(lowerTerm) || p.cpf.includes(lowerTerm))
            .map(mapPatientToSummary)
            .slice(0, 10); // Return top 10 matches
    },
    {
        operation: 'searchPatients',
        fallbackMessage: 'Erro ao buscar pacientes',
        context: { searchTerm: 'dynamic' } // Será substituído dinamicamente
    }
);

export const quickAddPatient = withSupabaseMutation(
    async (name: string): Promise<Patient> => {
        if (!name || name.trim().length < 3) {
            throw new Error('Nome deve ter pelo menos 3 caracteres');
        }
        
        if (isSupabaseEnabled) {
            // Gerar dados temporários
            const tempPhone = `temp_${Date.now()}`;
            const tempEmail = `temp_${Date.now()}@temp.local`;

            secureLogger.info('Cadastrando paciente rápido', {
                component: 'patientService',
                action: 'createQuickPatient',
                name: name.trim()
            });

            try {
                // 1. PRIMEIRO: Criar usuário na tabela users (obrigatório para foreign keys)
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .insert({
                        full_name: name.trim(),
                        email: tempEmail,
                        phone: tempPhone,
                        role: 'patient', // Importante: marcar como paciente
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (userError) {
                    secureLogger.error('Erro ao criar usuário na tabela users', {
                        component: 'patientService',
                        error: userError
                    });
                    throw userError;
                }

                secureLogger.info('Usuário criado na tabela users', {
                    component: 'patientService',
                    userId: userData.id
                });

                // 2. DEPOIS: Criar dados clínicos na tabela patients usando o MESMO ID
                const { error: patientError } = await supabase
                    .from('patients')
                    .insert({
                        id: userData.id, // CRÍTICO: Usar o mesmo ID do users
                        full_name: name.trim(),
                        name: name.trim(),
                        cpf: null,
                        birth_date: null,
                        phone: tempPhone,
                        email: tempEmail,
                        emergency_contact: { name: '', phone: '' },
                        address: { street: '', city: '', state: '', zip: '' },
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        notes: null,
                        allergies: null,
                        chronic_conditions: null,
                        blood_type: null,
                        health_insurance: null,
                        tags: null
                    });

                if (patientError) {
                    secureLogger.error('Erro ao criar dados clínicos na tabela patients', {
                        component: 'patientService',
                        error: patientError
                    });
                    // Se falhar, deletar o usuário criado para evitar inconsistência
                    await supabase.from('users').delete().eq('id', userData.id);
                    throw patientError;
                }

                // 3. Retornar o paciente completo com o ID do users
                const finalPatient: Patient = {
                    id: userData.id,
                    name: name.trim(),
                    cpf: '',
                    birthDate: '',
                    phone: tempPhone,
                    email: tempEmail,
                    emergencyContact: { name: '', phone: '' },
                    address: { street: '', city: '', state: '', zip: '' },
                    status: PatientStatus.Active,
                    lastVisit: new Date().toISOString(),
                    registrationDate: new Date().toISOString(),
                    avatarUrl: '',
                    consentGiven: true,
                    whatsappConsent: 'opt-out',
                };

                secureLogger.info('Paciente cadastrado com sucesso', {
                    component: 'patientService',
                    action: 'createQuickPatient',
                    userId: userData.id
                });

                return finalPatient;
            } catch (error) {
                secureLogger.error('Erro ao cadastrar paciente rápido', {
                    component: 'patientService',
                    error
                });
                throw error;
            }
        }

        await delay(500);
        const newPatient: Patient = {
            id: `patient_${Date.now()}`,
            name: name.trim(),
            cpf: `TEMP-${Date.now()}`, // Temporary CPF
            birthDate: '',
            phone: '',
            email: '',
            emergencyContact: { name: '', phone: '' },
            address: { street: '', city: '', state: '', zip: '' },
            // FIX: Use PatientStatus enum instead of string literal.
            status: PatientStatus.Active,
            lastVisit: new Date().toISOString(),
            registrationDate: new Date().toISOString(),
            avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
            consentGiven: true, // Assume consent for quick add, to be confirmed later
            whatsappConsent: 'opt-out',
        };
        db.addPatient(newPatient);
        eventService.emit('patients:changed');
        return newPatient;
    },
    {
        operation: 'quickAddPatient',
        fallbackMessage: 'Erro ao cadastrar paciente rapidamente'
    }
);


export const getPatients = async ({ limit = 15, cursor, searchTerm, statusFilter, startDate, endDate, therapistId }: {
    limit?: number;
    cursor?: string | null;
    searchTerm?: string;
    statusFilter?: string;
    startDate?: string;
    endDate?: string;
    therapistId?: string;
}): Promise<{ patients: PatientSummary[]; nextCursor: string | null }> => {
    if (isSupabaseEnabled) {
        let patients = await supabasePatientService.getAllPatients();

        if (therapistId && therapistId !== 'All') {
            patients = await supabasePatientService.getPatientsByTherapist(therapistId);
        }

        const filtered = filterPatientsInMemory(patients, { searchTerm, statusFilter, startDate, endDate });
        return paginatePatients(filtered, { limit, cursor });
    }

    await delay(500);

    let filteredPatients = db.getPatients();

    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredPatients = filteredPatients.filter(patient =>
            patient.name.toLowerCase().includes(lowerSearchTerm) ||
            patient.cpf.includes(lowerSearchTerm)
        );
    }

    if (statusFilter && statusFilter !== 'All') {
        const filterMap = {
            'Active': 'Active',
            'Inactive': 'Inactive',
            'Discharged': 'Discharged',
            'Ativo': 'Active',
            'Inativo': 'Inactive',
            'Alta': 'Discharged',
        };
        const internalStatus = filterMap[statusFilter as keyof typeof filterMap] || statusFilter;
        filteredPatients = filteredPatients.filter(patient => patient.status === internalStatus);
    }
    
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        filteredPatients = filteredPatients.filter(p => new Date(p.registrationDate) >= start);
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        filteredPatients = filteredPatients.filter(p => new Date(p.registrationDate) <= end);
    }
    
    if (therapistId && therapistId !== 'All') {
        const appointmentsForTherapist = db.getAppointments().filter(app => app.therapistId === therapistId);
        const patientIds = new Set(appointmentsForTherapist.map(app => app.patientId));
        filteredPatients = filteredPatients.filter(p => patientIds.has(p.id));
    }


    filteredPatients.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime();
        const dateB = new Date(b.registrationDate).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return a.id.localeCompare(b.id);
    });

    const startIndex = cursor ? filteredPatients.findIndex(p => p.id === cursor) + 1 : 0;

    if (cursor && startIndex === 0) {
        return { patients: [], nextCursor: null };
    }

    const patientSlice = filteredPatients.slice(startIndex, startIndex + limit);
    
    const nextCursor = patientSlice.length === limit && patientSlice.length > 0 ? patientSlice[patientSlice.length - 1]!.id : null;

    const patientSummaries: PatientSummary[] = patientSlice.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        status: p.status,
        lastVisit: p.lastVisit,
        avatarUrl: p.avatarUrl,
        medicalAlerts: p.medicalAlerts,
    }));

    return { patients: patientSummaries, nextCursor };
};

export const getPatientById = withSupabaseQuery(
    async (id: string): Promise<Patient | undefined> => {
        if (isSupabaseEnabled) {
            const patient = await supabasePatientService.getPatientById(id);
            // Adicionar dados de tracking mock se disponível
            const mockData = MOCK_PATIENT_TRACKING_DATA[id as keyof typeof MOCK_PATIENT_TRACKING_DATA];
            if (mockData && patient) {
                patient.trackedMetrics = mockData.trackedMetrics;
            }
            return patient ?? undefined;
        }

        await delay(300);
        const patient = db.getPatientById(id);
        // Adicionar dados de tracking mock se disponível
        const mockData = MOCK_PATIENT_TRACKING_DATA[id as keyof typeof MOCK_PATIENT_TRACKING_DATA];
        if (mockData && patient) {
            patient.trackedMetrics = mockData.trackedMetrics;
        }
        return patient;
    },
    {
        operation: 'getPatientById',
        fallbackMessage: 'Erro ao buscar paciente'
    }
);

export const addPatient = withSupabaseMutation(
    async (patientData: Omit<Patient, 'id' | 'lastVisit'>): Promise<Patient> => {
        if (isSupabaseEnabled) {
            const now = new Date().toISOString();
            const payload: Omit<Patient, 'id'> = {
                ...patientData,
                lastVisit: now,
                registrationDate: patientData.registrationDate ?? now,
            };

            const created = await supabasePatientService.createPatient(payload);
            eventService.emit('patients:changed');
            return created;
        }

        await delay(400);
        const newPatient: Patient = {
            id: `patient_${Date.now()}`,
            ...patientData,
            lastVisit: new Date().toISOString(),
        };
        db.addPatient(newPatient);
        eventService.emit('patients:changed');
        return newPatient;
    },
    {
        operation: 'addPatient',
        fallbackMessage: 'Erro ao cadastrar paciente'
    }
);

export const updatePatient = withSupabaseMutation(
    async (updatedPatient: Patient): Promise<Patient> => {
        if (isSupabaseEnabled) {
            const updated = await supabasePatientService.updatePatient(updatedPatient.id, updatedPatient);
            eventService.emit('patients:changed');
            return updated;
        }

        await delay(400);
        db.updatePatient(updatedPatient);
        eventService.emit('patients:changed');
        return updatedPatient;
    },
    {
        operation: 'updatePatient',
        fallbackMessage: 'Erro ao atualizar paciente'
    }
);

export const addAttachment = async (patientId: string, file: File): Promise<PatientAttachment> => {
    if (isSupabaseEnabled) {
        throw new Error('Upload de anexos ainda não suportado via Supabase.');
    }

    await delay(600);
    const patient = db.getPatientById(patientId);
    if (!patient) {
        throw new Error('Paciente não encontrado.');
    }

    const newAttachment: PatientAttachment = {
        name: file.name,
        url: '#',
        type: file.type,
        size: file.size,
    };

    const updatedPatient = {
        ...patient,
        attachments: [...(patient.attachments || []), newAttachment],
    };
    
    db.updatePatient(updatedPatient);
    eventService.emit('patients:changed');
    
    return newAttachment;
};

const mapPatientToSummary = (patient: Patient): PatientSummary => ({
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    status: patient.status,
    lastVisit: patient.lastVisit,
    avatarUrl: patient.avatarUrl,
    medicalAlerts: patient.medicalAlerts,
    cpf: patient.cpf,
});

interface PatientFilterOptions {
    searchTerm?: string;
    statusFilter?: string;
    startDate?: string;
    endDate?: string;
}

const filterPatientsInMemory = (patients: Patient[], filters: PatientFilterOptions): Patient[] => {
    const { searchTerm, statusFilter, startDate, endDate } = filters;
    let filtered = [...patients];

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter(patient =>
            patient.name.toLowerCase().includes(lower) ||
            patient.cpf.includes(lower)
        );
    }

    if (statusFilter && statusFilter !== 'All') {
        const map: Record<string, PatientStatus> = {
            Active: PatientStatus.Active,
            Inactive: PatientStatus.Inactive,
            Discharged: PatientStatus.Discharged,
            Ativo: PatientStatus.Active,
            Inativo: PatientStatus.Inactive,
            Alta: PatientStatus.Discharged,
        };
        const targetStatus = map[statusFilter] ?? statusFilter;
        filtered = filtered.filter(patient => patient.status === targetStatus);
    }

    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filtered = filtered.filter(p => new Date(p.registrationDate) >= start);
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(p => new Date(p.registrationDate) <= end);
    }

    return filtered.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime();
        const dateB = new Date(b.registrationDate).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return a.id.localeCompare(b.id);
    });
};

const paginatePatients = (
    patients: Patient[],
    { limit = 15, cursor }: { limit?: number; cursor?: string | null }
): { patients: PatientSummary[]; nextCursor: string | null } => {
    let startIndex = 0;
    if (cursor) {
        const index = patients.findIndex(p => p.id === cursor);
        if (index === -1) {
            return { patients: [], nextCursor: null };
        }
        startIndex = index + 1;
    }

    const slice = patients.slice(startIndex, startIndex + limit);
    const nextCursor = slice.length === limit ? slice[slice.length - 1]?.id ?? null : null;

    return {
        patients: slice.map(mapPatientToSummary),
        nextCursor,
    };
};

// Funções removidas - campos não existem no schema atual do Supabase

// Funções de patologia removidas - campos não existem no schema atual

// ============================================================================
// COMMUNICATION LOGS & PAIN POINTS - HELPER FUNCTIONS
// ============================================================================

/**
 * Adiciona um log de comunicação ao paciente
 * Atualiza o campo communication_logs (JSONB) no Supabase
 */
export async function addCommunicationLog(
  patientId: string,
  logData: Omit<import('../types').CommunicationLog, 'id'>
): Promise<void> {
  try {
    // Buscar patient atual para pegar logs existentes
    const patient = await getPatientById(patientId);
    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    const existingLogs = patient.communicationLogs || [];
    const newLog: import('../types').CommunicationLog = {
      id: `log_${Date.now()}`,
      ...logData,
    };

    const updatedLogs = [...existingLogs, newLog];

    // Atualizar no Supabase
    const { error } = await supabase
      .from('patients')
      .update({ communication_logs: updatedLogs })
      .eq('id', patientId);

    if (error) {
      secureLogger.error('Failed to add communication log', error, {
        component: 'patientService',
        action: 'addCommunicationLog'
      });
      throw new Error('Falha ao adicionar log de comunicação');
    }
  } catch (error) {
    secureLogger.error('Error in addCommunicationLog', error, {
      component: 'patientService',
      action: 'addCommunicationLog'
    });
    throw error;
  }
}

/**
 * Salva/atualiza os pontos de dor do paciente
 * Atualiza o campo pain_points (JSONB) no Supabase
 */
export async function savePainPoints(
  patientId: string,
  painPoints: import('../types').PainPoint[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from('patients')
      .update({ pain_points: painPoints })
      .eq('id', patientId);

    if (error) {
      secureLogger.error('Failed to save pain points', error, {
        component: 'patientService',
        action: 'savePainPoints'
      });
      throw new Error('Falha ao salvar pontos de dor');
    }
  } catch (error) {
    secureLogger.error('Error in savePainPoints', error, {
      component: 'patientService',
      action: 'savePainPoints'
    });
    throw error;
  }
}