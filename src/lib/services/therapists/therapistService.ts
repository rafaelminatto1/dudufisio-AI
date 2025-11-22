import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Therapist = Database['public']['Tables']['therapists']['Row'];
type TherapistInsert = Database['public']['Tables']['therapists']['Insert'];
type TherapistUpdate = Database['public']['Tables']['therapists']['Update'];
type User = Database['public']['Tables']['users']['Row'];

export interface TherapistWithUser extends Therapist {
  user?: User;
}

export interface CreateTherapistRequest {
  user_id: string;
  license_number: string;
  license_type?: string;
  specialties?: string[];
  bio?: string;
  appointment_duration?: number;
  working_hours?: any;
  color_code?: string;
  is_accepting_patients?: boolean;
}

export interface TherapistStats {
  total: number;
  accepting_patients: number;
  not_accepting_patients: number;
  bySpecialty: Record<string, number>;
}

export class TherapistService {
  /**
   * Get all therapists with optional filters
   */
  static async getAllTherapists(filters?: {
    isAcceptingPatients?: boolean;
    specialty?: string;
    search?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = (supabase as any)
        .from('therapists')
        .select('*, user:users(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (filters?.isAcceptingPatients !== undefined) {
        query = query.eq('is_accepting_patients', filters.isAcceptingPatients);
      }

      if (filters?.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by search if provided
      let filteredData = data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((therapist: any) => {
          const user = therapist.user as User | undefined;
          return (
            user?.full_name?.toLowerCase().includes(searchLower) ||
            user?.email?.toLowerCase().includes(searchLower) ||
            therapist.license_number?.toLowerCase().includes(searchLower) ||
            therapist.bio?.toLowerCase().includes(searchLower) ||
            therapist.specialties?.some((s: string) =>
              s.toLowerCase().includes(searchLower)
            )
          );
        });
      }

      return { data: filteredData, error: null };
    } catch (error) {
      console.error('Error fetching therapists:', error);
      return { data: null, error };
    }
  }

  /**
   * Get therapist by ID
   */
  static async getTherapistById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await (supabase as any)
        .from('therapists')
        .select('*, user:users(*)')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching therapist:', error);
      return { data: null, error };
    }
  }

  /**
   * Get therapist by user ID
   */
  static async getTherapistByUserId(userId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await (supabase as any)
        .from('therapists')
        .select('*, user:users(*)')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching therapist by user ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new therapist
   */
  static async createTherapist(therapistData: CreateTherapistRequest) {
    try {
      const supabase = await createServerComponentClient();

      // Verify user exists and has therapist role
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', therapistData.user_id)
        .single();

      if (userError) throw userError;
      if (!user) {
        throw new Error('User not found');
      }

      const insertData: TherapistInsert = {
        user_id: therapistData.user_id,
        license_number: therapistData.license_number,
        license_type: therapistData.license_type || null,
        specialties: therapistData.specialties || null,
        bio: therapistData.bio || null,
        appointment_duration: therapistData.appointment_duration || 60,
        working_hours: therapistData.working_hours || null,
        color_code: therapistData.color_code || null,
        is_accepting_patients: therapistData.is_accepting_patients ?? true,
      };

      const { data, error } = await (supabase as any)
        .from('therapists')
        .insert(insertData)
        .select('*, user:users(*)')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating therapist:', error);
      return { data: null, error };
    }
  }

  /**
   * Update therapist
   */
  static async updateTherapist(id: string, therapistData: Partial<CreateTherapistRequest>) {
    try {
      const supabase = await createServerComponentClient();
      const updateData: TherapistUpdate = {
        ...therapistData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('therapists')
        .update(updateData)
        .eq('id', id)
        .select('*, user:users(*)')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating therapist:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete therapist (soft delete)
   */
  static async deleteTherapist(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await (supabase as any)
        .from('therapists')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting therapist:', error);
      return { data: null, error };
    }
  }

  /**
   * Set therapist availability status
   */
  static async setAcceptingPatients(id: string, isAccepting: boolean) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await (supabase as any)
        .from('therapists')
        .update({
          is_accepting_patients: isAccepting,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating therapist availability:', error);
      return { data: null, error };
    }
  }

  /**
   * Update therapist working hours
   */
  static async updateWorkingHours(id: string, workingHours: any) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await (supabase as any)
        .from('therapists')
        .update({
          working_hours: workingHours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating working hours:', error);
      return { data: null, error };
    }
  }

  /**
   * Update therapist specialties
   */
  static async updateSpecialties(id: string, specialties: string[]) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await (supabase as any)
        .from('therapists')
        .update({
          specialties,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating specialties:', error);
      return { data: null, error };
    }
  }

  /**
   * Get therapists accepting new patients
   */
  static async getAcceptingPatients() {
    return this.getAllTherapists({ isAcceptingPatients: true });
  }

  /**
   * Get therapist statistics
   */
  static async getStats() {
    try {
      const supabase = await createServerComponentClient();
      const { data: therapists, error } = await (supabase as any)
        .from('therapists')
        .select('is_accepting_patients, specialties')
        .is('deleted_at', null);

      if (error) throw error;

      const stats: TherapistStats = {
        total: therapists?.length || 0,
        accepting_patients:
          therapists?.filter(t => t.is_accepting_patients).length || 0,
        not_accepting_patients:
          therapists?.filter(t => !t.is_accepting_patients).length || 0,
        bySpecialty: {},
      };

      therapists?.forEach(therapist => {
        if (therapist.specialties) {
          therapist.specialties.forEach(specialty => {
            stats.bySpecialty[specialty] =
              (stats.bySpecialty[specialty] || 0) + 1;
          });
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching therapist stats:', error);
      return { data: null, error };
    }
  }
}

