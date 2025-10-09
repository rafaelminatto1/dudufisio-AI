import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Patient } from '../types/patient';

interface PatientContextType {
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD Operations
  createPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  getAllPatients: () => Promise<Patient[]>;
  
  // State Management
  setCurrentPatient: (patient: Patient | null) => void;
  clearError: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Mock data para demonstração
const mockPatients: Patient[] = [
  {
    id: '1',
    // Personal Data
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '1985-03-15',
    gender: 'Masculino',
    maritalStatus: 'Casado',
    profession: 'Engenheiro',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    
    // Address
    address: {
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      complement: 'Apto 45'
    },
    
    // Emergency Contact
    emergencyContact: {
      name: 'Maria Silva',
      relationship: 'Esposa',
      phone: '(11) 88888-8888'
    },
    
    // Physical Data
    physicalData: {
      height: 175,
      weight: 80,
      bloodType: 'O+',
      allergies: ['Penicilina'],
      medications: ['Omeprazol']
    },
    
    // Medical History
    medicalHistory: {
      previousSurgeries: ['Apendicectomia (2010)'],
      chronicDiseases: ['Hipertensão'],
      familyHistory: ['Diabetes na família'],
      currentSymptoms: ['Dor lombar']
    },
    
    // Treatment Data
    treatmentData: {
      diagnosis: 'Hérnia de disco L4-L5',
      treatmentPlan: 'Fisioterapia + Pilates',
      goals: ['Reduzir dor', 'Melhorar mobilidade'],
      contraindications: ['Sem contraindicações']
    },
    
    // Session Tracking
    sessionTracking: {
      totalSessions: 6,
      completedSessions: 6,
      nextSession: '2024-01-20',
      sessionFrequency: '3x/semana',
      currentPhase: 'Fase 2',
      progressNotes: ['Melhora significativa na dor']
    },
    
    // Financial
    financial: {
      totalValue: 800,
      paidValue: 400,
      pendingValue: 400,
      paymentMethod: 'PIX',
      insuranceProvider: 'Unimed'
    },
    
    // Status and Dates
    status: 'Active',
    registrationDate: '2024-01-09',
    lastUpdate: '2024-01-15',
    
    // Additional Data
    notes: 'Paciente muito dedicado ao tratamento',
    attachments: [],
    tags: ['Dor lombar', 'Hérnia de disco']
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    birthDate: '1990-07-22',
    gender: 'Feminino',
    maritalStatus: 'Solteira',
    profession: 'Professora',
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    
    address: {
      street: 'Av. Paulista, 1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    
    emergencyContact: {
      name: 'Carlos Santos',
      relationship: 'Pai',
      phone: '(11) 77777-7777'
    },
    
    physicalData: {
      height: 165,
      weight: 60,
      bloodType: 'A+',
      allergies: [],
      medications: []
    },
    
    medicalHistory: {
      previousSurgeries: [],
      chronicDiseases: [],
      familyHistory: [],
      currentSymptoms: ['Tendinite no ombro']
    },
    
    treatmentData: {
      diagnosis: 'Tendinite do manguito rotador',
      treatmentPlan: 'Fisioterapia + Fortalecimento',
      goals: ['Reduzir inflamação', 'Fortalecer musculatura'],
      contraindications: ['Evitar movimentos bruscos']
    },
    
    sessionTracking: {
      totalSessions: 8,
      completedSessions: 8,
      nextSession: '2024-01-22',
      sessionFrequency: '2x/semana',
      currentPhase: 'Fase 1',
      progressNotes: ['Redução da inflamação']
    },
    
    financial: {
      totalValue: 600,
      paidValue: 600,
      pendingValue: 0,
      paymentMethod: 'Cartão',
      insuranceProvider: 'Bradesco Saúde'
    },
    
    status: 'Active',
    registrationDate: '2024-01-10',
    lastUpdate: '2024-01-16',
    
    notes: 'Excelente aderência ao tratamento',
    attachments: [],
    tags: ['Tendinite', 'Ombro']
  }
];

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPatient = useCallback(async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
        registrationDate: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
      };
      
      setPatients(prev => [...prev, newPatient]);
      setCurrentPatient(newPatient);
      
      return newPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar paciente';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPatient = {
        ...patientData,
        id,
        lastUpdate: new Date().toISOString().split('T')[0],
      } as Patient;
      
      setPatients(prev => prev.map(p => 
        p.id === id ? updatedPatient : p
      ));
      
      if (currentPatient?.id === id) {
        setCurrentPatient(updatedPatient);
      }
      
      return updatedPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPatient?.id]);

  const deletePatient = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPatients(prev => prev.filter(p => p.id !== id));
      
      if (currentPatient?.id === id) {
        setCurrentPatient(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir paciente';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPatient?.id]);

  const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const patient = patients.find(p => p.id === id) || null;
      setCurrentPatient(patient);
      
      return patient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar paciente';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [patients]);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: PatientContextType = {
    patients,
    currentPatient,
    isLoading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getAllPatients,
    setCurrentPatient,
    clearError,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient deve ser usado dentro de um PatientProvider');
  }
  return context;
};
