import { createServerComponentClient } from '~/lib/supabase/server';

export class PortalService {
  static async getDashboardData(patientId: string) {
    try {
      const supabase = await createServerComponentClient();

      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('*, therapist:therapists(*)')
        .eq('patient_id', patientId)
        .gte('start_time', new Date().toISOString())
        .eq('status', 'agendado')
        .order('start_time', { ascending: true })
        .limit(5);

      const { data: prescribedExercises } = await supabase
        .from('prescribed_exercises')
        .select('*, exercise:exercises_library(*)')
        .eq('patient_id', patientId)
        .eq('status', 'ativo')
        .limit(10);

      return {
        data: {
          patient,
          upcomingAppointments,
          prescribedExercises,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { data: null, error };
    }
  }
}

