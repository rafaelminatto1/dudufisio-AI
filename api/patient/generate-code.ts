/**
 * API: Gerar Código de Acesso para Paciente
 * MoocaFisio - App para Pacientes
 * 
 * POST /api/patient/generate-code
 * Headers: Authorization: Bearer <therapist-token>
 * Body: { patientId: string, expiresInDays?: number }
 * Returns: { code: string, expiresAt: string }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    // Verificar autenticação do terapeuta
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Não autorizado',
        message: 'Token de autenticação é obrigatório',
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Criar cliente Supabase com token do usuário
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Verificar sessão do usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({
        error: 'Não autorizado',
        message: 'Token inválido ou expirado',
      });
    }
    
    // Verificar se é terapeuta ou admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData || !['admin', 'therapist'].includes(userData.role)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Apenas terapeutas e administradores podem gerar códigos',
      });
    }
    
    // Extrair parâmetros
    const { patientId, expiresInDays = 30 } = req.body;
    
    if (!patientId) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        message: 'patientId é obrigatório',
      });
    }
    
    // Verificar se paciente existe
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, name')
      .eq('id', patientId)
      .single();
    
    if (patientError || !patient) {
      return res.status(404).json({
        error: 'Paciente não encontrado',
        message: 'O paciente especificado não existe',
      });
    }
    
    // Gerar código usando function do Supabase
    const { data: codeResult, error: codeError } = await supabaseAdmin
      .rpc('create_patient_access_code', {
        p_patient_id: patientId,
        p_created_by: user.id,
        p_expires_in_days: expiresInDays,
      });
    
    if (codeError || !codeResult || codeResult.length === 0) {
      console.error('Erro ao gerar código:', codeError);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Não foi possível gerar o código de acesso',
      });
    }
    
    const generatedCode = codeResult[0];
    
    return res.status(200).json({
      code: generatedCode.code,
      expiresAt: generatedCode.expires_at,
      patient: {
        id: patient.id,
        name: patient.name,
      },
    });
    
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao gerar o código de acesso',
    });
  }
}

