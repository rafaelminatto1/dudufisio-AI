/**
 * API: Login de Paciente com Código de Acesso
 * MoocaFisio - App para Pacientes
 * 
 * POST /api/patient/login
 * Body: { accessCode: string }
 * Returns: { token: string, patient: {...} }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_lib/supabase';
import { generatePatientToken } from './_lib/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { accessCode } = req.body;
    
    // Validação do código
    if (!accessCode || typeof accessCode !== 'string' || accessCode.length !== 6) {
      return res.status(400).json({
        error: 'Código inválido',
        message: 'O código de acesso deve ter 6 caracteres',
      });
    }
    
    // Normalizar código (uppercase)
    const normalizedCode = accessCode.toUpperCase().trim();
    
    // Validar código usando function do Supabase
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_access_code', { p_access_code: normalizedCode });
    
    if (validationError) {
      console.error('Erro ao validar código:', validationError);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Não foi possível validar o código',
      });
    }
    
    // Verificar se retornou resultado
    if (!validationResult || validationResult.length === 0) {
      return res.status(401).json({
        error: 'Código inválido',
        message: 'Código de acesso não encontrado ou inválido',
      });
    }
    
    const validation = validationResult[0];
    
    // Verificar se código é válido
    if (!validation.is_valid) {
      return res.status(401).json({
        error: 'Código inválido ou expirado',
        message: 'O código de acesso não é válido ou já expirou',
      });
    }
    
    // Buscar informações completas do paciente
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, name, email, phone, date_of_birth, photo_url')
      .eq('id', validation.patient_id)
      .single();
    
    if (patientError || !patient) {
      console.error('Erro ao buscar paciente:', patientError);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Não foi possível carregar os dados do paciente',
      });
    }
    
    // Registrar log de acesso
    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    await supabaseAdmin.from('patient_access_logs').insert({
      patient_id: patient.id,
      access_code_id: validation.code_id,
      access_type: 'login',
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
    });
    
    // Atualizar last_login_at nas estatísticas
    await supabaseAdmin
      .from('patient_stats')
      .upsert({
        patient_id: patient.id,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'patient_id',
      });
    
    // Gerar JWT
    const token = generatePatientToken({
      patientId: patient.id,
      name: patient.name,
      email: patient.email || undefined,
    });
    
    // Retornar token e dados do paciente
    return res.status(200).json({
      token,
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.date_of_birth,
        photoUrl: patient.photo_url,
      },
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao processar o login',
    });
  }
}

