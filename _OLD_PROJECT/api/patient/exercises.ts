/**
 * API: Listar Exercícios do Paciente
 * MoocaFisio - App para Pacientes
 * 
 * GET /api/patient/exercises
 * Headers: Authorization: Bearer <token>
 * Query: ?filter=all|pending|completed
 * Returns: Exercise[]
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { requirePatientAuth, AuthenticatedRequest } from './_lib/middleware';
import { supabaseAdmin } from './_lib/supabase';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Apenas GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const patientId = req.patient!.patientId;
    const filter = (req.query.filter as string) || 'all';
    
    // Buscar exercícios prescritos para o paciente
    const query = supabaseAdmin
      .from('patient_exercises')
      .select(`
        id,
        exercise_name,
        description,
        instructions,
        sets,
        reps,
        duration_seconds,
        rest_seconds,
        frequency_per_week,
        start_date,
        end_date,
        is_active,
        notes,
        created_at,
        exercise_video_id,
        exercise_videos (
          id,
          title,
          video_url,
          thumbnail_url,
          video_type,
          duration
        )
      `)
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    const { data: exercises, error: exercisesError } = await query;
    
    if (exercisesError) {
      console.error('Erro ao buscar exercícios:', exercisesError);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Não foi possível carregar os exercícios',
      });
    }
    
    // Buscar completions para cada exercício
    const exerciseIds = exercises?.map(e => e.id) || [];
    
    const { data: completions, error: completionsError } = await supabaseAdmin
      .from('exercise_completions')
      .select('patient_exercise_id, completed_date')
      .eq('patient_id', patientId)
      .in('patient_exercise_id', exerciseIds);
    
    if (completionsError) {
      console.error('Erro ao buscar conclusões:', completionsError);
      // Continuar mesmo com erro, apenas sem dados de conclusão
    }
    
    // Mapear completions por exercício
    const completionsByExercise = new Map<string, string[]>();
    completions?.forEach(c => {
      const dates = completionsByExercise.get(c.patient_exercise_id) || [];
      dates.push(c.completed_date);
      completionsByExercise.set(c.patient_exercise_id, dates);
    });
    
    // Formatar resposta
    const formattedExercises = exercises?.map(exercise => {
      const completionDates = completionsByExercise.get(exercise.id) || [];
      const todayCompleted = completionDates.includes(new Date().toISOString().split('T')[0]);
      
      return {
        id: exercise.id,
        name: exercise.exercise_name,
        description: exercise.description,
        instructions: exercise.instructions,
        sets: exercise.sets,
        reps: exercise.reps,
        durationSeconds: exercise.duration_seconds,
        restSeconds: exercise.rest_seconds,
        frequencyPerWeek: exercise.frequency_per_week,
        startDate: exercise.start_date,
        endDate: exercise.end_date,
        notes: exercise.notes,
        completed: todayCompleted,
        completionDates: completionDates,
        totalCompletions: completionDates.length,
        video: (exercise.exercise_videos && Array.isArray(exercise.exercise_videos) && exercise.exercise_videos.length > 0) ? {
          id: exercise.exercise_videos[0].id,
          title: exercise.exercise_videos[0].title,
          url: exercise.exercise_videos[0].video_url,
          thumbnailUrl: exercise.exercise_videos[0].thumbnail_url,
          type: exercise.exercise_videos[0].video_type,
          duration: exercise.exercise_videos[0].duration,
        } : null,
      };
    }) || [];
    
    // Filtrar baseado no parâmetro
    let filteredExercises = formattedExercises;
    if (filter === 'completed') {
      filteredExercises = formattedExercises.filter(e => e.completed);
    } else if (filter === 'pending') {
      filteredExercises = formattedExercises.filter(e => !e.completed);
    }
    
    return res.status(200).json({
      exercises: filteredExercises,
      total: filteredExercises.length,
      filter,
    });
    
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    return res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao buscar os exercícios',
    });
  }
}

export default requirePatientAuth(handler);

