// Advanced TypeScript utility types for complex object matching resolution
// This file provides architectural solutions for type safety across the application
// Helper for conditional object spread (replaces { prop: value | undefined })
export function assignIfDefined(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
// Utility for conditional object properties
export function conditionalProps(condition, props) {
    return condition ? props : {};
}
// Safe object merge that respects exactOptionalPropertyTypes
export function safeMerge(base, override) {
    return { ...base, ...assignIfDefined(override) };
}
// === Type guards and assertions ===
// Type guard for checking if value is defined
export function isDefined(value) {
    return value !== undefined && value !== null;
}
// Type guard for checking if object has property
export function hasProperty(obj, key) {
    return typeof obj === 'object' && obj !== null && key in obj;
}
// Type guard for arrays
export function isArray(value) {
    return Array.isArray(value);
}
// Type guard for non-empty arrays
export function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}
