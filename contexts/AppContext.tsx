import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Therapist, Patient, Appointment } from '../types';
import type { Result } from '../types/utils';
import { useSupabaseAuth } from './SupabaseAuthContext';
import * as therapistService from '../services/therapistService';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import { safeAsync, safeLog } from '../lib/safety';
import PageLoader from '../components/ui/PageLoader';

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
    setDataLoading(true);
    setError(null);

    // Safe parallel data fetching with individual error handling
    const [therapistsResult, patientsResult, appointmentsResult] = await Promise.all([
      safeAsync(therapistService.getTherapists()),
      safeAsync(patientService.getAllPatients()),
      safeAsync(appointmentService.getAppointments()),
    ]);

    const errors: string[] = [];

    // Handle therapists
    if (therapistsResult.success) {
      setTherapists(therapistsResult.data || []);
      safeLog('Therapists loaded successfully', { count: (therapistsResult.data || []).length });
    } else {
      setTherapists([]);
      errors.push(`Terapeutas: ${therapistsResult.error.message}`);
    }

    // Handle patients
    if (patientsResult.success) {
      setPatients(patientsResult.data || []);
      safeLog('Patients loaded successfully', { count: (patientsResult.data || []).length });
    } else {
      setPatients([]);
      errors.push(`Pacientes: ${patientsResult.error.message}`);
    }

    // Handle appointments
    if (appointmentsResult.success) {
      setAppointments(appointmentsResult.data || []);
      safeLog('Appointments loaded successfully', { count: (appointmentsResult.data || []).length });
    } else {
      setAppointments([]);
      errors.push(`Agendamentos: ${appointmentsResult.error.message}`);
    }

    // Set combined error if any failed
    if (errors.length > 0) {
      setError(`Falha ao carregar alguns dados: ${errors.join(', ')}`);
    }

    setDataLoading(false);
  }, []);

  // Remove auth initialization as it's handled by SupabaseAuthContext

  // Fetch data when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading, fetchData]);

  // Show loading while auth is loading
  if (authLoading) {
    return <PageLoader />;
  }

  // Show error if data loading fails
  if (error && user) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Falha ao carregar dados: {error}
        <button 
          onClick={fetchData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Safe data access methods
  const safeGetPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const safeGetTherapist = useCallback((id: string): Therapist | undefined => {
    return therapists.find(t => t.id === id);
  }, [therapists]);

  const safeGetAppointment = useCallback((id: string): Appointment | undefined => {
    return appointments.find(a => a.id === id);
  }, [appointments]);

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
    refetch: fetchData,

    // Safe access methods
    safeGetPatient,
    safeGetTherapist,
    safeGetAppointment,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
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

// Backward compatibility hooks
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useApp();
  return { user, isAuthenticated, isLoading, login, logout };
};

export const useData = () => {
  const { therapists, patients, appointments, dataLoading, error, refetch } = useApp();
  return { therapists, patients, appointments, isLoading: dataLoading, error, refetch };
};
