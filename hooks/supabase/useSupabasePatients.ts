import { useState, useEffect, useCallback } from 'react';
import patientService, { PatientFilters } from '../../services/supabase/patientService';
import type { Database } from '../../types/database';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export const useSupabasePatients = (filters?: PatientFilters) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patients
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await patientService.getPatients(filters);
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = patientService.subscribeToPatientChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setPatients(prev => [payload.new as Patient, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setPatients(prev => 
          prev.map(p => p.id === payload.new.id ? payload.new as Patient : p)
        );
      } else if (payload.eventType === 'DELETE') {
        setPatients(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Create patient
  const createPatient = useCallback(async (patient: PatientInsert) => {
    try {
      const newPatient = await patientService.createPatient(patient);
      setPatients(prev => [newPatient, ...prev]);
      return { success: true, data: newPatient };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar paciente';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update patient
  const updatePatient = useCallback(async (id: string, updates: PatientUpdate) => {
    try {
      const updatedPatient = await patientService.updatePatient(id, updates);
      setPatients(prev => 
        prev.map(p => p.id === id ? updatedPatient : p)
      );
      return { success: true, data: updatedPatient };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Archive patient
  const archivePatient = useCallback(async (id: string) => {
    try {
      const archivedPatient = await patientService.archivePatient(id);
      setPatients(prev => 
        prev.map(p => p.id === id ? archivedPatient : p)
      );
      return { success: true, data: archivedPatient };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar paciente';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Search patients
  const searchPatients = useCallback(async (searchTerm: string) => {
    try {
      const results = await patientService.searchPatients(searchTerm);
      return { success: true, data: results };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar pacientes';
      return { success: false, error: errorMessage, data: [] };
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    archivePatient,
    searchPatients,
    refresh,
  };
};

// Hook for single patient
export const useSupabasePatient = (patientId: string | null) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patient
  const loadPatient = useCallback(async () => {
    if (!patientId) {
      setPatient(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [patientData, statsData] = await Promise.all([
        patientService.getPatientById(patientId),
        patientService.getPatientStatistics(patientId),
      ]);
      
      setPatient(patientData);
      setStatistics(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar paciente');
      setPatient(null);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Initial load
  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!patientId) return;

    const channel = patientService.subscribeToPatientById(patientId, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setPatient(payload.new as Patient);
      } else if (payload.eventType === 'DELETE') {
        setPatient(null);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [patientId]);

  // Update patient
  const updatePatient = useCallback(async (updates: PatientUpdate) => {
    if (!patientId) {
      return { success: false, error: 'ID do paciente não fornecido' };
    }

    try {
      const updatedPatient = await patientService.updatePatient(patientId, updates);
      setPatient(updatedPatient);
      return { success: true, data: updatedPatient };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente';
      return { success: false, error: errorMessage };
    }
  }, [patientId]);

  // Refresh data
  const refresh = useCallback(() => {
    loadPatient();
  }, [loadPatient]);

  return {
    patient,
    statistics,
    loading,
    error,
    updatePatient,
    refresh,
  };
};

export default useSupabasePatients;
