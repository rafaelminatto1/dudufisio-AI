/**
 * JWT Utilities para Autenticação de Pacientes
 * MoocaFisio - App para Pacientes
 */

import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.PATIENT_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 dias

export interface PatientJWTPayload {
  patientId: string;
  type: 'patient';
  name: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Gera JWT para paciente autenticado
 */
export function generatePatientToken(payload: Omit<PatientJWTPayload, 'type' | 'iat' | 'exp'>): string {
  return sign(
    {
      ...payload,
      type: 'patient',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

/**
 * Verifica e decodifica JWT do paciente
 */
export function verifyPatientToken(token: string): PatientJWTPayload {
  try {
    const decoded = verify(token, JWT_SECRET) as PatientJWTPayload;
    
    if (decoded.type !== 'patient') {
      throw new Error('Token inválido: tipo incorreto');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}

/**
 * Extrai token do header Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1] || null;
}

