/**
 * UserRepository - Repository para gerenciamento de usuários
 * Responsável por operações de banco de dados relacionadas a users
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface UserFilters {
  role?: string | string[];
  search?: string;
}

export class UserRepository extends BaseRepository<
  UserRow,
  UserInsert,
  UserUpdate
> {
  protected tableName = 'users';

  /**
   * Busca usuários com filtros
   */
  async findMany(
    filters?: UserFilters,
    options?: QueryOptions
  ): Promise<UserRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    // Filtro por role
    if (filters?.role) {
      if (Array.isArray(filters.role)) {
        query = query.in('role', filters.role);
      } else {
        query = query.eq('role', filters.role);
      }
    }

    // Busca textual (nome, email)
    if (filters?.search && filters.search.length >= 2) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    query = this.applyOptions(query, options);

    if (!options?.sort) {
      query = query.order('name', { ascending: true });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<UserRow | null> {
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
   * Busca apenas terapeutas
   */
  async findTherapists(options?: QueryOptions): Promise<UserRow[]> {
    return this.findMany({ role: 'therapist' }, options);
  }

  /**
   * Busca terapeutas ativos
   */
  async findActiveTherapists(): Promise<UserRow[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'therapist')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      this.handleError(error, 'findActiveTherapists');
    }

    return data || [];
  }

  /**
   * Atualiza role do usuário
   */
  async updateRole(id: string, role: string): Promise<UserRow> {
    return this.update(id, { role } as UserUpdate);
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
export const userRepository = new UserRepository();

