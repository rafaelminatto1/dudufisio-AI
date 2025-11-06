/**
 * API: Estatísticas do Paciente
 * MoocaFisio - App para Pacientes
 * 
 * GET /api/patient/stats
 * Headers: Authorization: Bearer <token>
 * Returns: { stats: {...}, progressData: [...], nextSession: {...} }
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
    
    // 1. Buscar estatísticas gerais
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('patient_stats')
      .select('*')
      .eq('patient_id', patientId)
      .single();
    
    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar estatísticas:', statsError);
    }
    
    // Se não existir, criar estatísticas
    if (!stats) {
      await supabaseAdmin.rpc('update_patient_stats', { p_patient_id: patientId });
      
      const { data: newStats } = await supabaseAdmin
        .from('patient_stats')
        .select('*')
        .eq('patient_id', patientId)
        .single();
      
      // Usar newStats ou valores padrão
      const defaultStats = newStats || {
        total_exercises_assigned: 0,
        total_exercises_completed: 0,
        completion_rate: 0,
        total_sessions_completed: 0,
        total_sessions_scheduled: 0,
        sessions_attendance_rate: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        last_exercise_completed_at: null,
        last_login_at: null,
      };
    }
    
    // 2. Buscar dados de progresso (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: completions, error: completionsError } = await supabaseAdmin
      .from('exercise_completions')
      .select('completed_date')
      .eq('patient_id', patientId)
      .gte('completed_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('completed_date', { ascending: true });
    
    if (completionsError) {
      console.error('Erro ao buscar completions:', completionsError);
    }
    
    // Agrupar por data
    const completionsByDate = new Map<string, number>();
    completions?.forEach(c => {
      const count = completionsByDate.get(c.completed_date) || 0;
      completionsByDate.set(c.completed_date, count + 1);
    });
    
    // Criar array de 30 dias com contagens
    const progressData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = completionsByDate.get(dateStr) || 0;
      
      progressData.push({
        date: dateStr,
        count: count,
        dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      });
    }
    
    // 3. Buscar próxima consulta
    const { data: nextAppointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        end_time,
        type,
        status,
        users!appointments_therapist_id_fkey (
          id,
          name
        )
      `)
      .eq('patient_id', patientId)
      .gte('date', new Date().toISOString().split('T')[0])
      .eq('status', 'scheduled')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(1)
      .single();
    
    if (appointmentError && appointmentError.code !== 'PGRST116') {
      console.error('Erro ao buscar próxima consulta:', appointmentError);
    }
    
    // 4. Contar exercícios de hoje
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayExercises, error: todayError } = await supabaseAdmin
      .from('patient_exercises')
      .select('id')
      .eq('patient_id', patientId)
      .eq('is_active', true);
    
    const { data: todayCompletions, error: todayCompError } = await supabaseAdmin
      .from('exercise_completions')
      .select('id')
      .eq('patient_id', patientId)
      .eq('completed_date', today);
    
    const exercisesTotal = todayExercises?.length || 0;
    const exercisesCompleted = todayCompletions?.length || 0;
    
    // Montar resposta
    return res.status(200).json({
      stats: {
        exercisesTotal,
        exercisesCompleted,
        exercisesToday: exercisesTotal - exercisesCompleted,
        completionRate: stats?.completion_rate || 0,
        currentStreak: stats?.current_streak_days || 0,
        longestStreak: stats?.longest_streak_days || 0,
        totalSessions: stats?.total_sessions_completed || 0,
        sessionsAttendanceRate: stats?.sessions_attendance_rate || 0,
        lastExerciseAt: stats?.last_exercise_completed_at,
        lastLoginAt: stats?.last_login_at,
      },
      progressData,
      nextSession: nextAppointment ? {
        id: nextAppointment.id,
        date: nextAppointment.date,
        time: nextAppointment.start_time,
        endTime: nextAppointment.end_time,
        type: nextAppointment.type,
        therapist: (nextAppointment.users && Array.isArray(nextAppointment.users) && nextAppointment.users.length > 0) ? {
          id: nextAppointment.users[0].id,
          name: nextAppointment.users[0].name,
        } : null,
      } : null,
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao buscar as estatísticas',
    });
  }
}

export default requirePatientAuth(handler);

