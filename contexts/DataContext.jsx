import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as therapistService from '../services/therapistService';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import PageLoader from '../components/ui/PageLoader';
const DataContext = createContext(undefined);
export const DataProvider = ({ children }) => {
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // FIX: Fetch all global data in parallel to restore context functionality
            const [therapistsData, patientsData, appointmentsData] = await Promise.all([
                therapistService.getTherapists(),
                patientService.getAllPatients(),
                appointmentService.getAppointments(),
            ]);
            setTherapists(therapistsData);
            setPatients(patientsData);
            setAppointments(appointmentsData);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (<DataContext.Provider value={{
            therapists,
            patients,
            appointments,
            isLoading,
            error,
            refetch: fetchData,
        }}>
      {isLoading ? (<PageLoader />) : error ? (<div className="flex items-center justify-center h-screen text-red-500">
          Falha ao carregar dados essenciais: {error.message}
        </div>) : (children)}
    </DataContext.Provider>);
};
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
