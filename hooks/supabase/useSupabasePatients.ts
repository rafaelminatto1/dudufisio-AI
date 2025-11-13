import { useState, useEffect, useCallback } from 'react'
import type { SupabaseRealtimePayload } from '@supabase/supabase-js'
import patientService, {
  type PatientStatistics,
} from '../../services/supabase/patientServiceSupabase'
import type { Database } from '../../types/database'
import type { Patient } from '../../types'
import { PatientStatus } from '../../types/enums'

type PatientListParams = Parameters<typeof patientService.list>[0]
type CreatePatientInput = Parameters<typeof patientService.createPatient>[0]
type UpdatePatientInput = Parameters<typeof patientService.updatePatient>[1]
type PatientsRealtimePayload = SupabaseRealtimePayload<Database['public']['Tables']['patients']['Row']> & {
  patient: Patient | null
}

interface OperationResult<T> {
  success: true
  data: T
}

interface OperationError {
  success: false
  error: string
}

const emptyPatients: Patient[] = []

export const useSupabasePatients = (filters?: PatientListParams) => {
  const [patients, setPatients] = useState<Patient[]>(emptyPatients)
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { patients: fetchedPatients, total: fetchedTotal } = await patientService.list(filters ?? {})
      setPatients(fetchedPatients)
      setTotal(fetchedTotal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes')
      setPatients(emptyPatients)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadPatients()
  }, [loadPatients])

  useEffect(() => {
    const channel = patientService.subscribeToPatients((payload: PatientsRealtimePayload) => {
      const nextPatient = payload.patient

      switch (payload.eventType) {
        case 'INSERT':
          if (nextPatient) {
            setPatients(prev => [nextPatient, ...prev])
            setTotal(prev => prev + 1)
          }
          break
        case 'UPDATE':
          if (nextPatient) {
            setPatients(prev => prev.map(patient => (patient.id === nextPatient.id ? nextPatient : patient)))
          }
          break
        case 'DELETE':
          if (payload.old?.id) {
            setPatients(prev => prev.filter(patient => patient.id !== payload.old?.id))
            setTotal(prev => Math.max(prev - 1, 0))
          }
          break
        default:
          break
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const createPatient = useCallback(
    async (patientData: CreatePatientInput): Promise<OperationResult<Patient> | OperationError> => {
      try {
        const newPatient = await patientService.createPatient(patientData)
        setPatients(prev => [newPatient, ...prev])
        setTotal(prev => prev + 1)
        return { success: true, data: newPatient }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar paciente'
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const updatePatient = useCallback(
    async (id: string, updates: UpdatePatientInput): Promise<OperationResult<Patient> | OperationError> => {
      try {
        const updatedPatient = await patientService.updatePatient(id, updates)
        setPatients(prev => prev.map(patient => (patient.id === id ? updatedPatient : patient)))
        return { success: true, data: updatedPatient }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente'
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const archivePatient = useCallback(
    async (id: string): Promise<OperationResult<Patient | null> | OperationError> => {
      try {
        await patientService.archivePatient(id)
        let archived: Patient | null = null
        setPatients(prev =>
          prev.map(patient => {
            if (patient.id !== id) return patient
            archived = { ...patient, status: PatientStatus.Inactive }
            return archived
          })
        )
        return { success: true, data: archived }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar paciente'
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const searchPatients = useCallback(
    async (searchTerm: string): Promise<OperationResult<Patient[]> | (OperationError & { data: Patient[] })> => {
      try {
        const results = await patientService.searchPatients(searchTerm)
        return { success: true, data: results }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar pacientes'
        return { success: false, error: errorMessage, data: emptyPatients }
      }
    },
    []
  )

  const refresh = useCallback(() => {
    void loadPatients()
  }, [loadPatients])

  return {
    patients,
    total,
    loading,
    error,
    createPatient,
    updatePatient,
    archivePatient,
    searchPatients,
    refresh,
  }
}

export const useSupabasePatient = (patientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [statistics, setStatistics] = useState<PatientStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPatient = useCallback(async () => {
    if (!patientId) {
      setPatient(null)
      setStatistics(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [patientData, statsData] = await Promise.all([
        patientService.getPatientById(patientId),
        patientService.getPatientStatistics(patientId),
      ])
      setPatient(patientData)
      setStatistics(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar paciente')
      setPatient(null)
      setStatistics(null)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    void loadPatient()
  }, [loadPatient])

  useEffect(() => {
    if (!patientId) return

    const channel = patientService.subscribeToPatientById(patientId, (payload: PatientsRealtimePayload) => {
      if (payload.eventType === 'UPDATE' && payload.patient) {
        setPatient(payload.patient)
      } else if (payload.eventType === 'DELETE') {
        setPatient(null)
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [patientId])

  const updatePatient = useCallback(
    async (updates: UpdatePatientInput): Promise<OperationResult<Patient> | OperationError> => {
      if (!patientId) {
        return { success: false, error: 'ID do paciente não fornecido' }
      }

      try {
        const updatedPatient = await patientService.updatePatient(patientId, updates)
        setPatient(updatedPatient)
        return { success: true, data: updatedPatient }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente'
        return { success: false, error: errorMessage }
      }
    },
    [patientId]
  )

  const refresh = useCallback(() => {
    void loadPatient()
  }, [loadPatient])

  return { patient, statistics, loading, error, updatePatient, refresh }
}

export default useSupabasePatients
