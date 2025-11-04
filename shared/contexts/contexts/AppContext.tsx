import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Therapist, Patient, Appointment } from '../types';
import type { Result } from '../types/utils';
import { useSupabaseAuth } from './SupabaseAuthContext';
import * as therapistService from '../services/therapistService';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import { safeAsync, safeLog } from '../lib/safety';
import PageLoader from '../components/ui/PageLoader';
import { logger } from '../lib/logger';

interface PartialErrors {
  therapists?: string;
  patients?: string;
  appointments?: string;
}

interface AppContextType {
  // Auth state (from SupabaseAuthContext) - properly typed with safety
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Result<User, Error>>;
  logout: () => Promise<Result<void, Error>>;

  // Data state with safety guarantees
  therapists: Therapist[];
  patients: Patient[];
  appointments: Appointment[];
  dataLoading: boolean;
  error: string | null; // Simplified error handling
  partialErrors: PartialErrors; // ✅ NEW: Errors parciais por serviço
  refetch: () => Promise<void>;

  // Additional safety methods
  safeGetPatient: (id: string) => Patient | undefined;
  safeGetTherapist: (id: string) => Therapist | undefined;
  safeGetAppointment: (id: string) => Appointment | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get auth state from SupabaseAuthContext
  const { user, isAuthenticated, loading: authLoading, login: authLogin, logout } = useSupabaseAuth();

  // Data state
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<PartialErrors>({}); // ✅ NEW: Estado de erros parciais

  // Auth wrapper function with proper error handling
  const login = useCallback(async (email: string, password: string): Promise<Result<User, Error>> => {
    return safeAsync(authLogin({ email, password }));
  }, [authLogin]);

  // Safe logout with error handling
  const safeLogout = useCallback(async (): Promise<Result<void, Error>> => {
    return safeAsync(logout());
  }, [logout]);

  // Data functions with comprehensive safety
  const fetchData = useCallback(async () => {
    // ✅ SÓ BUSCA DADOS SE USUÁRIO ESTIVER AUTENTICADO
    if (!isAuthenticated || !user) {
      safeLog('Skipping data fetch - user not authenticated', { isAuthenticated, hasUser: !!user });
      setDataLoading(false);
      return;
    }

    safeLog('Starting data fetch for authenticated user', { userId: user.id, role: user.role });
    
    setDataLoading(true);
    setError(null);
    setPartialErrors({}); // ✅ Reset erros parciais

    try {
      // Safe parallel data fetching with individual error handling
      const [therapistsResult, patientsResult, appointmentsResult] = await Promise.all([
        safeAsync(therapistService.getTherapists()),
        safeAsync(patientService.getAllPatients()),
        safeAsync(appointmentService.getAppointments()),
      ]);

    const errors: string[] = [];
    const newPartialErrors: PartialErrors = {}; // ✅ NEW: Track erros individuais

    // Handle therapists
    if (therapistsResult.success) {
      setTherapists(therapistsResult.data || []);
      safeLog('Therapists loaded successfully', { count: (therapistsResult.data || []).length });
      // ✅ Se sucesso, não adiciona erro
    } else {
      setTherapists([]);
      const errorMsg = therapistsResult.error?.message || 'Erro desconhecido';
      errors.push(`Terapeutas: ${errorMsg}`);
      newPartialErrors.therapists = errorMsg; // ✅ NEW: Armazena erro específico
    }

    // Handle patients
    if (patientsResult.success) {
      setPatients(patientsResult.data || []);
      safeLog('Patients loaded successfully', { count: (patientsResult.data || []).length });
      // ✅ Se sucesso, não adiciona erro
    } else {
      setPatients([]);
      const errorMsg = patientsResult.error?.message || 'Erro desconhecido';
      errors.push(`Pacientes: ${errorMsg}`);
      newPartialErrors.patients = errorMsg; // ✅ NEW: Armazena erro específico
    }

    // Handle appointments
    if (appointmentsResult.success) {
      setAppointments(appointmentsResult.data || []);
      safeLog('Appointments loaded successfully', { count: (appointmentsResult.data || []).length });
      // ✅ Se sucesso, não adiciona erro
    } else {
      setAppointments([]);
      const errorMsg = appointmentsResult.error?.message || 'Erro desconhecido';
      errors.push(`Agendamentos: ${errorMsg}`);
      newPartialErrors.appointments = errorMsg; // ✅ NEW: Armazena erro específico
    }

    // ✅ Set partial errors (só os que falharam)
    setPartialErrors(newPartialErrors);

    // Set combined error if any failed (para compatibilidade)
    if (errors.length > 0) {
      setError(`Falha ao carregar alguns dados: ${errors.join(', ')}`);
    }

    setDataLoading(false);
    } catch (error: unknown) {
      logger.error('❌ Error in fetchData:', { data: error as Error });
      const message = error instanceof Error ? error.message : 'Erro ao carregar dados';
      setError(message);
      setDataLoading(false);
    }
  }, [isAuthenticated, user]);

  // Safe data access methods - MOVED TO TOP LEVEL
  const safeGetPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const safeGetTherapist = useCallback((id: string): Therapist | undefined => {
    return therapists.find(t => t.id === id);
  }, [therapists]);

  const safeGetAppointment = useCallback((id: string): Appointment | undefined => {
    return appointments.find(a => a.id === id);
  }, [appointments]);

  // HOOK CONSISTENCY FIX: Always define retry callback to prevent conditional hook changes
  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading, fetchData]);

  const value: AppContextType = {
    // Auth (from SupabaseAuthContext) with safety
    user,
    isAuthenticated,
    isLoading: authLoading,
    login,
    logout: safeLogout,

    // Data with safety guarantees
    therapists,
    patients,
    appointments,
    dataLoading,
    error,
    partialErrors, // ✅ NEW: Expõe erros parciais
    refetch: fetchData,

    // Safe access methods
    safeGetPatient,
    safeGetTherapist,
    safeGetAppointment,
  };

  return (
    <AppContext.Provider value={value}>
      {authLoading ? (
        <PageLoader />
      ) : error && user && Object.keys(partialErrors).length === 0 ? (
        // ✅ NEW: Só mostra erro full-screen se TODOS os dados falharam
        <div className="flex items-center justify-center h-screen text-red-500">
          Falha ao carregar dados: {error}
          <button
            onClick={handleRetry}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        // ✅ NEW: Mostra children mesmo com erros parciais, mas com banner de aviso
        <>
          {Object.keys(partialErrors).length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4" role="alert" aria-live="polite">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-yellow-700 font-medium">
                    Alguns dados não puderam ser carregados:
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {partialErrors.therapists && <li>Terapeutas: {partialErrors.therapists}</li>}
                    {partialErrors.patients && <li>Pacientes: {partialErrors.patients}</li>}
                    {partialErrors.appointments && <li>Agendamentos: {partialErrors.appointments}</li>}
                  </ul>
                  <button
                    onClick={handleRetry}
                    className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Tentar recarregar dados faltantes
                  </button>
                </div>
              </div>
            </div>
          )}
          {children}
        </>
      )}
    </AppContext.Provider>
  );
};

function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
}

export { useApp };

// Backward compatibility hooks - DEPRECATED: Use useApp instead
export const useAuth = () => {
  try {
    const { user, isAuthenticated, isLoading, login, logout } = useApp();
    return { user, isAuthenticated, isLoading, login, logout };
  } catch (error) {
    logger.error('useAuth hook error:', { data: error as Error });
    // Return safe defaults
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => ({ success: false, error: new Error('Context not available') } as any),
      logout: async () => ({ success: false, error: new Error('Context not available') } as any)
    };
  }
};

export const useData = () => {
  const { therapists, patients, appointments, dataLoading, error, refetch } = useApp();
  return { therapists, patients, appointments, isLoading: dataLoading, error, refetch };
};
