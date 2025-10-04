// services/userService.ts
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'therapist' | 'patient' | 'educator_fisico' | 'manager' | 'receptionist';
  permissions: string[];
  profile_settings: {
    avatar_url?: string;
    phone?: string;
    specialties?: string[];
    license_number?: string;
    department?: string;
    working_hours?: {
      start: string;
      end: string;
      days: number[];
    };
    notification_preferences?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  role: UserProfile['role'];
  permissions?: string[];
  profile_settings?: UserProfile['profile_settings'];
  password?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: UserProfile['role'];
  permissions?: string[];
  profile_settings?: UserProfile['profile_settings'];
  is_active?: boolean;
}

class UserService {
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(user => ({
        ...user,
        full_name: user.full_name || 'Nome não informado',
        role: (user.role as any) || 'patient'
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        full_name: data.full_name || 'Nome não informado'
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async getUsersByRole(role: UserProfile['role']): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return (data || []).map(user => ({
        ...user,
        full_name: user.full_name || 'Nome não informado',
        role: (user.role as any) || 'patient'
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários por role:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<UserProfile> {
    try {
      // Se uma senha foi fornecida, criar usuário na autenticação
      if (userData.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
        });

        if (authError) throw authError;
      }

      // Criar perfil do usuário
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          permissions: userData.permissions || [],
          profile_settings: userData.profile_settings || {},
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        full_name: data.full_name || 'Nome não informado'
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        full_name: data.full_name || 'Nome não informado'
      };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
      throw error;
    }
  }

  async getUserPermissions(id: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('permissions')
        .eq('id', id)
        .single();

      if (error) throw error;
      return Array.isArray(data?.permissions) ? data.permissions as string[] : [];
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      return [];
    }
  }

  async updatePermissions(id: string, permissions: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  }

  // Métodos específicos para terapeutas
  async getTherapists(): Promise<UserProfile[]> {
    return this.getUsersByRole('therapist');
  }

  async getTherapistAvailability(therapistId: string, date: string): Promise<any[]> {
    try {
      // Buscar horários de trabalho do terapeuta
      const therapist = await this.getUserById(therapistId);
      if (!therapist?.profile_settings?.working_hours) {
        return [];
      }

      // Buscar compromissos e bloqueios para a data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('therapist_id', therapistId)
        .gte('start_time', `${date}T00:00:00`)
        .lt('start_time', `${date}T23:59:59`);

      if (appointmentsError) throw appointmentsError;

      const { data: blocks, error: blocksError } = await supabase
        .from('schedule_blocks')
        .select('start_at, end_at')
        .eq('therapist_id', therapistId)
        .gte('start_at', `${date}T00:00:00`)
        .lt('start_at', `${date}T23:59:59`);

      if (blocksError) throw blocksError;

      // Calcular horários disponíveis
      const workingHours = therapist.profile_settings.working_hours;
      const dayOfWeek = new Date(date).getDay();

      if (!workingHours.days.includes(dayOfWeek)) {
        return []; // Terapeuta não trabalha neste dia
      }

      // Lógica para calcular slots disponíveis
      const unavailableSlots = [
        ...(appointments || []),
        ...(blocks || []),
      ];

      return this.calculateAvailableSlots(workingHours, unavailableSlots, date);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      return [];
    }
  }

  private calculateAvailableSlots(
    workingHours: { start: string; end: string },
    unavailableSlots: any[],
    date: string
  ): any[] {
    // Implementação simplificada - retorna slots de 1h
    const slots = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
      const slotEnd = `${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`;

      const isUnavailable = unavailableSlots.some(slot => {
        const unavailableStart = new Date(slot.start_time || slot.start_at);
        const unavailableEnd = new Date(slot.end_time || slot.end_at);
        const currentSlotStart = new Date(slotStart);
        const currentSlotEnd = new Date(slotEnd);

        return (
          (currentSlotStart >= unavailableStart && currentSlotStart < unavailableEnd) ||
          (currentSlotEnd > unavailableStart && currentSlotEnd <= unavailableEnd) ||
          (currentSlotStart <= unavailableStart && currentSlotEnd >= unavailableEnd)
        );
      });

      if (!isUnavailable) {
        slots.push({
          start_time: slotStart,
          end_time: slotEnd,
          available: true,
        });
      }
    }

    return slots;
  }
}

export const userService = new UserService();
export default userService;