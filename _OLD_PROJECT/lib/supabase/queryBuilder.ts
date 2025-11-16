/**
 * QueryBuilder - Helper para construir queries dinâmicas do Supabase
 * Facilita a construção de queries complexas com filtros opcionais
 */

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export type FilterOperator =
  | 'eq'    // igual
  | 'neq'   // diferente
  | 'gt'    // maior que
  | 'gte'   // maior ou igual
  | 'lt'    // menor que
  | 'lte'   // menor ou igual
  | 'like'  // LIKE
  | 'ilike' // ILIKE (case insensitive)
  | 'in'    // IN
  | 'is'    // IS NULL / IS NOT NULL
  | 'contains' // @> (JSONB contains)
  | 'containedBy' // <@ (JSONB contained by)
  | 'overlaps'; // && (array overlaps)

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface QueryBuilderOptions {
  filters?: FilterCondition[];
  search?: {
    query: string;
    fields: string[];
  };
  sort?: {
    field: string;
    ascending?: boolean;
  };
  pagination?: {
    page?: number;
    limit?: number;
    offset?: number;
  };
  select?: string;
}

/**
 * Aplica filtros dinâmicos a uma query
 */
export function applyFilters<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<any, T, any>,
  filters: FilterCondition[]
): PostgrestFilterBuilder<any, T, any> {
  let modifiedQuery = query;

  filters.forEach(({ field, operator, value }) => {
    // Ignorar valores undefined ou null (exceto para 'is')
    if (operator !== 'is' && (value === undefined || value === null)) {
      return;
    }

    switch (operator) {
      case 'eq':
        modifiedQuery = modifiedQuery.eq(field, value);
        break;
      case 'neq':
        modifiedQuery = modifiedQuery.neq(field, value);
        break;
      case 'gt':
        modifiedQuery = modifiedQuery.gt(field, value);
        break;
      case 'gte':
        modifiedQuery = modifiedQuery.gte(field, value);
        break;
      case 'lt':
        modifiedQuery = modifiedQuery.lt(field, value);
        break;
      case 'lte':
        modifiedQuery = modifiedQuery.lte(field, value);
        break;
      case 'like':
        modifiedQuery = modifiedQuery.like(field, value);
        break;
      case 'ilike':
        modifiedQuery = modifiedQuery.ilike(field, value);
        break;
      case 'in':
        modifiedQuery = modifiedQuery.in(field, value);
        break;
      case 'is':
        modifiedQuery = modifiedQuery.is(field, value);
        break;
      case 'contains':
        modifiedQuery = modifiedQuery.contains(field, value);
        break;
      case 'containedBy':
        modifiedQuery = modifiedQuery.containedBy(field, value);
        break;
      case 'overlaps':
        modifiedQuery = modifiedQuery.overlaps(field, value);
        break;
    }
  });

  return modifiedQuery;
}

/**
 * Aplica busca textual em múltiplos campos
 */
export function applySearch<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<any, T, any>,
  searchQuery: string,
  fields: string[]
): PostgrestFilterBuilder<any, T, any> {
  if (!searchQuery || !fields.length) {
    return query;
  }

  // Construir OR conditions para busca em múltiplos campos
  const searchPattern = `%${searchQuery}%`;
  
  // Para Supabase, usamos or() com ilike em cada campo
  const orConditions = fields.map(field => `${field}.ilike.%${searchQuery}%`).join(',');
  
  return query.or(orConditions);
}

/**
 * Aplica ordenação
 */
export function applySort<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<any, T, any>,
  field: string,
  ascending: boolean = true
): PostgrestFilterBuilder<any, T, any> {
  return query.order(field, { ascending });
}

/**
 * Aplica paginação
 */
export function applyPagination<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<any, T, any>,
  options: { page?: number; limit?: number; offset?: number }
): PostgrestFilterBuilder<any, T, any> {
  const { page, limit = 20, offset } = options;

  // Usar offset direto se fornecido, senão calcular do page
  const calculatedOffset = offset !== undefined ? offset : ((page || 1) - 1) * limit;

  return query.range(calculatedOffset, calculatedOffset + limit - 1);
}

/**
 * Constrói query completa com todas as opções
 */
export function buildQuery<T extends Record<string, any>>(
  baseQuery: PostgrestFilterBuilder<any, T, any>,
  options: QueryBuilderOptions
): PostgrestFilterBuilder<any, T, any> {
  let query = baseQuery;

  // Aplicar filtros
  if (options.filters && options.filters.length > 0) {
    query = applyFilters(query, options.filters);
  }

  // Aplicar busca
  if (options.search && options.search.query) {
    query = applySearch(query, options.search.query, options.search.fields);
  }

  // Aplicar ordenação
  if (options.sort) {
    query = applySort(query, options.sort.field, options.sort.ascending);
  }

  // Aplicar paginação
  if (options.pagination) {
    query = applyPagination(query, options.pagination);
  }

  return query;
}

/**
 * Helper para construir filtro de data range
 */
export function dateRangeFilter(
  field: string,
  startDate?: Date | string,
  endDate?: Date | string
): FilterCondition[] {
  const filters: FilterCondition[] = [];

  if (startDate) {
    filters.push({
      field,
      operator: 'gte',
      value: typeof startDate === 'string' ? startDate : startDate.toISOString(),
    });
  }

  if (endDate) {
    filters.push({
      field,
      operator: 'lte',
      value: typeof endDate === 'string' ? endDate : endDate.toISOString(),
    });
  }

  return filters;
}

/**
 * Helper para construir filtro de array (IN)
 */
export function inFilter(field: string, values: any[]): FilterCondition {
  return {
    field,
    operator: 'in',
    value: values,
  };
}

/**
 * Helper para construir filtro de busca textual
 */
export function textSearchFilter(field: string, query: string): FilterCondition {
  return {
    field,
    operator: 'ilike',
    value: `%${query}%`,
  };
}

/**
 * Helper para construir filtro IS NULL / IS NOT NULL
 */
export function nullFilter(field: string, isNull: boolean): FilterCondition {
  return {
    field,
    operator: 'is',
    value: isNull ? null : 'not.null',
  };
}

/**
 * Builder class para construção fluente
 */
export class QueryBuilder<T extends Record<string, any>> {
  private query: PostgrestFilterBuilder<any, T, any>;
  private options: QueryBuilderOptions = {};

  constructor(baseQuery: PostgrestFilterBuilder<any, T, any>) {
    this.query = baseQuery;
  }

  /**
   * Adiciona filtro
   */
  filter(field: string, operator: FilterOperator, value: any): this {
    if (!this.options.filters) {
      this.options.filters = [];
    }
    this.options.filters.push({ field, operator, value });
    return this;
  }

  /**
   * Adiciona busca textual
   */
  search(query: string, fields: string[]): this {
    this.options.search = { query, fields };
    return this;
  }

  /**
   * Adiciona ordenação
   */
  sort(field: string, ascending: boolean = true): this {
    this.options.sort = { field, ascending };
    return this;
  }

  /**
   * Adiciona paginação
   */
  paginate(page: number, limit: number = 20): this {
    this.options.pagination = { page, limit };
    return this;
  }

  /**
   * Define offset direto
   */
  offset(offset: number): this {
    if (!this.options.pagination) {
      this.options.pagination = {};
    }
    this.options.pagination.offset = offset;
    return this;
  }

  /**
   * Define limite de resultados
   */
  limit(limit: number): this {
    if (!this.options.pagination) {
      this.options.pagination = {};
    }
    this.options.pagination.limit = limit;
    return this;
  }

  /**
   * Constrói e retorna a query final
   */
  build(): PostgrestFilterBuilder<any, T, any> {
    return buildQuery(this.query, this.options);
  }
}

/**
 * Factory function para criar QueryBuilder
 */
export function createQueryBuilder<T extends Record<string, any>>(
  baseQuery: PostgrestFilterBuilder<any, T, any>
): QueryBuilder<T> {
  return new QueryBuilder(baseQuery);
}

