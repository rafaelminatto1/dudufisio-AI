/**
 * Serviço de Autenticação de Pacientes
 * MoocaFisio - App para Pacientes
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'patient_token';
const PATIENT_KEY = 'patient_data';

export interface PatientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  photoUrl?: string;
}

export interface LoginResponse {
  token: string;
  patient: PatientData;
}

/**
 * Faz login com código de acesso
 */
export async function login(accessCode: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/patient/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessCode }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer login');
  }
  
  const data: LoginResponse = await response.json();
  
  // Armazenar token e dados do paciente
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(PATIENT_KEY, JSON.stringify(data.patient));
  
  return data;
}

/**
 * Faz logout
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PATIENT_KEY);
}

/**
 * Obtém token armazenado
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtém dados do paciente armazenados
 */
export function getPatientData(): PatientData | null {
  const data = localStorage.getItem(PATIENT_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Verifica se está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Obtém headers de autenticação
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

