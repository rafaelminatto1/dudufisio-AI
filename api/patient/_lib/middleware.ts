/**
 * Middleware para proteger rotas de APIs do Paciente
 * MoocaFisio - App para Pacientes
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPatientToken, extractTokenFromHeader, PatientJWTPayload } from './jwt';

export interface AuthenticatedRequest extends VercelRequest {
  patient?: PatientJWTPayload;
}

/**
 * Middleware que verifica autenticação do paciente
 */
export function requirePatientAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<VercelResponse | void>
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      // Extrai token do header
      const token = extractTokenFromHeader(req.headers.authorization as string);
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          message: 'Authorization header é obrigatório',
        });
      }
      
      // Verifica e decodifica token
      const payload = verifyPatientToken(token);
      
      // Anexa dados do paciente ao request
      req.patient = payload;
      
      // Chama o handler
      return await handler(req, res);
    } catch (error) {
      return res.status(401).json({
        error: 'Não autorizado',
        message: error instanceof Error ? error.message : 'Token inválido',
      });
    }
  };
}

/**
 * Middleware que verifica se é terapeuta autenticado
 */
export function requireTherapistAuth(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<VercelResponse | void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Aqui você deve implementar a verificação de sessão do terapeuta
      // usando o sistema de autenticação existente (Supabase Auth)
      
      const token = extractTokenFromHeader(req.headers.authorization as string);
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          message: 'Authorization header é obrigatório',
        });
      }
      
      // Por enquanto, aceitar qualquer token válido
      // TODO: Implementar validação real de terapeuta
      
      return await handler(req, res);
    } catch (error) {
      return res.status(401).json({
        error: 'Não autorizado',
        message: 'Token inválido',
      });
    }
  };
}

