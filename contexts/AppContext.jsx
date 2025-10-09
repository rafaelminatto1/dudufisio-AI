import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import * as therapistService from '../services/therapistService';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import { safeAsync, safeLog } from '../lib/safety';
import PageLoader from '../components/ui/PageLoader';
const AppContext = createContext(undefined);
export const AppProvider = ({ children }) => {
    // Get auth state from SupabaseAuthContext
    const { user, isAuthenticated, loading: authLoading, login: authLogin, logout } = useSupabaseAuth();
    // Data state
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState(null);
    // Auth wrapper function with proper error handling
    const login = useCallback(async (email, password) => {
        return safeAsync(authLogin({ email, password }));
    }, [authLogin]);
    // Safe logout with error handling
    const safeLogout = useCallback(async () => {
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
        try {
            // Safe parallel data fetching with individual error handling
            const [therapistsResult, patientsResult, appointmentsResult] = await Promise.all([
                safeAsync(therapistService.getTherapists()),
                safeAsync(patientService.getAllPatients()),
                safeAsync(appointmentService.getAppointments()),
            ]);
            const errors = [];
            // Handle therapists
            if (therapistsResult.success) {
                setTherapists(therapistsResult.data || []);
                safeLog('Therapists loaded successfully', { count: (therapistsResult.data || []).length });
            }
            else {
                setTherapists([]);
                errors.push(`Terapeutas: ${therapistsResult.error?.message || 'Erro desconhecido'}`);
            }
            // Handle patients
            if (patientsResult.success) {
                setPatients(patientsResult.data || []);
                safeLog('Patients loaded successfully', { count: (patientsResult.data || []).length });
            }
            else {
                setPatients([]);
                errors.push(`Pacientes: ${patientsResult.error?.message || 'Erro desconhecido'}`);
            }
            // Handle appointments
            if (appointmentsResult.success) {
                setAppointments(appointmentsResult.data || []);
                safeLog('Appointments loaded successfully', { count: (appointmentsResult.data || []).length });
            }
            else {
                setAppointments([]);
                errors.push(`Agendamentos: ${appointmentsResult.error?.message || 'Erro desconhecido'}`);
            }
            // Set combined error if any failed
            if (errors.length > 0) {
                setError(`Falha ao carregar alguns dados: ${errors.join(', ')}`);
            }
            setDataLoading(false);
        }
        catch (error) {
            console.error('❌ Error in fetchData:', error);
            setError(error.message || 'Erro ao carregar dados');
            setDataLoading(false);
        }
    }, [isAuthenticated, user]);
    // Safe data access methods - MOVED TO TOP LEVEL
    const safeGetPatient = useCallback((id) => {
        return patients.find(p => p.id === id);
    }, [patients]);
    const safeGetTherapist = useCallback((id) => {
        return therapists.find(t => t.id === id);
    }, [therapists]);
    const safeGetAppointment = useCallback((id) => {
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
    const value = {
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
    return (<AppContext.Provider value={value}>
      {authLoading ? (<PageLoader />) : error && user ? (<div className="flex items-center justify-center h-screen text-red-500">
          Falha ao carregar dados: {error}
          <button onClick={handleRetry} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
            Tentar Novamente
          </button>
        </div>) : (children)}
    </AppContext.Provider>);
};
function useApp() {
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
    }
    catch (error) {
        console.error('useAuth hook error:', error);
        // Return safe defaults
        return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: async () => ({ success: false, error: new Error('Context not available') }),
            logout: async () => ({ success: false, error: new Error('Context not available') })
        };
    }
};
export const useData = () => {
    const { therapists, patients, appointments, dataLoading, error, refetch } = useApp();
    return { therapists, patients, appointments, isLoading: dataLoading, error, refetch };
};
