/**
 * contexts/PatientContext.tsx
 * Context profissional para gerenciamento de pacientes
 * Inclui: CRUD completo, persistência localStorage, validação, cache e otimizações
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Patient, PatientFormData } from '../types/patient';
import { patientToasts } from '../utils/toast';
import { handleError } from '../lib/middleware/errorHandler';

// ============================================================================
// TYPES
// ============================================================================

interface PatientContextType {
  // State
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD Operations
  createPatient: (patient: PatientFormData) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<PatientFormData>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  getAllPatients: () => Promise<Patient[]>;
  
  // Search & Filter
  searchPatients: (query: string) => Patient[];
  filterPatients: (filters: PatientFilters) => Patient[];
  
  // State Management
  setCurrentPatient: (patient: Patient | null) => void;
  clearError: () => void;
  refreshPatients: () => Promise<void>;
  
  // Validation
  validateUniqueCPF: (cpf: string, excludeId?: string) => boolean;
  validateUniqueEmail: (email: string, excludeId?: string) => boolean;
}

export interface PatientFilters {
  status?: string[];
  gender?: string[];
  hasOutstandingBalance?: boolean;
  minAge?: number;
  maxAge?: number;
  searchQuery?: string;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEY = 'dudufisio_patients';
const CACHE_VERSION = '1.0.0';

// ============================================================================
// CONTEXT
// ============================================================================

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Carrega pacientes do localStorage com fallback para mock data
 */
function loadPatientsFromStorage(): Patient[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.version === CACHE_VERSION) {
        return data.patients;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar pacientes do storage:', error);
  }
  
  // Retornar mock data inicial se não houver dados salvos
  return getMockPatients();
}

/**
 * Salva pacientes no localStorage
 */
function savePatientsToStorage(patients: Patient[]): void {
  try {
    const data = {
      version: CACHE_VERSION,
      patients,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar pacientes no storage:', error);
  }
}

/**
 * Converte PatientFormData para Patient
 */
function convertFormDataToPatient(formData: PatientFormData, existingPatient?: Patient): Patient {
  const now = new Date().toISOString();
  const birthDate = new Date(formData.birthDate);
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Calcular BMI se altura e peso estiverem disponíveis
  let bmi: number | undefined;
  if (formData.height && formData.weight) {
    bmi = formData.weight / ((formData.height / 100) ** 2);
  }
  
  const patient: Patient = {
    // ID e código
    id: existingPatient?.id || `PAT-${Date.now()}`,
    code: existingPatient?.code || `PAC-${String(Date.now()).slice(-6)}`,
    
    // Dados pessoais
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    phone2: formData.phone2,
    cpf: formData.cpf,
    rg: formData.rg,
    birthDate: formData.birthDate,
    age,
    gender: formData.gender,
    maritalStatus: formData.maritalStatus,
    occupation: formData.occupation,
    avatarUrl: existingPatient?.avatarUrl,
    
    // Endereço
    address: {
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'Brasil',
    },
    
    // Contato de emergência
    emergencyContact: {
      name: formData.emergencyName,
      relationship: formData.emergencyRelationship,
      phone: formData.emergencyPhone,
      phone2: formData.emergencyPhone2,
      email: formData.emergencyEmail,
    },
    
    // Dados físicos e saúde
    bloodType: formData.bloodType,
    height: formData.height,
    weight: formData.weight,
    bmi,
    
    // Histórico médico
    medicalHistory: {
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
      chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()) : [],
      previousSurgeries: formData.previousSurgeries ? formData.previousSurgeries.split(',').map(s => s.trim()) : [],
      currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(s => s.trim()) : [],
      familyHistory: formData.familyHistory ? formData.familyHistory.split(',').map(s => s.trim()) : [],
      smokingStatus: formData.smokingStatus,
      alcoholConsumption: formData.alcoholConsumption,
      physicalActivityLevel: formData.physicalActivityLevel,
      observations: formData.observations,
    },
    
    // Condições e tratamento
    conditions: formData.conditions ? formData.conditions.split(',').map(c => ({
      id: `COND-${Date.now()}-${Math.random()}`,
      name: c.trim(),
      diagnosisDate: now,
      severity: 'moderate' as const,
      status: 'active' as const,
    })) : existingPatient?.conditions || [],
    mainDiagnosis: formData.mainDiagnosis,
    referringDoctor: formData.referringDoctor,
    referringDoctorCRM: formData.referringDoctorCRM,
    
    // Status e datas
    status: formData.status,
    registrationDate: existingPatient?.registrationDate || now.split('T')[0],
    firstAppointmentDate: existingPatient?.firstAppointmentDate,
    lastAppointmentDate: existingPatient?.lastAppointmentDate,
    
    // Progresso de sessões (manter dados existentes ou inicializar)
    sessionProgress: existingPatient?.sessionProgress || {
      currentSession: 0,
      totalPlannedSessions: formData.totalPlannedSessions || 0,
      completedSessions: 0,
      canceledSessions: 0,
      noShowSessions: 0,
      firstSessionDate: now,
      weeksInTreatment: 0,
      daysInTreatment: 0,
      averageSessionsPerWeek: 0,
      adherenceRate: 100,
    },
    
    // Métricas de tratamento (manter dados existentes ou inicializar)
    treatmentMetrics: existingPatient?.treatmentMetrics || {
      painLevel: {
        initial: 0,
        current: 0,
        improvement: 0,
      },
      mobility: {
        initial: 0,
        current: 0,
        improvement: 0,
      },
      functionality: {
        initial: 0,
        current: 0,
        improvement: 0,
      },
      satisfaction: 0,
      goals: [],
      goalsAchieved: 0,
    },
    
    // Convênio
    insurance: {
      type: formData.insuranceType,
      provider: formData.insuranceProvider,
      planName: formData.insurancePlanName,
      policyNumber: formData.insurancePolicyNumber,
      validUntil: formData.insuranceValidUntil,
    },
    
    // Informações financeiras (manter dados existentes ou inicializar)
    financialInfo: existingPatient?.financialInfo || {
      totalSpent: 0,
      totalPending: 0,
      totalPaid: 0,
      averageSessionCost: 0,
      paymentMethod: 'cash',
      hasOutstandingBalance: false,
      outstandingBalance: 0,
    },
    
    // Observações
    observations: formData.observations,
    internalNotes: formData.internalNotes,
    
    // Preferências
    preferredDaysOfWeek: formData.preferredDaysOfWeek,
    preferredTimeSlots: formData.preferredTimeSlots,
    
    // Documentos e consentimentos
    hasConsentForm: formData.hasConsentForm,
    hasDataPrivacyConsent: formData.hasDataPrivacyConsent,
    documents: existingPatient?.documents || [],
    
    // Metadata
    createdBy: existingPatient?.createdBy || 'system',
    createdAt: existingPatient?.createdAt || now,
    updatedBy: 'system',
    updatedAt: now,
    tags: existingPatient?.tags || [],
  };
  
  return patient;
}

/**
 * Obtém mock data inicial
 */
function getMockPatients(): Patient[] {
  // Retornar pacientes de exemplo para demonstração
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  
  return [
    {
      id: 'PAT-001',
      code: 'PAC-001',
      name: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-1111',
      phone2: '(11) 3333-1111',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      birthDate: '1985-03-15',
      age: 39,
      gender: 'male',
      maritalStatus: 'married',
      occupation: 'Engenheiro',
      avatarUrl: 'https://i.pravatar.cc/150?u=001',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil',
      },
      emergencyContact: {
        name: 'Maria Silva',
        relationship: 'Esposa',
        phone: '(11) 99999-2222',
        phone2: '(11) 3333-2222',
        email: 'maria.silva@email.com',
      },
      bloodType: 'O+',
      height: 175,
      weight: 80,
      bmi: 26.1,
      medicalHistory: {
        allergies: ['Penicilina'],
        chronicDiseases: ['Hipertensão'],
        previousSurgeries: [],
        currentMedications: ['Losartana 50mg'],
        familyHistory: ['Diabetes'],
        smokingStatus: 'never',
        alcoholConsumption: 'occasional',
        physicalActivityLevel: 'moderate',
        observations: 'Paciente apresenta histórico de dores lombares recorrentes.',
      },
      conditions: [
        {
          id: 'COND-001',
          name: 'Dor lombar crônica',
          diagnosisDate: '2024-01-10',
          severity: 'moderate',
          status: 'active',
        },
        {
          id: 'COND-002',
          name: 'Hérnia de disco L4-L5',
          diagnosisDate: '2024-01-15',
          severity: 'moderate',
          status: 'active',
        },
      ],
      mainDiagnosis: 'Hérnia de disco L4-L5 com compressão radicular',
      referringDoctor: 'Dr. Carlos Oliveira',
      referringDoctorCRM: 'CRM-SP 123456',
      status: 'Active',
      registrationDate: '2024-01-05',
      firstAppointmentDate: '2024-01-10',
      lastAppointmentDate: '2024-10-08',
      sessionProgress: {
        currentSession: 15,
        totalPlannedSessions: 20,
        completedSessions: 15,
        canceledSessions: 2,
        noShowSessions: 1,
        firstSessionDate: '2024-01-10',
        weeksInTreatment: 39,
        daysInTreatment: 273,
        averageSessionsPerWeek: 2.3,
        adherenceRate: 83.3,
      },
      treatmentMetrics: {
        painLevel: {
          initial: 8,
          current: 4,
          improvement: 50,
        },
        mobility: {
          initial: 5,
          current: 7,
          improvement: 40,
        },
        functionality: {
          initial: 4,
          current: 8,
          improvement: 100,
        },
        satisfaction: 85,
        goals: ['Reduzir dor', 'Melhorar mobilidade', 'Retornar ao trabalho'],
        goalsAchieved: 2,
      },
      insurance: {
        type: 'health_plan',
        provider: 'Unimed',
        planName: 'Unimed Plus',
        policyNumber: '123456789',
        validUntil: '2025-12-31',
      },
      financialInfo: {
        totalSpent: 3000,
        totalPending: 400,
        totalPaid: 2600,
        averageSessionCost: 200,
        paymentMethod: 'health_plan',
        hasOutstandingBalance: true,
        outstandingBalance: 400,
      },
      observations: 'Paciente muito colaborativo e comprometido com o tratamento.',
      internalNotes: 'Família tem histórico de problemas na coluna.',
      preferredDaysOfWeek: ['monday', 'wednesday', 'friday'],
      preferredTimeSlots: ['morning'],
      hasConsentForm: true,
      hasDataPrivacyConsent: true,
      documents: [],
      createdBy: 'system',
      createdAt: '2024-01-05T10:00:00Z',
      updatedBy: 'system',
      updatedAt: now,
      tags: ['vip', 'progress-good'],
    },
    {
      id: 'PAT-002',
      code: 'PAC-002',
      name: 'Maria Santos Oliveira',
      email: 'maria.santos@email.com',
      phone: '(11) 98888-1111',
      cpf: '987.654.321-00',
      rg: '98.765.432-1',
      birthDate: '1990-07-22',
      age: 34,
      gender: 'female',
      maritalStatus: 'single',
      occupation: 'Designer',
      avatarUrl: 'https://i.pravatar.cc/150?u=002',
      address: {
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Conj 501',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        country: 'Brasil',
      },
      emergencyContact: {
        name: 'José Santos',
        relationship: 'Pai',
        phone: '(11) 98888-2222',
        email: 'jose.santos@email.com',
      },
      bloodType: 'A+',
      height: 165,
      weight: 58,
      bmi: 21.3,
      medicalHistory: {
        allergies: [],
        chronicDiseases: [],
        previousSurgeries: [],
        currentMedications: [],
        familyHistory: [],
        smokingStatus: 'never',
        alcoholConsumption: 'never',
        physicalActivityLevel: 'low',
        observations: 'Tendinite no ombro direito devido a movimentos repetitivos.',
      },
      conditions: [
        {
          id: 'COND-003',
          name: 'Tendinite do manguito rotador',
          diagnosisDate: '2024-02-01',
          severity: 'mild',
          status: 'active',
        },
      ],
      mainDiagnosis: 'Tendinite do supraespinhal - ombro direito',
      referringDoctor: 'Dra. Ana Paula Costa',
      referringDoctorCRM: 'CRM-SP 234567',
      status: 'Active',
      registrationDate: '2024-01-28',
      firstAppointmentDate: '2024-02-01',
      lastAppointmentDate: '2024-10-07',
      sessionProgress: {
        currentSession: 10,
        totalPlannedSessions: 12,
        completedSessions: 10,
        canceledSessions: 0,
        noShowSessions: 0,
        firstSessionDate: '2024-02-01',
        weeksInTreatment: 36,
        daysInTreatment: 252,
        averageSessionsPerWeek: 2.0,
        adherenceRate: 100,
      },
      treatmentMetrics: {
        painLevel: {
          initial: 6,
          current: 2,
          improvement: 66.7,
        },
        mobility: {
          initial: 6,
          current: 9,
          improvement: 50,
        },
        functionality: {
          initial: 5,
          current: 9,
          improvement: 80,
        },
        satisfaction: 95,
        goals: ['Eliminar dor', 'Recuperar amplitude de movimento'],
        goalsAchieved: 2,
      },
      insurance: {
        type: 'particular',
      },
      financialInfo: {
        totalSpent: 2400,
        totalPending: 0,
        totalPaid: 2400,
        averageSessionCost: 240,
        paymentMethod: 'credit_card',
        hasOutstandingBalance: false,
        outstandingBalance: 0,
      },
      observations: 'Excelente evolução no tratamento.',
      internalNotes: 'Paciente pontual e dedicada.',
      preferredDaysOfWeek: ['tuesday', 'thursday'],
      preferredTimeSlots: ['afternoon'],
      hasConsentForm: true,
      hasDataPrivacyConsent: true,
      documents: [],
      createdBy: 'system',
      createdAt: '2024-01-28T10:00:00Z',
      updatedBy: 'system',
      updatedAt: now,
      tags: ['excellent-progress'],
    },
    {
      id: 'PAT-003',
      code: 'PAC-003',
      name: 'Pedro Oliveira Costa',
      email: 'pedro.oliveira@email.com',
      phone: '(11) 97777-1111',
      cpf: '456.789.123-00',
      rg: '45.678.912-3',
      birthDate: '1978-11-08',
      age: 46,
      gender: 'male',
      maritalStatus: 'divorced',
      occupation: 'Professor',
      avatarUrl: 'https://i.pravatar.cc/150?u=003',
      address: {
        street: 'Rua Augusta',
        number: '2500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01412-000',
        country: 'Brasil',
      },
      emergencyContact: {
        name: 'Ana Oliveira',
        relationship: 'Irmã',
        phone: '(11) 97777-2222',
        email: 'ana.oliveira@email.com',
      },
      bloodType: 'B+',
      height: 178,
      weight: 90,
      bmi: 28.4,
      medicalHistory: {
        allergies: ['Dipirona'],
        chronicDiseases: ['Diabetes tipo 2'],
        previousSurgeries: ['Apendicectomia'],
        currentMedications: ['Metformina 850mg'],
        familyHistory: ['Diabetes', 'Hipertensão'],
        smokingStatus: 'former',
        alcoholConsumption: 'never',
        physicalActivityLevel: 'low',
        observations: 'Artrose no joelho direito com indicação cirúrgica.',
      },
      conditions: [
        {
          id: 'COND-004',
          name: 'Gonartrose grau III',
          diagnosisDate: '2023-11-15',
          severity: 'severe',
          status: 'active',
        },
      ],
      mainDiagnosis: 'Osteoartrite de joelho direito - Grau III',
      referringDoctor: 'Dr. Roberto Lima',
      referringDoctorCRM: 'CRM-SP 345678',
      status: 'Inactive',
      registrationDate: '2023-11-10',
      firstAppointmentDate: '2023-11-20',
      lastAppointmentDate: '2024-08-15',
      sessionProgress: {
        currentSession: 18,
        totalPlannedSessions: 20,
        completedSessions: 18,
        canceledSessions: 3,
        noShowSessions: 2,
        firstSessionDate: '2023-11-20',
        weeksInTreatment: 47,
        daysInTreatment: 329,
        averageSessionsPerWeek: 1.8,
        adherenceRate: 78.3,
      },
      treatmentMetrics: {
        painLevel: {
          initial: 9,
          current: 6,
          improvement: 33.3,
        },
        mobility: {
          initial: 3,
          current: 5,
          improvement: 66.7,
        },
        functionality: {
          initial: 3,
          current: 4,
          improvement: 33.3,
        },
        satisfaction: 60,
        goals: ['Reduzir dor', 'Adiar cirurgia', 'Melhorar mobilidade'],
        goalsAchieved: 1,
      },
      insurance: {
        type: 'health_plan',
        provider: 'Bradesco Saúde',
        planName: 'Bradesco Top',
        policyNumber: '987654321',
        validUntil: '2025-11-30',
      },
      financialInfo: {
        totalSpent: 3600,
        totalPending: 800,
        totalPaid: 2800,
        averageSessionCost: 200,
        paymentMethod: 'health_plan',
        hasOutstandingBalance: true,
        outstandingBalance: 800,
      },
      observations: 'Paciente com baixa aderência às orientações domiciliares.',
      internalNotes: 'Necessita reforço em educação do paciente.',
      preferredDaysOfWeek: ['monday', 'thursday'],
      preferredTimeSlots: ['evening'],
      hasConsentForm: true,
      hasDataPrivacyConsent: true,
      documents: [],
      createdBy: 'system',
      createdAt: '2023-11-10T10:00:00Z',
      updatedBy: 'system',
      updatedAt: now,
      tags: ['needs-attention', 'low-adherence'],
    },
  ];
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => loadPatientsFromStorage());
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== PERSISTENCE ==========
  
  /**
   * Sincroniza pacientes com localStorage sempre que mudarem
   */
  useEffect(() => {
    savePatientsToStorage(patients);
  }, [patients]);

  // ========== CRUD OPERATIONS ==========

  /**
   * Cria um novo paciente
   */
  const createPatient = useCallback(async (formData: PatientFormData): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validar CPF único
      if (patients.some(p => p.cpf === formData.cpf)) {
        patientToasts.duplicateCPF();
        throw new Error('CPF já cadastrado');
      }
      
      // Validar email único
      if (patients.some(p => p.email === formData.email)) {
        patientToasts.duplicateEmail();
        throw new Error('Email já cadastrado');
      }
      
      const newPatient = convertFormDataToPatient(formData);
      
      setPatients(prev => [...prev, newPatient]);
      setCurrentPatient(newPatient);
      
      patientToasts.created(newPatient.name);
      
      return newPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar paciente';
      setError(errorMessage);
      
      // Usar handleError para erros não relacionados a validação
      if (!errorMessage.includes('já cadastrado')) {
        handleError(err, {
          operation: 'createPatient',
          severity: 'medium',
          fallbackMessage: 'Erro ao criar paciente',
          context: { 
            patientName: formData.name,
            hasCPF: !!formData.cpf,
            hasEmail: !!formData.email
          }
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [patients]);

  /**
   * Atualiza um paciente existente
   */
  const updatePatient = useCallback(async (id: string, formData: Partial<PatientFormData>): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingPatient = patients.find(p => p.id === id);
      if (!existingPatient) {
        throw new Error('Paciente não encontrado');
      }
      
      // Validar CPF único (excluindo o paciente atual)
      if (formData.cpf && patients.some(p => p.id !== id && p.cpf === formData.cpf)) {
        patientToasts.duplicateCPF();
        throw new Error('CPF já cadastrado');
      }
      
      // Validar email único (excluindo o paciente atual)
      if (formData.email && patients.some(p => p.id !== id && p.email === formData.email)) {
        patientToasts.duplicateEmail();
        throw new Error('Email já cadastrado');
      }
      
      const updatedPatient = convertFormDataToPatient(
        { ...existingPatient, ...formData } as PatientFormData,
        existingPatient
      );
      
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      
      if (currentPatient?.id === id) {
        setCurrentPatient(updatedPatient);
      }
      
      patientToasts.updated(updatedPatient.name);
      
      return updatedPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente';
      setError(errorMessage);
      
      // Usar handleError para erros não relacionados a validação
      if (!errorMessage.includes('já cadastrado') && !errorMessage.includes('não encontrado')) {
        handleError(err, {
          operation: 'updatePatient',
          severity: 'medium',
          fallbackMessage: 'Erro ao atualizar paciente',
          context: { 
            patientId: id,
            hasCPF: !!formData.cpf,
            hasEmail: !!formData.email
          }
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [patients, currentPatient?.id]);

  /**
   * Exclui um paciente
   */
  const deletePatient = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const patient = patients.find(p => p.id === id);
      if (!patient) {
        throw new Error('Paciente não encontrado');
      }
      
      setPatients(prev => prev.filter(p => p.id !== id));
      
      if (currentPatient?.id === id) {
        setCurrentPatient(null);
      }
      
      patientToasts.deleted(patient.name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir paciente';
      setError(errorMessage);
      // Usar handleError para erros não relacionados a validação
      if (!errorMessage.includes('não encontrado')) {
        handleError(err, {
          operation: 'deletePatient',
          severity: 'medium',
          fallbackMessage: 'Erro ao excluir paciente',
          context: { 
            patientId: id,
            patientName: patient?.name
          }
        });
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [patients, currentPatient?.id]);

  /**
   * Busca um paciente por ID
   */
  const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const patient = patients.find(p => p.id === id) || null;
      setCurrentPatient(patient);
      
      if (!patient) {
        patientToasts.loadError();
      }
      
      return patient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar paciente';
      setError(errorMessage);
      // Usar handleError para erros não relacionados a validação
      handleError(err, {
        operation: 'getPatient',
        severity: 'low',
        fallbackMessage: 'Erro ao buscar paciente',
        context: { 
          patientId: id
        }
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [patients]);

  /**
   * Busca todos os pacientes
   */
  const getAllPatients = useCallback(async (): Promise<Patient[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return patients;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar pacientes';
      setError(errorMessage);
      // Usar handleError para erros não relacionados a validação
      handleError(err, {
        operation: 'getAllPatients',
        severity: 'medium',
        fallbackMessage: 'Erro ao buscar todos os pacientes',
        context: { 
          patientsCount: patients.length
        }
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [patients]);

  // ========== SEARCH & FILTER ==========

  /**
   * Busca pacientes por query
   */
  const searchPatients = useCallback((query: string): Patient[] => {
    if (!query.trim()) return patients;
    
    const lowerQuery = query.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.email.toLowerCase().includes(lowerQuery) ||
      patient.cpf.includes(query) ||
      patient.phone.includes(query) ||
      patient.code.toLowerCase().includes(lowerQuery)
    );
  }, [patients]);

  /**
   * Filtra pacientes por critérios
   */
  const filterPatients = useCallback((filters: PatientFilters): Patient[] => {
    let filtered = patients;
    
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(p => filters.status!.includes(p.status));
    }
    
    if (filters.gender && filters.gender.length > 0) {
      filtered = filtered.filter(p => filters.gender!.includes(p.gender));
    }
    
    if (filters.hasOutstandingBalance !== undefined) {
      filtered = filtered.filter(p => p.financialInfo.hasOutstandingBalance === filters.hasOutstandingBalance);
    }
    
    if (filters.minAge !== undefined) {
      filtered = filtered.filter(p => p.age >= filters.minAge!);
    }
    
    if (filters.maxAge !== undefined) {
      filtered = filtered.filter(p => p.age <= filters.maxAge!);
    }
    
    if (filters.searchQuery) {
      filtered = searchPatients(filters.searchQuery);
    }
    
    return filtered;
  }, [patients, searchPatients]);

  // ========== VALIDATION ==========

  /**
   * Valida se CPF é único
   */
  const validateUniqueCPF = useCallback((cpf: string, excludeId?: string): boolean => {
    return !patients.some(p => p.cpf === cpf && p.id !== excludeId);
  }, [patients]);

  /**
   * Valida se email é único
   */
  const validateUniqueEmail = useCallback((email: string, excludeId?: string): boolean => {
    return !patients.some(p => p.email === email && p.id !== excludeId);
  }, [patients]);

  // ========== STATE MANAGEMENT ==========

  /**
   * Atualiza lista de pacientes
   */
  const refreshPatients = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Em produção, buscar do backend
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = loadPatientsFromStorage();
      setPatients(stored);
    } catch (err) {
      setError('Erro ao atualizar lista de pacientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========== MEMOIZED VALUE ==========

  const value: PatientContextType = useMemo(() => ({
    patients,
    currentPatient,
    isLoading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getAllPatients,
    searchPatients,
    filterPatients,
    setCurrentPatient,
    clearError,
    refreshPatients,
    validateUniqueCPF,
    validateUniqueEmail,
  }), [
    patients,
    currentPatient,
    isLoading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getAllPatients,
    searchPatients,
    filterPatients,
    clearError,
    refreshPatients,
    validateUniqueCPF,
    validateUniqueEmail,
  ]);

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para acessar o contexto de pacientes
 */
export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient deve ser usado dentro de um PatientProvider');
  }
  return context;
};
