// Advanced undefined safety utilities
// Architectural solution for null/undefined safety across the application

import type { Result, ValidationResult } from '../types/utils';

// === Safe property access ===

/**
 * Safely access nested properties with undefined checks
 * Usage: safeGet(obj, 'prop1.prop2.prop3', 'default')
 */
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== 'object') return defaultValue;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current ?? defaultValue;
}

/**
 * Safe property access with type checking
 */
export function safeAccess<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | undefined {
  return obj && typeof obj === 'object' && key in obj ? obj[key] : undefined;
}

/**
 * Safe method call with null/undefined checks
 */
export function safeCall<TArgs extends any[], TReturn>(
  fn: ((...args: TArgs) => TReturn) | null | undefined,
  ...args: TArgs
): TReturn | undefined {
  return typeof fn === 'function' ? fn(...args) : undefined;
}

// === Array safety utilities ===

/**
 * Safely access array element
 */
export function safeArrayGet<T>(
  array: T[] | null | undefined,
  index: number,
  defaultValue?: T
): T | undefined {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index] ?? defaultValue;
}

/**
 * Safe array map with null filtering
 */
export function safeMap<T, U>(
  array: T[] | null | undefined,
  mapper: (item: T, index: number) => U | null | undefined
): U[] {
  if (!Array.isArray(array)) return [];

  return array
    .map(mapper)
    .filter((item): item is U => item != null);
}

/**
 * Safe array find with type guard
 */
export function safeFind<T>(
  array: T[] | null | undefined,
  predicate: (item: T) => boolean
): T | undefined {
  if (!Array.isArray(array)) return undefined;
  return array.find(predicate);
}

/**
 * Safe array filter with type narrowing
 */
export function safeFilter<T, U extends T>(
  array: T[] | null | undefined,
  predicate: (item: T) => item is U
): U[] {
  if (!Array.isArray(array)) return [];
  return array.filter(predicate);
}

// === String safety utilities ===

/**
 * Safe string operations
 */
export function safeString(
  value: string | null | undefined,
  defaultValue: string = ''
): string {
  return value ?? defaultValue;
}

/**
 * Safe string length check
 */
export function safeStringLength(
  value: string | null | undefined
): number {
  return value?.length ?? 0;
}

/**
 * Safe string includes check
 */
export function safeIncludes(
  str: string | null | undefined,
  searchString: string
): boolean {
  return str?.includes(searchString) ?? false;
}

// === Number safety utilities ===

/**
 * Safe number parsing
 */
export function safeNumber(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Safe integer parsing
 */
export function safeInt(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

// === Date safety utilities ===

/**
 * Safe date creation
 */
export function safeDate(
  value: string | Date | null | undefined
): Date | null {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Safe date formatting
 */
export function safeDateFormat(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = safeDate(value);
  if (!date) return '';

  try {
    return date.toLocaleDateString('pt-BR', options);
  } catch {
    return date.toISOString().split('T')[0] || '';
  }
}

// === Object safety utilities ===

/**
 * Safe object merge with undefined filtering
 */
export function safeMerge<T extends Record<string, any>>(
  target: T | null | undefined,
  source: Partial<T> | null | undefined
): T {
  const result = { ...(target || {}) } as T;

  if (source && typeof source === 'object') {
    Object.entries(source).forEach(([key, value]) => {
      if (value !== undefined) {
        (result as any)[key] = value;
      }
    });
  }

  return result;
}

/**
 * Safe object key extraction
 */
export function safeKeys<T extends Record<string, any>>(
  obj: T | null | undefined
): (keyof T)[] {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Safe object values extraction
 */
export function safeValues<T extends Record<string, any>>(
  obj: T | null | undefined
): T[keyof T][] {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj);
}

// === Promise safety utilities ===

/**
 * Safe promise execution with error handling
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<Result<T, Error>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Safe promise with timeout
 */
export async function safeAsyncWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutValue?: T
): Promise<T | undefined> {
  try {
    const timeoutPromise = new Promise<T | undefined>((resolve) => {
      setTimeout(() => resolve(timeoutValue), timeoutMs);
    });

    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch {
    return timeoutValue;
  }
}

// === Validation utilities ===

/**
 * Safe validation with multiple validators
 */
export function safeValidate<T>(
  value: T,
  validators: Array<(value: T) => ValidationResult>
): ValidationResult {
  const allErrors: string[] = [];

  for (const validator of validators) {
    try {
      const result = validator(value);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    } catch (error) {
      allErrors.push(`Validation error: ${error}`);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// === React-specific safety utilities ===

/**
 * Safe event handler execution
 */
export function safeEventHandler<T extends Event>(
  handler: ((event: T) => void) | null | undefined
): (event: T) => void {
  return (event: T) => {
    try {
      handler?.(event);
    } catch (error) {
      console.error('Event handler error:', error);
    }
  };
}

/**
 * Safe async event handler execution
 */
export function safeAsyncEventHandler<T extends Event>(
  handler: ((event: T) => Promise<void>) | null | undefined
): (event: T) => void {
  return (event: T) => {
    if (!handler) return;

    handler(event).catch((error) => {
      console.error('Async event handler error:', error);
    });
  };
}

/**
 * Safe state update with validation
 */
export function safeStateUpdate<T>(
  setValue: (value: T | ((prev: T) => T)) => void,
  newValue: T | ((prev: T) => T),
  validator?: (value: T) => boolean
): void {
  try {
    if (typeof newValue === 'function') {
      setValue((prev) => {
        const computed = (newValue as (prev: T) => T)(prev);
        return validator ? (validator(computed) ? computed : prev) : computed;
      });
    } else {
      if (validator && !validator(newValue)) {
        console.warn('State update validation failed');
        return;
      }
      setValue(newValue);
    }
  } catch (error) {
    console.error('State update error:', error);
  }
}

// === Type guard utilities ===

/**
 * Type guard for non-null values
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Type guard for defined values
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard for non-null and defined values
 */
export function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

/**
 * Type guard for non-empty strings
 */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for valid arrays
 */
export function isValidArray<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

// === Development utilities ===

/**
 * Safe console logging with context
 */
export function safeLog(message: string, data?: any, level: 'log' | 'warn' | 'error' = 'log'): void {
  if (process.env['NODE_ENV'] === 'development') {
    console[level](`[SafetyUtil] ${message}`, data);
  }
}

/**
 * Safe error boundary helper
 */
export function safeErrorBoundary<T>(
  fn: () => T,
  fallback: T,
  errorHandler?: (error: Error) => void
): T {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    errorHandler?.(err);
    safeLog('Error boundary caught error', err, 'error');
    return fallback;
  }
}