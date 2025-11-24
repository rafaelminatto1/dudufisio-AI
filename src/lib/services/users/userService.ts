import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface CreateUserRequest {
  email: string;
  full_name: string;
  role: string;
  permissions?: any;
  profile_settings?: any;
  password?: string;
  phone?: string;
  bio?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: string;
  permissions?: any;
  profile_settings?: any;
  is_active?: boolean;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

export class UserService {
  /**
   * Get all users with optional filters
   */
  static async getAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data || []).map(user => ({
          ...user,
          full_name: user.full_name || 'Nome não informado',
        })),
        error: null,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data: {
          ...data,
          full_name: data.full_name || 'Nome não informado',
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { data: null, error };
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;

      return {
        data: (data || []).map(user => ({
          ...user,
          full_name: user.full_name || 'Nome não informado',
        })),
        error: null,
      };
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserRequest) {
    try {
      const supabase = await createServerComponentClient();

      // If password is provided, create auth user first
      let authId: string | null = null;
      if (userData.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
        });

        if (authError) throw authError;
        authId = authData.user?.id || null;
      }

      // Create user profile
      const insertData: UserInsert = {
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        permissions: userData.permissions || null,
        profile_settings: userData.profile_settings || null,
        is_active: true,
        phone: userData.phone || null,
        bio: userData.bio || null,
        auth_id: authId,
      };

      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          ...data,
          full_name: data.full_name || 'Nome não informado',
        },
        error: null,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error };
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, userData: UpdateUserRequest) {
    try {
      const supabase = await createServerComponentClient();
      const updateData: any = {
        ...userData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          ...data,
          full_name: data.full_name || 'Nome não informado',
        },
        error: null,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error };
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deactivating user:', error);
      return { data: null, error };
    }
  }

  /**
   * Activate user
   */
  static async activateUser(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error activating user:', error);
      return { data: null, error };
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating last login:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('users')
        .select('permissions')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        data: Array.isArray(data?.permissions) ? (data.permissions as string[]) : [],
        error: null,
      };
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return { data: [], error };
    }
  }

  /**
   * Update user permissions
   */
  static async updatePermissions(id: string, permissions: string[]) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('users')
        .update({
          permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating permissions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get therapists (users with therapist role)
   */
  static async getTherapists() {
    return this.getUsersByRole('therapist');
  }

  /**
   * Get user statistics
   */
  static async getStats() {
    try {
      const supabase = await createServerComponentClient();
      const { data: users, error } = await supabase
        .from('users')
        .select('role, is_active');

      if (error) throw error;

      const stats: UserStats = {
        total: users?.length || 0,
        active: users?.filter(u => u.is_active).length || 0,
        inactive: users?.filter(u => !u.is_active).length || 0,
        byRole: {},
      };

      users?.forEach(user => {
        const role = user.role || 'unknown';
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error };
    }
  }
}

