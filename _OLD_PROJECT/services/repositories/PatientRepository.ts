/**
 * PatientRepository - Repository para gerenciamento de pacientes
 * Responsável por todas as operações de banco de dados relacionadas a patients
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions, PaginationParams } from '../types/RepositoryTypes';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export interface PatientFilters {
  status?: string | string[];
  search?: string; // Busca por nome, CPF, email
}

export interface PatientWithDetails extends PatientRow {
  appointments?: any[];
  evolutions?: any[];
  lastAppointment?: any;
}

export class PatientRepository extends BaseRepository<
  PatientRow,
  PatientInsert,
  PatientUpdate
> {
  protected tableName = 'patients';

  /**
   * Busca pacientes com filtros
   */
  async findMany(
    filters?: PatientFilters,
    options?: QueryOptions
  ): Promise<PatientRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    // Filtro por status
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Busca textual (nome, CPF, email)
    if (filters?.search && filters.search.length >= 2) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},full_name.ilike.${searchTerm},cpf.ilike.${searchTerm},email.ilike.${searchTerm}`
      );
    }

    // Aplicar options (sort, pagination)
    query = this.applyOptions(query, options);

    // Ordenação padrão por nome
    if (!options?.sort) {
      query = query.order('name', { ascending: true });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Busca paciente por ID com dados relacionados
   */
  async findByIdWithDetails(id: string): Promise<PatientWithDetails | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        appointments:appointments!appointments_patient_id_fkey (
          id,
          start_time,
          end_time,
          status,
          type
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findByIdWithDetails');
    }

    return data;
  }

  /**
   * Busca paciente por CPF
   */
  async findByCpf(cpf: string): Promise<PatientRow | null> {
    // Remover formatação do CPF
    const cleanCpf = cpf.replace(/\D/g, '');

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('cpf', cleanCpf)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findByCpf');
    }

    return data;
  }

  /**
   * Busca paciente por email
   */
  async findByEmail(email: string): Promise<PatientRow | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .ilike('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findByEmail');
    }

    return data;
  }

  /**
   * Busca textual por nome, CPF ou email
   */
  async search(
    query: string,
    options?: { limit?: number; offset?: number }
  ): Promise<PatientRow[]> {
    if (query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;

    let dbQuery = this.supabase
      .from(this.tableName)
      .select('*')
      .or(
        `name.ilike.${searchTerm},full_name.ilike.${searchTerm},cpf.ilike.${searchTerm},email.ilike.${searchTerm}`
      )
      .order('name', { ascending: true });

    if (options?.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    if (options?.offset) {
      dbQuery = dbQuery.range(
        options.offset,
        options.offset + (options.limit || 20) - 1
      );
    }

    return this.executeQuery(() => dbQuery, 'search');
  }

  /**
   * Atualiza status do paciente
   */
  async updateStatus(id: string, status: string): Promise<PatientRow> {
    return this.update(id, { status } as PatientUpdate);
  }

  /**
   * Busca pacientes recentes (últimos 5)
   */
  async findRecent(limit: number = 5): Promise<PatientRow[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.handleError(error, 'findRecent');
    }

    return data || [];
  }

  /**
   * Busca pacientes ativos
   */
  async findActive(options?: QueryOptions): Promise<PatientRow[]> {
    return this.findMany({ status: 'active' }, options);
  }

  /**
   * Busca pacientes inativos
   */
  async findInactive(options?: QueryOptions): Promise<PatientRow[]> {
    return this.findMany({ status: 'inactive' }, options);
  }

  /**
   * Conta pacientes por status
   */
  async countByStatus(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('status');

    if (error) {
      this.handleError(error, 'countByStatus');
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
   * Busca pacientes com appointments próximos
   */
  async findWithUpcomingAppointments(days: number = 7): Promise<PatientRow[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        appointments:appointments!appointments_patient_id_fkey (
          id,
          start_time
        )
      `)
      .gte('appointments.start_time', now.toISOString())
      .lte('appointments.start_time', future.toISOString());

    if (error) {
      this.handleError(error, 'findWithUpcomingAppointments');
    }

    return data || [];
  }

  /**
   * Verifica se CPF já existe
   */
  async cpfExists(cpf: string, excludeId?: string): Promise<boolean> {
    const cleanCpf = cpf.replace(/\D/g, '');

    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('cpf', cleanCpf);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      this.handleError(error, 'cpfExists');
    }

    return (count ?? 0) > 0;
  }

  /**
   * Verifica se email já existe
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .ilike('email', email);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      this.handleError(error, 'emailExists');
    }

    return (count ?? 0) > 0;
  }
}

// Singleton instance
export const patientRepository = new PatientRepository();

