/**
 * AppointmentRepository - Repository para gerenciamento de agendamentos
 * Responsável por todas as operações de banco de dados relacionadas a appointments
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions, DateRangeFilter } from '../types/RepositoryTypes';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export interface AppointmentFilters extends DateRangeFilter {
  patientId?: string;
  therapistId?: string;
  status?: string | string[];
  type?: string | string[];
}

export interface AppointmentWithRelations extends AppointmentRow {
  patient?: {
    id: string;
    name: string;
    phone: string;
    avatar_url: string | null;
    medical_alerts: string | null;
  };
  therapist?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export class AppointmentRepository extends BaseRepository<
  AppointmentRow,
  AppointmentInsert,
  AppointmentUpdate
> {
  protected tableName = 'appointments';

  /**
   * Busca appointments com filtros
   */
  async findMany(
    filters?: AppointmentFilters,
    options?: QueryOptions
  ): Promise<AppointmentRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    // Aplicar filtros de data
    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate);
    }

    // Filtro por paciente
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    // Filtro por terapeuta
    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }

    // Filtro por status
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Filtro por tipo
    if (filters?.type) {
      if (Array.isArray(filters.type)) {
        query = query.in('type', filters.type);
      } else {
        query = query.eq('type', filters.type);
      }
    }

    // Aplicar options (sort, pagination)
    query = this.applyOptions(query, options);

    // Ordenação padrão por start_time
    if (!options?.sort) {
      query = query.order('start_time', { ascending: true });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Busca appointments com dados relacionados (JOINs)
   */
  async findManyWithRelations(
    filters?: AppointmentFilters,
    options?: QueryOptions
  ): Promise<AppointmentWithRelations[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey (
          id,
          name,
          phone,
          avatar_url,
          medical_alerts
        ),
        therapist:users!appointments_therapist_id_fkey (
          id,
          name,
          color
        )
      `);

    // Aplicar mesmos filtros
    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate);
    }
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    query = this.applyOptions(query, options);

    if (!options?.sort) {
      query = query.order('start_time', { ascending: true });
    }

    return this.executeQuery(() => query, 'findManyWithRelations');
  }

  /**
   * Busca appointments por ID do paciente
   */
  async findByPatientId(
    patientId: string,
    options?: QueryOptions
  ): Promise<AppointmentRow[]> {
    return this.findMany({ patientId }, options);
  }

  /**
   * Busca appointments por ID do terapeuta
   */
  async findByTherapistId(
    therapistId: string,
    filters?: Omit<AppointmentFilters, 'therapistId'>,
    options?: QueryOptions
  ): Promise<AppointmentRow[]> {
    return this.findMany({ ...filters, therapistId }, options);
  }

  /**
   * Busca próximo appointment do paciente
   */
  async findNextByPatient(patientId: string): Promise<AppointmentRow | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('patient_id', patientId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      this.handleError(error, 'findNextByPatient');
    }

    return data;
  }

  /**
   * Busca appointments de hoje
   */
  async findToday(therapistId?: string): Promise<AppointmentRow[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findMany({
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
      therapistId,
    });
  }

  /**
   * Busca appointments pendentes
   */
  async findPending(filters?: Omit<AppointmentFilters, 'status'>): Promise<AppointmentRow[]> {
    return this.findMany({
      ...filters,
      status: ['scheduled', 'confirmed'],
    });
  }

  /**
   * Busca appointments completados
   */
  async findCompleted(filters?: Omit<AppointmentFilters, 'status'>): Promise<AppointmentRow[]> {
    return this.findMany({
      ...filters,
      status: 'completed',
    });
  }

  /**
   * Conta appointments com filtros
   */
  async countWithFilters(filters?: AppointmentFilters): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate);
    }
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    const { count, error } = await query;

    if (error) {
      this.handleError(error, 'countWithFilters');
    }

    return count ?? 0;
  }

  /**
   * Atualiza status do appointment
   */
  async updateStatus(id: string, status: string): Promise<AppointmentRow> {
    return this.update(id, { status } as AppointmentUpdate);
  }

  /**
   * Marca appointment como completado
   */
  async markAsCompleted(id: string): Promise<AppointmentRow> {
    return this.updateStatus(id, 'completed');
  }

  /**
   * Marca appointment como cancelado
   */
  async markAsCancelled(id: string, reason?: string): Promise<AppointmentRow> {
    return this.update(id, {
      status: 'cancelled',
      notes: reason,
    } as AppointmentUpdate);
  }

  /**
   * Marca appointment como no-show
   */
  async markAsNoShow(id: string): Promise<AppointmentRow> {
    return this.updateStatus(id, 'no_show');
  }

  /**
   * Verifica conflito de horário para um terapeuta
   */
  async hasConflict(
    therapistId: string,
    startTime: Date | string,
    endTime: Date | string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('therapist_id', therapistId)
      .neq('status', 'cancelled')
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { count, error } = await query;

    if (error) {
      this.handleError(error, 'hasConflict');
    }

    return (count ?? 0) > 0;
  }

  /**
   * Busca appointments por período e agrupa por status
   */
  async groupByStatus(filters?: DateRangeFilter): Promise<Record<string, number>> {
    let query = this.supabase
      .from(this.tableName)
      .select('status');

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      this.handleError(error, 'groupByStatus');
    }

    // Agrupar manualmente
    const grouped: Record<string, number> = {};
    data?.forEach(row => {
      const status = row.status || 'unknown';
      grouped[status] = (grouped[status] || 0) + 1;
    });

    return grouped;
  }

  /**
   * Busca slots disponíveis para um terapeuta em um dia
   */
  async findAvailableSlots(
    therapistId: string,
    date: Date,
    slotDuration: number = 60 // minutos
  ): Promise<{ start: Date; end: Date }[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0); // Começa às 8h

    const endOfDay = new Date(date);
    endOfDay.setHours(18, 0, 0, 0); // Termina às 18h

    // Buscar appointments do dia
    const appointments = await this.findMany({
      therapistId,
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      status: ['scheduled', 'confirmed', 'completed'],
    });

    // Gerar todos os slots possíveis
    const allSlots: { start: Date; end: Date }[] = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      if (slotEnd <= endOfDay) {
        allSlots.push({
          start: new Date(currentTime),
          end: slotEnd,
        });
      }

      currentTime = slotEnd;
    }

    // Filtrar slots disponíveis
    const availableSlots = allSlots.filter(slot => {
      return !appointments.some(apt => {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);

        // Verificar se há sobreposição
        return (
          (slot.start >= aptStart && slot.start < aptEnd) ||
          (slot.end > aptStart && slot.end <= aptEnd) ||
          (slot.start <= aptStart && slot.end >= aptEnd)
        );
      });
    });

    return availableSlots;
  }
}

// Singleton instance
export const appointmentRepository = new AppointmentRepository();

