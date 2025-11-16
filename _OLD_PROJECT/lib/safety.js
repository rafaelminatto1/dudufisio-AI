// Advanced undefined safety utilities
// Architectural solution for null/undefined safety across the application
// === Safe property access ===
/**
 * Safely access nested properties with undefined checks
 * Usage: safeGet(obj, 'prop1.prop2.prop3', 'default')
 */
export function safeGet(obj, path, defaultValue) {
    if (!obj || typeof obj !== 'object')
        return defaultValue;
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
export function safeAccess(obj, key) {
    return obj && typeof obj === 'object' && key in obj ? obj[key] : undefined;
}
/**
 * Safe method call with null/undefined checks
 */
export function safeCall(fn, ...args) {
    return typeof fn === 'function' ? fn(...args) : undefined;
}
// === Array safety utilities ===
/**
 * Safely access array element
 */
export function safeArrayGet(array, index, defaultValue) {
    if (!Array.isArray(array) || index < 0 || index >= array.length) {
        return defaultValue;
    }
    return array[index] ?? defaultValue;
}
/**
 * Safe array map with null filtering
 */
export function safeMap(array, mapper) {
    if (!Array.isArray(array))
        return [];
    return array
        .map(mapper)
        .filter((item) => item != null);
}
/**
 * Safe array find with type guard
 */
export function safeFind(array, predicate) {
    if (!Array.isArray(array))
        return undefined;
    return array.find(predicate);
}
/**
 * Safe array filter with type narrowing
 */
export function safeFilter(array, predicate) {
    if (!Array.isArray(array))
        return [];
    return array.filter(predicate);
}
// === String safety utilities ===
/**
 * Safe string operations
 */
export function safeString(value, defaultValue = '') {
    return value ?? defaultValue;
}
/**
 * Safe string length check
 */
export function safeStringLength(value) {
    return value?.length ?? 0;
}
/**
 * Safe string includes check
 */
export function safeIncludes(str, searchString) {
    return str?.includes(searchString) ?? false;
}
// === Number safety utilities ===
/**
 * Safe number parsing
 */
export function safeNumber(value, defaultValue = 0) {
    if (typeof value === 'number' && !isNaN(value))
        return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
}
/**
 * Safe integer parsing
 */
export function safeInt(value, defaultValue = 0) {
    if (typeof value === 'number' && Number.isInteger(value))
        return value;
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
export function safeDate(value) {
    if (value instanceof Date && !isNaN(value.getTime()))
        return value;
    if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}
/**
 * Safe date formatting
 */
export function safeDateFormat(value, options) {
    const date = safeDate(value);
    if (!date)
        return '';
    try {
        return date.toLocaleDateString('pt-BR', options);
    }
    catch {
        return date.toISOString().split('T')[0] || '';
    }
}
// === Object safety utilities ===
/**
 * Safe object merge with undefined filtering
 */
export function safeMerge(target, source) {
    const result = { ...(target || {}) };
    if (source && typeof source === 'object') {
        Object.entries(source).forEach(([key, value]) => {
            if (value !== undefined) {
                result[key] = value;
            }
        });
    }
    return result;
}
/**
 * Safe object key extraction
 */
export function safeKeys(obj) {
    if (!obj || typeof obj !== 'object')
        return [];
    return Object.keys(obj);
}
/**
 * Safe object values extraction
 */
export function safeValues(obj) {
    if (!obj || typeof obj !== 'object')
        return [];
    return Object.values(obj);
}
// === Promise safety utilities ===
/**
 * Safe promise execution with error handling
 */
export async function safeAsync(promise) {
    try {
        const data = await promise;
        return { success: true, data };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error))
        };
    }
}
/**
 * Safe promise with timeout
 */
export async function safeAsyncWithTimeout(promise, timeoutMs, timeoutValue) {
    try {
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(timeoutValue), timeoutMs);
        });
        const result = await Promise.race([promise, timeoutPromise]);
        return result;
    }
    catch {
        return timeoutValue;
    }
}
// === Validation utilities ===
/**
 * Safe validation with multiple validators
 */
export function safeValidate(value, validators) {
    const allErrors = [];
    for (const validator of validators) {
        try {
            const result = validator(value);
            if (!result.isValid) {
                allErrors.push(...result.errors);
            }
        }
        catch (error) {
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
export function safeEventHandler(handler) {
    return (event) => {
        try {
            handler?.(event);
        }
        catch (error) {
            console.error('Event handler error:', error);
        }
    };
}
/**
 * Safe async event handler execution
 */
export function safeAsyncEventHandler(handler) {
    return (event) => {
        if (!handler)
            return;
        handler(event).catch((error) => {
            console.error('Async event handler error:', error);
        });
    };
}
/**
 * Safe state update with validation
 */
export function safeStateUpdate(setValue, newValue, validator) {
    try {
        if (typeof newValue === 'function') {
            setValue((prev) => {
                const computed = newValue(prev);
                return validator ? (validator(computed) ? computed : prev) : computed;
            });
        }
        else {
            if (validator && !validator(newValue)) {
                console.warn('State update validation failed');
                return;
            }
            setValue(newValue);
        }
    }
    catch (error) {
        console.error('State update error:', error);
    }
}
// === Type guard utilities ===
/**
 * Type guard for non-null values
 */
export function isNotNull(value) {
    return value !== null;
}
/**
 * Type guard for defined values
 */
export function isDefined(value) {
    return value !== undefined;
}
/**
 * Type guard for non-null and defined values
 */
export function isPresent(value) {
    return value != null;
}
/**
 * Type guard for non-empty strings
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Type guard for valid arrays
 */
export function isValidArray(value) {
    return Array.isArray(value) && value.length > 0;
}
// === Development utilities ===
/**
 * Safe console logging with context
 */
export function safeLog(message, data, level = 'log') {
    if (process.env['NODE_ENV'] === 'development') {
        console[level](`[SafetyUtil] ${message}`, data);
    }
}
/**
 * Safe error boundary helper
 */
export function safeErrorBoundary(fn, fallback, errorHandler) {
    try {
        return fn();
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorHandler?.(err);
        safeLog('Error boundary caught error', err, 'error');
        return fallback;
    }
}
