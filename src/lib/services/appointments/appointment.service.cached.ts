/**
 * Appointment Service com Cache (Next.js 16)
 * Usa React cache() e Next.js cacheLife para otimizar queries de agendamentos
 */

import { cache } from 'react';
import { unstable_cacheLife as cacheLife } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

/**
 * Get appointments with filters - Cached
 * Cache: Padrão (15 min) pois agendamentos mudam com frequência moderada
 */
export const getAppointments = cache(
  async (filters?: {
    patientId?: string;
    therapistId?: string;
    status?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('default'); // 15 minutos

    const supabase = await createServerComponentClient();
    let query = supabase
      .from('appointments')
      .select('*, patient:patients(*), therapist:therapists(*)')
      .order('start_time', { ascending: true });

    if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters?.therapistId) query = query.eq('therapist_id', filters.therapistId);
    if (filters?.status) query = query.eq('status', filters.status);

    if (filters?.startDate) {
      const startDate =
        filters.startDate instanceof Date
          ? filters.startDate.toISOString()
          : filters.startDate;
      query = query.gte('start_time', startDate);
    }

    if (filters?.endDate) {
      const endDate =
        filters.endDate instanceof Date ? filters.endDate.toISOString() : filters.endDate;
      query = query.lte('end_time', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
);

/**
 * Get appointments for today - Cached
 * Cache: Curto (5 min) pois muda frequentemente durante o dia
 */
export const getTodayAppointments = cache(async (therapistId?: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('default');

  const supabase = await createServerComponentClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let query = supabase
    .from('appointments')
    .select('*, patient:patients(*), therapist:therapists(*)')
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .order('start_time', { ascending: true });

  if (therapistId) {
    query = query.eq('therapist_id', therapistId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
});

/**
 * Get week appointments - Cached
 * Cache: Padrão (15 min)
 */
export const getWeekAppointments = cache(async (therapistId?: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('default');

  const supabase = await createServerComponentClient();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  let query = supabase
    .from('appointments')
    .select('*, patient:patients(*), therapist:therapists(*)')
    .gte('start_time', startOfWeek.toISOString())
    .lt('start_time', endOfWeek.toISOString())
    .order('start_time', { ascending: true });

  if (therapistId) {
    query = query.eq('therapist_id', therapistId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
});

/**
 * Get appointment by ID - Cached
 * Cache: Horas (dados de agendamento específico mudam pouco)
 */
export const getAppointmentById = cache(async (id: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('hours');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patient:patients(*), therapist:therapists(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

/**
 * Get appointment statistics - Cached
 * Cache: Máximo (estatísticas podem esperar)
 */
export const getAppointmentStats = cache(
  async (startDate?: Date, endDate?: Date) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('max');

    const supabase = await createServerComponentClient();
    const start = startDate || new Date(new Date().setDate(1)); // Início do mês
    const end = endDate || new Date();

    const [totalResult, completedResult, cancelledResult, pendingResult] =
      await Promise.all([
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString()),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString()),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled')
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString()),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled')
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString()),
      ]);

    return {
      total: totalResult.count || 0,
      completed: completedResult.count || 0,
      cancelled: cancelledResult.count || 0,
      pending: pendingResult.count || 0,
      completionRate:
        totalResult.count && completedResult.count
          ? (completedResult.count / totalResult.count) * 100
          : 0,
    };
  }
);

/**
 * Check availability - Cached
 * Cache: Curto pois pode mudar rapidamente
 */
export const checkAvailability = cache(
  async (
    therapistId: string,
    startTime: Date | string,
    endTime: Date | string,
    excludeAppointmentId?: string
  ) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('default');

    const supabase = await createServerComponentClient();
    const start = startTime instanceof Date ? startTime.toISOString() : startTime;
    const end = endTime instanceof Date ? endTime.toISOString() : endTime;

    let query = supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapistId)
      .neq('status', 'cancelled')
      .or(`start_time.lte.${start},end_time.gte.${end}`);

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data?.length || 0) === 0; // true se disponível
  }
);

// Mutations (não cached) - usar com revalidateTag
export class AppointmentServiceMutations {
  static async create(appointment: AppointmentInsert) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag('appointments');
    // revalidateTag(`appointments-therapist-${appointment.therapist_id}`);

    return data;
  }

  static async update(id: string, appointment: AppointmentUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('appointments')
      .update(appointment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag(`appointment-${id}`);
    // revalidateTag('appointments');

    return data;
  }

  static async delete(id: string) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag('appointments');

    return true;
  }

  static async updateStatus(id: string, status: string) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag(`appointment-${id}`);
    // revalidateTag('appointments');

    return data;
  }
}
