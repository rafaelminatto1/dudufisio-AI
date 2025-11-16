// Common HTTP status codes for healthcare APIs
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};
// Error codes for healthcare context
export const ERROR_CODES = {
    // Authentication & Authorization
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_CPF: 'INVALID_CPF',
    INVALID_PHONE: 'INVALID_PHONE',
    INVALID_DATE: 'INVALID_DATE',
    // Business Logic
    SCHEDULING_CONFLICT: 'SCHEDULING_CONFLICT',
    PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
    APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
    DUPLICATE_CPF: 'DUPLICATE_CPF',
    // Healthcare Compliance
    PATIENT_DATA_SECURITY: 'PATIENT_DATA_SECURITY',
    LGPD_VIOLATION: 'LGPD_VIOLATION',
    AUDIT_REQUIRED: 'AUDIT_REQUIRED',
    CONSENT_REQUIRED: 'CONSENT_REQUIRED',
    // System
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};
// Helper functions for error handling
export function isApiError(error) {
    return Boolean(error && typeof error === 'object' && 'error' in error && 'message' in error);
}
export function isValidationError(error) {
    return isApiError(error) && error.code === ERROR_CODES.VALIDATION_ERROR;
}
export function isAuthenticationError(error) {
    return isApiError(error) && [
        ERROR_CODES.AUTH_REQUIRED,
        ERROR_CODES.TOKEN_EXPIRED,
        ERROR_CODES.INVALID_CREDENTIALS
    ].includes(error.code);
}
export function isAuthorizationError(error) {
    return isApiError(error) && error.code === ERROR_CODES.INSUFFICIENT_PERMISSIONS;
}
export function createApiResponse(data, message) {
    return {
        data,
        message: message ?? 'Success',
        timestamp: new Date().toISOString()
    };
}
export function createPaginatedResponse(data, page, limit, total, message) {
    const pages = Math.ceil(total / limit);
    const has_more = page < pages;
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            pages,
            has_more
        },
        message: message ?? 'Success',
        timestamp: new Date().toISOString()
    };
}
export function createApiError(error, message, code, details) {
    return {
        error,
        message,
        code: code ?? 'UNKNOWN_ERROR',
        details: details ?? [],
        timestamp: new Date().toISOString()
    };
}
