/**
 * Tipos genéricos para repositories
 * Padronização de interfaces comuns em toda a aplicação
 */

import type { Database } from '@/types/supabase';

// ============================================================================
// TIPOS DO SUPABASE
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// ============================================================================
// PAGINAÇÃO
// ============================================================================

export interface PaginationParams {
  /**
   * Número da página (começa em 1)
   */
  page?: number;
  
  /**
   * Quantidade de itens por página
   * @default 20
   */
  limit?: number;
  
  /**
   * Offset manual (alternativa ao page)
   */
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================================================
// ORDENAÇÃO
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortParams<T = string> {
  field: T;
  direction?: SortDirection;
}

// ============================================================================
// FILTROS
// ============================================================================

export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface SearchFilter {
  query: string;
  fields?: string[];
}

export interface StatusFilter {
  status?: string | string[];
}

// ============================================================================
// QUERY OPTIONS
// ============================================================================

export interface QueryOptions {
  /**
   * Paginação
   */
  pagination?: PaginationParams;
  
  /**
   * Ordenação
   */
  sort?: SortParams;
  
  /**
   * Incluir dados deletados (soft delete)
   */
  includeDeleted?: boolean;
  
  /**
   * Timeout da query (ms)
   */
  timeout?: number;
}

// ============================================================================
// REPOSITORY ERRORS
// ============================================================================

export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} não encontrado: ${id}`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ConflictError extends RepositoryError {
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// ============================================================================
// REPOSITORY RESPONSE
// ============================================================================

export interface RepositoryResponse<T> {
  data: T;
  error: null;
}

export interface RepositoryErrorResponse {
  data: null;
  error: RepositoryError;
}

export type RepositoryResult<T> = RepositoryResponse<T> | RepositoryErrorResponse;

// ============================================================================
// BASE REPOSITORY INTERFACE
// ============================================================================

export interface IBaseRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  /**
   * Busca múltiplos registros
   */
  findMany(options?: QueryOptions): Promise<T[]>;
  
  /**
   * Busca um registro por ID
   */
  findById(id: string): Promise<T | null>;
  
  /**
   * Cria um novo registro
   */
  create(data: TInsert): Promise<T>;
  
  /**
   * Atualiza um registro existente
   */
  update(id: string, data: TUpdate): Promise<T>;
  
  /**
   * Deleta um registro
   */
  delete(id: string): Promise<void>;
  
  /**
   * Conta registros
   */
  count(options?: QueryOptions): Promise<number>;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Transforma nomes de colunas snake_case para camelCase
 */
export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

/**
 * Transforma objeto com keys snake_case para camelCase
 */
export type CamelCaseObject<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K];
};

/**
 * Campos de auditoria comuns
 */
export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Campos de criação
 */
export interface CreatedBy {
  createdBy?: string | null;
}

/**
 * Campos de atualização
 */
export interface UpdatedBy {
  updatedBy?: string | null;
}

