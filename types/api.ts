// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_more: boolean;
  };
  message?: string;
  timestamp: string;
}

// Error response types
export interface ApiError {
  error: string;
  message: string;
  details?: ValidationError[] | string;
  code: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Specific error types
export interface ConflictError extends ApiError {
  conflicts?: any[];
}

export interface AuthenticationError extends ApiError {
  code: 'AUTH_REQUIRED' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS';
}

export interface AuthorizationError extends ApiError {
  code: 'INSUFFICIENT_PERMISSIONS' | 'ROLE_REQUIRED';
  required_role?: string;
}

export interface NotFoundError extends ApiError {
  code: 'RESOURCE_NOT_FOUND';
  resource_type?: string;
  resource_id?: string;
}

export interface RateLimitError extends ApiError {
  code: 'RATE_LIMIT_EXCEEDED';
  retry_after?: number;
}

// LGPD specific errors
export interface DataPrivacyError extends ApiError {
  code: 'DATA_PRIVACY_VIOLATION' | 'CONSENT_REQUIRED' | 'DATA_RETENTION_VIOLATION';
  lgpd_reference?: string;
}

// Healthcare specific errors
export interface HealthcareDataError extends ApiError {
  code: 'PATIENT_DATA_SECURITY' | 'MEDICAL_RECORD_VALIDATION' | 'AUDIT_TRAIL_REQUIRED';
  compliance_reference?: string;
}

// Request/Response metadata
export interface RequestMetadata {
  request_id: string;
  user_id?: string;
  user_role?: string;
  client_ip?: string;
  user_agent?: string;
  timestamp: string;
}

export interface ResponseMetadata {
  request_id: string;
  processing_time_ms: number;
  api_version: string;
  timestamp: string;
}

// Search and filter types
export interface SearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}

export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

// Bulk operation types
export interface BulkOperation<T> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
}

export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// File upload types
export interface FileUploadResponse {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  upload_timestamp: string;
}

export interface FileUploadError extends ApiError {
  code: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'UPLOAD_FAILED';
  max_size?: number;
  allowed_types?: string[];
}

// Export/Report types
export interface ExportRequest {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  data_type: 'patients' | 'appointments' | 'sessions' | 'financial' | 'pain_points';
  filters?: SearchFilters & DateRangeFilter;
  include_sensitive_data?: boolean;
}

export interface ExportResponse {
  export_id: string;
  download_url: string;
  expires_at: string;
  file_size: number;
  status: 'processing' | 'completed' | 'failed';
}

// Real-time/WebSocket types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  user_id?: string;
}

export interface RealtimeUpdate {
  entity_type: 'patient' | 'appointment' | 'session' | 'pain_point' | 'user';
  entity_id: string;
  operation: 'created' | 'updated' | 'deleted';
  data: any;
  user_id: string;
  timestamp: string;
}

// Audit log types
export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: {
    before?: any;
    after?: any;
  };
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

// Health check and monitoring
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    database: 'up' | 'down';
    storage: 'up' | 'down';
    auth: 'up' | 'down';
    ai_service: 'up' | 'down';
  };
  metrics?: {
    response_time_ms: number;
    memory_usage_mb: number;
    cpu_usage_percent: number;
  };
}

// Cache management
export interface CacheInfo {
  key: string;
  ttl_seconds: number;
  created_at: string;
  size_bytes?: number;
}

export interface CacheStats {
  total_keys: number;
  hit_rate: number;
  miss_rate: number;
  memory_usage_mb: number;
}

// API versioning
export interface ApiVersionInfo {
  current_version: string;
  supported_versions: string[];
  deprecated_versions: string[];
  api_docs_url: string;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_time: string;
  window_seconds: number;
}

// Helper type for API endpoints
export type ApiEndpoint<TRequest = any, TResponse = any> = {
  request: TRequest;
  response: ApiResponse<TResponse>;
  error: ApiError;
};

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
} as const;

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
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Helper functions for error handling
export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'error' in error && 'message' in error;
}

export function isValidationError(error: any): error is ApiError {
  return isApiError(error) && error.code === ERROR_CODES.VALIDATION_ERROR;
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return isApiError(error) && [
    ERROR_CODES.AUTH_REQUIRED,
    ERROR_CODES.TOKEN_EXPIRED,
    ERROR_CODES.INVALID_CREDENTIALS
  ].includes(error.code as any || '');
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return isApiError(error) && error.code === ERROR_CODES.INSUFFICIENT_PERMISSIONS;
}

export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    message: message || 'Success',
    timestamp: new Date().toISOString()
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> {
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
    message: message || 'Success',
    timestamp: new Date().toISOString()
  };
}

export function createApiError(
  error: string,
  message: string,
  code?: ErrorCode,
  details?: ValidationError[]
): ApiError {
  return {
    error,
    message,
    code: code || 'UNKNOWN_ERROR',
    details: details || [],
    timestamp: new Date().toISOString()
  };
}