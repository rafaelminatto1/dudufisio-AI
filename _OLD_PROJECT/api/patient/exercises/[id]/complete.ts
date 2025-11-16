/**
 * API: Marcar Exercício como Concluído
 * MoocaFisio - App para Pacientes
 * 
 * POST /api/patient/exercises/[id]/complete
 * Headers: Authorization: Bearer <token>
 * Body: { setsCompleted?, repsCompleted?, durationSeconds?, difficultyLevel?, painLevel?, notes? }
 * Returns: { success: boolean, completion: {...} }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { requirePatientAuth, AuthenticatedRequest } from '../../_lib/middleware';
import { supabaseAdmin } from '../../_lib/supabase';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const patientId = req.patient!.patientId;
    const exerciseId = req.query.id as string;
    
    if (!exerciseId) {
      return res.status(400).json({
        error: 'ID do exercício não fornecido',
      });
    }
    
    // Verificar se o exercício pertence ao paciente
    const { data: exercise, error: exerciseError } = await supabaseAdmin
      .from('patient_exercises')
      .select('id, exercise_name, sets, reps, duration_seconds')
      .eq('id', exerciseId)
      .eq('patient_id', patientId)
      .single();
    
    if (exerciseError || !exercise) {
      return res.status(404).json({
        error: 'Exercício não encontrado',
        message: 'Este exercício não existe ou não pertence a você',
      });
    }
    
    // Verificar se já foi concluído hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCompletion } = await supabaseAdmin
      .from('exercise_completions')
      .select('id')
      .eq('patient_exercise_id', exerciseId)
      .eq('patient_id', patientId)
      .eq('completed_date', today)
      .single();
    
    if (existingCompletion) {
      return res.status(400).json({
        error: 'Exercício já concluído hoje',
        message: 'Você já marcou este exercício como concluído hoje',
      });
    }
    
    // Extrair dados opcionais do body
    const {
      setsCompleted,
      repsCompleted,
      durationSeconds,
      difficultyLevel,
      painLevel,
      notes,
    } = req.body || {};
    
    // Criar registro de conclusão
    const { data: completion, error: completionError } = await supabaseAdmin
      .from('exercise_completions')
      .insert({
        patient_exercise_id: exerciseId,
        patient_id: patientId,
        completed_date: today,
        sets_completed: setsCompleted || exercise.sets,
        reps_completed: repsCompleted || exercise.reps,
        duration_seconds: durationSeconds || exercise.duration_seconds,
        difficulty_level: difficultyLevel,
        pain_level: painLevel,
        notes: notes,
      })
      .select()
      .single();
    
    if (completionError) {
      console.error('Erro ao registrar conclusão:', completionError);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Não foi possível registrar a conclusão do exercício',
      });
    }
    
    // Atualizar estatísticas do paciente (trigger já faz isso, mas garantir)
    await supabaseAdmin.rpc('update_patient_stats', { p_patient_id: patientId });
    
    return res.status(200).json({
      success: true,
      completion: {
        id: completion.id,
        exerciseId: exerciseId,
        exerciseName: exercise.exercise_name,
        completedAt: completion.completed_at,
        completedDate: completion.completed_date,
        setsCompleted: completion.sets_completed,
        repsCompleted: completion.reps_completed,
        durationSeconds: completion.duration_seconds,
        difficultyLevel: completion.difficulty_level,
        painLevel: completion.pain_level,
        notes: completion.notes,
      },
    });
    
  } catch (error) {
    console.error('Erro ao marcar exercício como concluído:', error);
    return res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao marcar o exercício como concluído',
    });
  }
}

export default requirePatientAuth(handler);

