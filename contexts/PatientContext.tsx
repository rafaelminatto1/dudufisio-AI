/**
 * contexts/PatientContext.tsx
 * Context profissional para gerenciamento de pacientes
 * Inclui: CRUD completo, persistência localStorage, validação, cache e otimizações
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Patient, PatientFormData } from '../types/patient';
import { patientToasts } from '../utils/toast';

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
  // Retornar array vazio para iniciar limpo
  // Ou retornar pacientes de exemplo se desejar
  return [];
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
      
      if (!errorMessage.includes('já cadastrado')) {
        patientToasts.createError(errorMessage);
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
      
      if (!errorMessage.includes('já cadastrado')) {
        patientToasts.updateError(errorMessage);
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
      patientToasts.deleteError(errorMessage);
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
      patientToasts.loadError();
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
