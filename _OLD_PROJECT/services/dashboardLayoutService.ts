import { supabase } from '@/lib/supabaseClient';

export interface DashboardLayout {
  id: string;
  user_id: string;
  name: string;
  widgets: any;
  is_default: boolean;
  is_shared: boolean;
  created_at?: string;
  updated_at?: string;
}

export class DashboardLayoutService {
  /**
   * Get all layouts for a user
   */
  static async getUserLayouts(userId: string): Promise<DashboardLayout[]> {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get default layout for a user
   */
  static async getDefaultLayout(userId: string): Promise<DashboardLayout | null> {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Save a layout
   */
  static async saveLayout(layout: Partial<DashboardLayout>): Promise<DashboardLayout> {
    if (layout.id) {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .update(layout)
        .eq('id', layout.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert([layout])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Set default layout
   */
  static async setDefaultLayout(layoutId: string, userId: string): Promise<void> {
    // Remove default from all layouts
    await supabase
      .from('dashboard_layouts')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set new default
    const { error } = await supabase
      .from('dashboard_layouts')
      .update({ is_default: true })
      .eq('id', layoutId);

    if (error) throw error;
  }

  /**
   * Delete a layout
   */
  static async deleteLayout(layoutId: string): Promise<void> {
    const { error } = await supabase
      .from('dashboard_layouts')
      .delete()
      .eq('id', layoutId);

    if (error) throw error;
  }

  /**
   * Share a layout
   */
  static async shareLayout(layoutId: string, shared: boolean): Promise<void> {
    const { error } = await supabase
      .from('dashboard_layouts')
      .update({ is_shared: shared })
      .eq('id', layoutId);

    if (error) throw error;
  }

  /**
   * Get shared layouts
   */
  static async getSharedLayouts(): Promise<DashboardLayout[]> {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('is_shared', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Clone a layout
   */
  static async cloneLayout(
    layoutId: string,
    userId: string,
    newName: string
  ): Promise<DashboardLayout> {
    // Get original layout
    const { data: original, error: fetchError } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('id', layoutId)
      .single();

    if (fetchError) throw fetchError;

    // Create clone
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .insert([
        {
          user_id: userId,
          name: newName,
          widgets: original.widgets,
          is_default: false,
          is_shared: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

