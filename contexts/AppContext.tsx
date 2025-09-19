import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Therapist, Patient, Appointment } from '../types';
import * as authService from '../services/authService';
import * as therapistService from '../services/therapistService';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import PageLoader from '../components/ui/PageLoader';

interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  
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
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Data state
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Auth functions
  const login = async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

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

  // Initialize auth
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = authService.getSession();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

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
    // Auth
    user,
    isAuthenticated: !!user,
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

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Backward compatibility hooks
export const useAuth = () => {
  const { user, isAuthenticated, authLoading, login, logout } = useApp();
  return { user, isAuthenticated, isLoading: authLoading, login, logout };
};

export const useData = () => {
  const { therapists, patients, appointments, dataLoading, error, refetch } = useApp();
  return { therapists, patients, appointments, isLoading: dataLoading, error, refetch };
};
