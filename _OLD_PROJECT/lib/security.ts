/**
 * 🔒 UTILITÁRIOS DE SEGURANÇA
 * 
 * Configurações e utilitários de segurança para DuduFisio AI
 */

// Content Security Policy
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Vite em desenvolvimento
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Tailwind CSS
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'connect-src': [
    "'self'",
    'https://api.supabase.co',
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.resend.com',
    'https://api.groq.com',
    'https://generativelanguage.googleapis.com'
  ],
  'media-src': [
    "'self'",
    'blob:',
    'https:'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Headers de segurança
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': Object.entries(CSP_POLICY)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
};

// Validação de entrada
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de telefone brasileiro
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validação de CPF
export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
};

// Geração de token seguro
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
};

// Hash de senha (simplificado - usar bcrypt em produção)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Verificação de força da senha
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('Use pelo menos 8 caracteres');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Use letras minúsculas');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Use letras maiúsculas');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Use números');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Use caracteres especiais');
  
  return { score, feedback };
};
