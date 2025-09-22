import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Therapist, Patient, Appointment } from '../types';
import { useSupabaseAuth } from './SupabaseAuthContext';
import * as therapistService from '../services/therapistService';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import PageLoader from '../components/ui/PageLoader';
import { useDebug } from './DebugContext';

interface AppContextType {
  // Auth state (from SupabaseAuthContext)
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data state
  therapists: Therapist[];
  patients: Patient[];
  appointments: Appointment[];
  dataLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Safe debug usage
  let debug;
  try {
    debug = useDebug();
  } catch (error) {
    debug = {
      logContextAccess: () => {},
      logHookCall: () => {},
      logRouterChange: () => {},
      enabled: false
    };
  }

  // Get auth state from SupabaseAuthContext
  const { user, isAuthenticated, authLoading, login, logout } = useSupabaseAuth();

  // Data state
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Data functions
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [therapistsData, patientsData, appointmentsData] = await Promise.all([
        therapistService.getTherapists(),
        patientService.getAllPatients(),
        appointmentService.getAppointments(),
      ]);
      setTherapists(therapistsData);
      setPatients(patientsData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch data:', err);
    } finally {
      setDataLoading(false);
    }
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
        Falha ao carregar dados: {error.message}
        <button 
          onClick={fetchData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const value: AppContextType = {
    // Auth (from SupabaseAuthContext)
    user,
    isAuthenticated,
    authLoading,
    login,
    logout,

    // Data
    therapists,
    patients,
    appointments,
    dataLoading,
    error,
    refetch: fetchData,
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
  const { user, isAuthenticated, authLoading, login, logout } = useApp();
  return { user, isAuthenticated, isLoading: authLoading, login, logout };
};

export const useData = () => {
  const { therapists, patients, appointments, dataLoading, error, refetch } = useApp();
  return { therapists, patients, appointments, isLoading: dataLoading, error, refetch };
};
