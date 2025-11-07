/**
 * BaseRepository - Classe base para todos os repositories
 * Fornece métodos comuns reutilizáveis e padronização de queries
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type {
  PaginationParams,
  PaginationResult,
  QueryOptions,
  SortParams,
} from '../types/RepositoryTypes';

export abstract class BaseRepository<TRow = any, TInsert = any, TUpdate = any> {
  protected supabase: SupabaseClient;
  protected abstract tableName: string;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || supabase;
  }

  /**
   * Aplica paginação à query
   */
  protected applyPagination<T>(
    query: any,
    pagination?: PaginationParams
  ): any {
    if (!pagination) return query;

    const { page, limit = 20, offset } = pagination;

    // Usar offset direto se fornecido, senão calcular do page
    const calculatedOffset = offset !== undefined ? offset : ((page || 1) - 1) * limit;

    return query.range(calculatedOffset, calculatedOffset + limit - 1);
  }

  /**
   * Aplica ordenação à query
   */
  protected applySort<T>(
    query: any,
    sort?: SortParams
  ): any {
    if (!sort) return query;

    const { field, direction = 'asc' } = sort;
    return query.order(field, { ascending: direction === 'asc' });
  }

  /**
   * Aplica options gerais (paginação, sort, etc)
   */
  protected applyOptions(query: any, options?: QueryOptions): any {
    let modifiedQuery = query;

    if (options?.sort) {
      modifiedQuery = this.applySort(modifiedQuery, options.sort);
    }

    if (options?.pagination) {
      modifiedQuery = this.applyPagination(modifiedQuery, options.pagination);
    }

    return modifiedQuery;
  }

  /**
   * Cria resultado paginado
   */
  protected createPaginatedResult<T>(
    data: T[],
    total: number,
    pagination: PaginationParams = {}
  ): PaginationResult<T> {
    const { page = 1, limit = 20 } = pagination;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Handler de erro padrão
   */
  protected handleError(error: any, operation: string): never {
    console.error(`[${this.tableName}] Erro em ${operation}:`, error);

    if (error.code === 'PGRST116') {
      throw new Error(`Registro não encontrado em ${this.tableName}`);
    }

    if (error.code === '23505') {
      throw new Error(`Registro duplicado em ${this.tableName}`);
    }

    if (error.code === '23503') {
      throw new Error(`Violação de chave estrangeira em ${this.tableName}`);
    }

    throw new Error(
      `Erro ao executar ${operation} em ${this.tableName}: ${error.message || 'Erro desconhecido'}`
    );
  }

  /**
   * Executa query com tratamento de erro
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    operation: string
  ): Promise<T> {
    const { data, error } = await queryFn();

    if (error) {
      this.handleError(error, operation);
    }

    if (data === null) {
      throw new Error(`Nenhum dado retornado de ${operation}`);
    }

    return data;
  }

  /**
   * Busca todos os registros da tabela
   */
  async findAll(options?: QueryOptions): Promise<TRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    query = this.applyOptions(query, options);

    return this.executeQuery(
      () => query,
      'findAll'
    );
  }

  /**
   * Busca registro por ID
   */
  async findById(id: string): Promise<TRow | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      this.handleError(error, 'findById');
    }

    return data;
  }

  /**
   * Busca registro por ID ou lança erro
   */
  async findByIdOrFail(id: string): Promise<TRow> {
    const result = await this.findById(id);

    if (!result) {
      throw new Error(`${this.tableName} não encontrado: ${id}`);
    }

    return result;
  }

  /**
   * Cria novo registro
   */
  async create(data: TInsert): Promise<TRow> {
    return this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single(),
      'create'
    );
  }

  /**
   * Cria múltiplos registros
   */
  async createMany(data: TInsert[]): Promise<TRow[]> {
    return this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .insert(data)
        .select(),
      'createMany'
    );
  }

  /**
   * Atualiza registro
   */
  async update(id: string, data: TUpdate): Promise<TRow> {
    return this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single(),
      'update'
    );
  }

  /**
   * Atualiza múltiplos registros
   */
  async updateMany(ids: string[], data: TUpdate): Promise<TRow[]> {
    return this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .update(data)
        .in('id', ids)
        .select(),
      'updateMany'
    );
  }

  /**
   * Deleta registro (hard delete)
   */
  async delete(id: string): Promise<void> {
    await this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single(),
      'delete'
    );
  }

  /**
   * Deleta múltiplos registros
   */
  async deleteMany(ids: string[]): Promise<void> {
    await this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .delete()
        .in('id', ids),
      'deleteMany'
    );
  }

  /**
   * Soft delete (se a tabela tiver campo deleted_at)
   */
  async softDelete(id: string): Promise<TRow> {
    return this.update(id, { deleted_at: new Date().toISOString() } as any);
  }

  /**
   * Conta registros
   */
  async count(filters?: Record<string, any>): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    // Aplicar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      this.handleError(error, 'count');
    }

    return count ?? 0;
  }

  /**
   * Verifica se registro existe
   */
  async exists(id: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('id', id);

    if (error) {
      this.handleError(error, 'exists');
    }

    return (count ?? 0) > 0;
  }

  /**
   * Busca primeiro registro que atende condição
   */
  async findFirst(filters: Record<string, any>): Promise<TRow | null> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .limit(1);

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findFirst');
    }

    return data;
  }

  /**
   * Upsert (insert ou update)
   */
  async upsert(data: TInsert, onConflict?: string): Promise<TRow> {
    const config: any = { onConflict };

    return this.executeQuery(
      () => this.supabase
        .from(this.tableName)
        .upsert(data, config)
        .select()
        .single(),
      'upsert'
    );
  }
}

