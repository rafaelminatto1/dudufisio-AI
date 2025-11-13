import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import appointmentService, {
  type AppointmentFilters,
  type TimeSlot,
} from '../../services/supabase/appointmentService'
import type { Database } from '../../types/database'

type AppointmentRow = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']
type AppointmentRecord = AppointmentRow & {
  patient?: Record<string, unknown>
  therapist?: Record<string, unknown>
  session?: Record<string, unknown>
}

type RecurrenceType = Parameters<typeof appointmentService.createRecurringAppointments>[1]

type AppointmentActionResult<T> = { success: true; data: T } | { success: false; error: string }

type AppointmentStatistics = Awaited<ReturnType<typeof appointmentService.getAppointmentStatistics>>
type AppointmentPayload = RealtimePostgresChangesPayload<AppointmentRow>

const emptyAppointments: AppointmentRecord[] = []

const handleErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

const matchesFilters = (filters: AppointmentFilters | undefined, appointment?: AppointmentRow | null): boolean => {
  if (!filters || !appointment) return true
  if (filters.therapistId && appointment.therapist_id !== filters.therapistId) return false
  if (filters.patientId && appointment.patient_id !== filters.patientId) return false
  if (filters.status && appointment.status !== filters.status) return false
  if (filters.startDate && appointment.appointment_date && appointment.appointment_date < filters.startDate) return false
  if (filters.endDate && appointment.appointment_date && appointment.appointment_date > filters.endDate) return false
  return true
}

export const useSupabaseAppointments = (filters?: AppointmentFilters) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(emptyAppointments)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await appointmentService.getAppointments(filters)
      setAppointments(data as AppointmentRecord[])
    } catch (err) {
      setError(handleErrorMessage(err, 'Erro ao carregar agendamentos'))
      setAppointments(emptyAppointments)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    const subscription = appointmentService.subscribeToAppointmentChanges((payload: AppointmentPayload) => {
      if (!matchesFilters(filters, payload.new ?? payload.old)) {
        return
      }

      switch (payload.eventType) {
        case 'INSERT':
        case 'UPDATE':
          void loadAppointments()
          break
        case 'DELETE':
          if (payload.old?.id) {
            setAppointments(prev => prev.filter(appointment => appointment.id !== payload.old?.id))
          }
          break
        default:
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filters, loadAppointments])

  const createAppointment = useCallback(
    async (appointment: AppointmentInsert): Promise<AppointmentActionResult<AppointmentRecord | null>> => {
      try {
        const newAppointment = await appointmentService.createAppointment(appointment)
        await loadAppointments()
        return { success: true, data: newAppointment as AppointmentRecord | null }
      } catch (err) {
        return { success: false, error: handleErrorMessage(err, 'Erro ao criar agendamento') }
      }
    },
    [loadAppointments]
  )

  const updateAppointment = useCallback(
    async (id: string, updates: AppointmentUpdate): Promise<AppointmentActionResult<AppointmentRecord | null>> => {
      try {
        const updatedAppointment = await appointmentService.updateAppointment(id, updates)
        await loadAppointments()
        return { success: true, data: updatedAppointment as AppointmentRecord | null }
      } catch (err) {
        return { success: false, error: handleErrorMessage(err, 'Erro ao atualizar agendamento') }
      }
    },
    [loadAppointments]
  )

  const cancelAppointment = useCallback(
    async (id: string, reason: string, cancelledBy: string): Promise<AppointmentActionResult<AppointmentRecord | null>> => {
      try {
        const cancelledAppointment = await appointmentService.cancelAppointment(id, reason, cancelledBy)
        await loadAppointments()
        return { success: true, data: cancelledAppointment as AppointmentRecord | null }
      } catch (err) {
        return { success: false, error: handleErrorMessage(err, 'Erro ao cancelar agendamento') }
      }
    },
    [loadAppointments]
  )

  const completeAppointment = useCallback(
    async (id: string): Promise<AppointmentActionResult<AppointmentRecord | null>> => {
      try {
        const completedAppointment = await appointmentService.completeAppointment(id)
        await loadAppointments()
        return { success: true, data: completedAppointment as AppointmentRecord | null }
      } catch (err) {
        return { success: false, error: handleErrorMessage(err, 'Erro ao completar agendamento') }
      }
    },
    [loadAppointments]
  )

  const markAsNoShow = useCallback(
    async (id: string): Promise<AppointmentActionResult<AppointmentRecord | null>> => {
      try {
        const appointment = await appointmentService.markAsNoShow(id)
        await loadAppointments()
        return { success: true, data: appointment as AppointmentRecord | null }
      } catch (err) {
        return { success: false, error: handleErrorMessage(err, 'Erro ao marcar como falta') }
      }
    },
    [loadAppointments]
  )

  const createRecurringAppointments = useCallback(
    async (
      baseAppointment: AppointmentInsert,
      recurrenceType: RecurrenceType,
      occurrences: number
    ): Promise<AppointmentActionResult<AppointmentRecord[]>> => {
      try {
        const createdAppointments = await appointmentService.createRecurringAppointments(
          baseAppointment,
          recurrenceType,
          occurrences
        )
        await loadAppointments()
        return { success: true, data: createdAppointments as AppointmentRecord[] }
      } catch (err) {
        return { success: false, error: handleErrorMessage(err, 'Erro ao criar agendamentos recorrentes') }
      }
    },
    [loadAppointments]
  )

  const getStatistics = useCallback(
    async (): Promise<AppointmentActionResult<AppointmentStatistics | null>> => {
      try {
        const stats = await appointmentService.getAppointmentStatistics(filters)
        return { success: true, data: stats }
      } catch (err) {
        return {
          success: false,
          error: handleErrorMessage(err, 'Erro ao obter estatísticas'),
        }
      }
    },
    [filters]
  )

  const refresh = useCallback(() => {
    void loadAppointments()
  }, [loadAppointments])

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    markAsNoShow,
    createRecurringAppointments,
    getStatistics,
    refresh,
  }
}

export const useSupabaseTimeSlots = (therapistId?: string, date?: string, duration: number = 60) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTimeSlots = useCallback(async () => {
    if (!therapistId || !date) {
      setTimeSlots([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const slots = await appointmentService.getAvailableTimeSlots(therapistId, date, duration)
      setTimeSlots(slots)
    } catch (err) {
      setError(handleErrorMessage(err, 'Erro ao carregar horários disponíveis'))
      setTimeSlots([])
    } finally {
      setLoading(false)
    }
  }, [therapistId, date, duration])

  useEffect(() => {
    void loadTimeSlots()
  }, [loadTimeSlots])

  return { timeSlots, loading, error, refresh: loadTimeSlots }
}

export const useSupabaseWeekAppointments = (date: string, therapistId?: string) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(emptyAppointments)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await appointmentService.getWeekAppointments(new Date(date), therapistId)
      setAppointments(data as AppointmentRecord[])
    } catch (err) {
      setError(handleErrorMessage(err, 'Erro ao carregar agendamentos da semana'))
      setAppointments(emptyAppointments)
    } finally {
      setLoading(false)
    }
  }, [date, therapistId])

  useEffect(() => {
    void loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    const subscription = appointmentService.subscribeToAppointmentChanges(() => {
      void loadAppointments()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadAppointments])

  return { appointments, loading, error, refresh: loadAppointments }
}

export const useSupabaseTodayAppointments = (therapistId?: string) => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const filters: AppointmentFilters = {
    startDate: today,
    endDate: today,
    ...(therapistId ? { therapistId } : {}),
  }

  return useSupabaseAppointments(filters)
}

export default useSupabaseAppointments
