import { Patient, PatientAttachment, PatientSummary, PatientStatus, TrackedMetric } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';
import { supabasePatientService } from './supabase/patientServiceSupabase';
import { SupabaseConfigManager } from '../lib/supabaseConfig';
import { secureLogger } from '../lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation, withSupabaseCritical } from '../lib/supabase/errorHandler';
import { supabase } from '../lib/supabaseClient';
import { handleError } from '../lib/middleware/errorHandler';

const forceMockSupabase = (
  typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FORCE_MOCK_SUPABASE === 'true'
) || (typeof process !== 'undefined' && process.env?.VITE_FORCE_MOCK_SUPABASE === 'true');

const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

let supabaseManager: SupabaseConfigManager | null = null;
try {
  supabaseManager = SupabaseConfigManager.getInstance();
} catch (error) {
  if (secureLogger?.warn) {
    secureLogger.warn('Falha ao carregar SupabaseConfigManager para detectar credenciais', {
      component: 'patientService',
      error
    });
  } else {
    console.warn('[patientService] Falha ao carregar SupabaseConfigManager', error);
  }
}

const hasSupabaseCredentials = supabaseManager?.hasValidCredentials?.() ?? false;

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
const isSupabaseEnabled = !forceMockSupabase && !isTestEnv && hasSupabaseCredentials;

const buildPatientPayload = (data: Partial<Patient> & { name: string }): Omit<Patient, 'id' | 'lastVisit'> => {
    const timestamp = data.registrationDate ?? new Date().toISOString();
    return {
        name: data.name.trim(),
        cpf: data.cpf ?? '',
        birthDate: data.birthDate ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        emergencyContact: data.emergencyContact ?? { name: '', phone: '' },
        address: data.address ?? { street: '', city: '', state: '', zip: '' },
        status: data.status ?? PatientStatus.Active,
        registrationDate: timestamp,
        avatarUrl: data.avatarUrl ?? '',
        consentGiven: data.consentGiven ?? true,
        whatsappConsent: data.whatsappConsent ?? 'opt-out',
        medicalAlerts: data.medicalAlerts,
        observations: data.observations,
        allergies: data.allergies,
        conditions: data.conditions,
        trackedMetrics: data.trackedMetrics,
        communicationLogs: data.communicationLogs,
        attachments: data.attachments,
        insurance: data.insurance,
        insuranceType: data.insuranceType,
        blood_type: data.blood_type,
        painPoints: data.painPoints,
        tags: data.tags,
        surgeries: data.surgeries,
    };
};

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
    async (name: string, phone?: string): Promise<Patient> => {
        if (!name || name.trim().length < 3) {
            throw new Error('Nome deve ter pelo menos 3 caracteres');
        }

        if (isSupabaseEnabled) {
            // Usar telefone fornecido ou gerar temporário
            const patientPhone = phone && phone.trim() ? phone.trim() : `temp_${Date.now()}`;
            const tempEmail = `temp_${Date.now()}@temp.local`;

            secureLogger.info('Cadastrando paciente rápido', {
                component: 'patientService',
                action: 'createQuickPatient',
                name: name.trim(),
                phone: patientPhone
            });

            try {
                // Criar paciente diretamente na tabela patients (schema atual do Supabase)
                const { data: patientData, error: patientError } = await supabase
                    .from('patients')
                    .insert({
                        full_name: name.trim(),
                        phone: patientPhone,
                        email: tempEmail,
                        emergency_contact: { name: '', phone: '' },
                        address: {},
                        status: 'active'
                    })
                    .select()
                    .single();

                if (patientError) {
                    secureLogger.error('Erro ao criar paciente na tabela patients', {
                        component: 'patientService',
                        error: patientError
                    });
                    throw patientError;
                }

                secureLogger.info('Paciente cadastrado com sucesso', {
                    component: 'patientService',
                    action: 'createQuickPatient',
                    patientId: patientData.id
                });

                // Retornar o paciente no formato esperado pela aplicação
                const finalPatient: Patient = {
                    id: patientData.id,
                    name: name.trim(),
                    cpf: patientData.cpf || '',
                    birthDate: patientData.birth_date || '',
                    phone: patientPhone,
                    email: tempEmail,
                    emergencyContact: { name: '', phone: '' },
                    address: { street: '', city: '', state: '', zip: '' },
                    status: PatientStatus.Active,
                    lastVisit: new Date().toISOString(),
                    registrationDate: patientData.created_at || new Date().toISOString(),
                    avatarUrl: '',
                    consentGiven: true,
                    whatsappConsent: 'opt-out',
                };

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

    if (patientData.cpf) {
        const duplicate = db.getPatients().some(existing => existing.cpf === patientData.cpf);
        if (duplicate) {
            throw new Error('CPF já cadastrado');
        }
    }

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

export const createPatient = (patientData: Partial<Patient> & { name: string }): Promise<Patient> => {
    const payload = buildPatientPayload(patientData);
    return addPatient(payload);
};

export const updatePatient = withSupabaseMutation(
    async (patientOrId: Patient | string, updates?: Partial<Patient>): Promise<Patient> => {
        const normalized = await (async () => {
            if (typeof patientOrId === 'string') {
                if (!updates) {
                    throw new Error('É necessário fornecer os campos a atualizar quando o ID é utilizado.');
                }
                const existing = await getPatientById(patientOrId);
                if (!existing) {
                    throw new Error('Paciente não encontrado');
                }
                return { ...existing, ...updates };
            }
            return patientOrId;
        })();

        if (isSupabaseEnabled) {
            const updated = await supabasePatientService.updatePatient(normalized.id, normalized);
            eventService.emit('patients:changed');
            return updated;
        }

        await delay(400);
        db.updatePatient(normalized);
        eventService.emit('patients:changed');
        return normalized;
    },
    {
        operation: 'updatePatient',
        fallbackMessage: 'Erro ao atualizar paciente'
    }
);

export const deletePatient = withSupabaseMutation(
    async (patientId: string): Promise<void> => {
        if (isSupabaseEnabled) {
            await supabasePatientService.deletePatient(patientId);
        } else {
            await delay(300);
            db.deletePatient(patientId);
        }
        eventService.emit('patients:changed');
    },
    {
        operation: 'deletePatient',
        fallbackMessage: 'Erro ao remover paciente'
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