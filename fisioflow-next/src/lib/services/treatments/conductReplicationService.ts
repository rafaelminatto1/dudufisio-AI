import { createServerComponentClient } from '~/lib/supabase/server';

export class ConductReplicationService {
  static async replicateFullSession(sourceSessionId: string, targetData: any) {
    try {
      const supabase = createServerComponentClient();
      const { data: sourceSession } = await supabase
        .from('session_evolutions')
        .select('*')
        .eq('id', sourceSessionId)
        .single();

      if (!sourceSession) throw new Error('Source session not found');

      const { data: newSession, error } = await supabase
        .from('session_evolutions')
        .insert({
          ...targetData,
          subjective: sourceSession.subjective,
          objective: sourceSession.objective,
          assessment: sourceSession.assessment,
          plan: sourceSession.plan,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: newSession, error: null };
    } catch (error) {
      console.error('Error replicating session:', error);
      return { data: null, error };
    }
  }
}

