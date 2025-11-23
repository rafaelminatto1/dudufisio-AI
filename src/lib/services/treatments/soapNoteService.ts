import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type SessionEvolution = Database['public']['Tables']['session_evolutions']['Row'];
type SessionEvolutionInsert = Database['public']['Tables']['session_evolutions']['Insert'];
type SessionEvolutionUpdate = Database['public']['Tables']['session_evolutions']['Update'];

export interface SOAPNoteData {
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  treatment_id: string;
  patient_id: string;
  therapist_id: string;
}

export class SOAPNoteService {
  /**
   * Create a new SOAP note (session evolution)
   */
  static async create(data: SOAPNoteData) {
    try {
      const supabase = await createServerComponentClient();
      
      const evolutionData: any = {
        treatment_id: (data as any).treatment_id,
        patient_id: data.patient_id,
        therapist_id: data.therapist_id,
        subjective: data.subjective || null,
        objective: data.objective || null,
        assessment: data.assessment || null,
        plan: data.plan || null,
      };

      const { data: evolution, error } = await supabase
        .from('session_evolutions')
        .insert(evolutionData)
        .select('*, treatment:treatments(*), patient:patients(*), therapist:therapists(*)')
        .single();

      if (error) throw error;
      return { data: evolution, error: null };
    } catch (error) {
      console.error('Error creating SOAP note:', error);
      return { data: null, error };
    }
  }

  /**
   * Get SOAP notes by treatment ID
   */
  static async getByTreatment(treatmentId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('session_evolutions')
        .select('*, treatment:treatments(*), patient:patients(*), therapist:therapists(*)')
        .eq('treatment_id', treatmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching SOAP notes:', error);
      return { data: null, error };
    }
  }

  /**
   * Get SOAP notes by patient ID
   */
  static async getByPatient(patientId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('session_evolutions')
        .select('*, treatment:treatments(*), patient:patients(*), therapist:therapists(*)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching SOAP notes:', error);
      return { data: null, error };
    }
  }

  /**
   * Get SOAP note by ID
   */
  static async getById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('session_evolutions')
        .select('*, treatment:treatments(*), patient:patients(*), therapist:therapists(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching SOAP note:', error);
      return { data: null, error };
    }
  }

  /**
   * Update a SOAP note
   */
  static async update(id: string, updates: Partial<SOAPNoteData>) {
    try {
      const supabase = await createServerComponentClient();
      
      const updateData: SessionEvolutionUpdate = {
        subjective: updates.subjective,
        objective: updates.objective,
        assessment: updates.assessment,
        plan: updates.plan,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('session_evolutions')
        .update(updateData)
        .eq('id', id)
        .select('*, treatment:treatments(*), patient:patients(*), therapist:therapists(*)')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating SOAP note:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a SOAP note
   */
  static async delete(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('session_evolutions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting SOAP note:', error);
      return { error };
    }
  }
}

