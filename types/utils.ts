// Advanced TypeScript utility types for complex object matching resolution
// This file provides architectural solutions for type safety across the application

import type { Database } from './database';

// === Database-aware utility types ===

// Extract table row types with proper constraints
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// === Generic constraint utilities ===

// Safe property access with undefined checks
export type SafeAccess<T, K extends keyof T> = T[K] extends undefined ? never : T[K];

// Require specific properties from a partial type
export type RequireProperties<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make specific properties optional
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// === Modal and form interface patterns ===

// Standard modal interface pattern
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form modal with data handling
export interface FormModalProps<TData = any> extends BaseModalProps {
  initialData?: Partial<TData>;
  onSave: (data: TData) => Promise<void> | void;
}

// Selection modal interface
export interface SelectionModalProps<TItem = any> extends BaseModalProps {
  items: TItem[];
  selectedItem?: TItem;
  onSelect: (item: TItem) => void;
}

// === API response patterns ===

// Standard API response wrapper
export interface ApiResponse<TData = any> {
  data?: TData;
  error?: string;
  success: boolean;
}

// Paginated response pattern
export interface PaginatedResponse<TData = any> extends ApiResponse<TData[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Undefined safety patterns ===

// Non-nullable assertion helper
export type NonNullable<T> = T extends null | undefined ? never : T;

// Safe array access
export type SafeArray<T> = T extends readonly (infer U)[] ? U[] : never;

// Conditional property based on another property
export type ConditionalProperty<T, K extends keyof T, V> =
  T[K] extends V ? T : never;

// === Component prop patterns ===

// Standard component with className support
export interface WithClassName {
  className?: string;
}

// Component with loading state
export interface WithLoading {
  isLoading?: boolean;
}

// Component with error handling
export interface WithError {
  error?: string | null;
}

// Standard data component pattern
export interface DataComponentProps<TData = any>
  extends WithClassName, WithLoading, WithError {
  data?: TData;
  onRefresh?: () => void;
}

// === Event handler patterns ===

// Standard event handler types
export type EventHandler<TEvent = Event> = (event: TEvent) => void;
export type AsyncEventHandler<TEvent = Event> = (event: TEvent) => Promise<void>;

// Form event handlers
export type FormEventHandler = EventHandler<React.FormEvent>;
export type ChangeEventHandler<T = HTMLInputElement> = EventHandler<React.ChangeEvent<T>>;
export type ClickEventHandler = EventHandler<React.MouseEvent>;

// === Service layer patterns ===

// Standard service method pattern
export type ServiceMethod<TParams = any, TReturn = any> =
  (params: TParams) => Promise<TReturn>;

// CRUD service interface pattern
export interface CrudService<TEntity, TCreateData = Partial<TEntity>, TUpdateData = Partial<TEntity>> {
  getAll(): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | null>;
  create(data: TCreateData): Promise<TEntity>;
  update(id: string, data: TUpdateData): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

// === Context patterns ===

// Standard context value pattern
export interface ContextValue<TState = any, TActions = any> {
  state: TState;
  actions: TActions;
}

// Context with loading and error state
export interface AsyncContextValue<TData = any> extends WithLoading, WithError {
  data?: TData;
  refetch: () => Promise<void>;
}

// === Type guards and assertions ===

// Type guard for checking if value is defined
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// Type guard for checking if object has property
export function hasProperty<T, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Type guard for arrays
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// Type guard for non-empty arrays
export function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

// === Merge utilities for complex objects ===

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Merge two types with the second overriding the first
export type Merge<T, U> = Omit<T, keyof U> & U;

// Merge multiple types
export type MergeAll<T extends readonly unknown[]> = T extends readonly [infer First, ...infer Rest]
  ? Rest extends readonly []
    ? First
    : Merge<First, MergeAll<Rest>>
  : {};

// === Database join patterns ===

// Join result pattern for related data
export type WithRelated<T, K extends string, R> = T & Record<K, R>;

// Optional join result
export type WithOptionalRelated<T, K extends string, R> = T & Record<K, R | null>;

// Multiple related records
export type WithMultipleRelated<T, K extends string, R> = T & Record<K, R[]>;

// === Error handling patterns ===

// Result type for operations that can fail
export type Result<TSuccess, TError = Error> =
  | { success: true; data: TSuccess }
  | { success: false; error: TError };

// Async result type
export type AsyncResult<TSuccess, TError = Error> = Promise<Result<TSuccess, TError>>;

// === Validation patterns ===

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Field validation result
export type FieldValidationResult<T> = {
  [K in keyof T]?: ValidationResult;
};

// === Cache and performance patterns ===

// Cached data with metadata
export interface CachedData<T> {
  data: T;
  timestamp: number;
  expires: number;
}

// Performance metrics
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  totalTime: number;
}

// === Export commonly used patterns ===

// Re-export database types for convenience
export type { Database } from './database';
export type AppointmentRow = TableRow<'appointments'>;
export type PatientRow = TableRow<'patients'>;
export type UserRow = TableRow<'users'>;
export type PainPointRow = TableRow<'pain_points'>;
export type SessionRow = TableRow<'sessions'>;

export type AppointmentInsert = TableInsert<'appointments'>;
export type PatientInsert = TableInsert<'patients'>;
export type UserInsert = TableInsert<'users'>;

export type AppointmentUpdate = TableUpdate<'appointments'>;
export type PatientUpdate = TableUpdate<'patients'>;
export type UserUpdate = TableUpdate<'users'>;