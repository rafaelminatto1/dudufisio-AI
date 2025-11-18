import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type ScheduleBlock = Database['public']['Tables']['schedule_blocks']['Row'];
type ScheduleBlockInsert = Database['public']['Tables']['schedule_blocks']['Insert'];
type ScheduleBlockUpdate = Database['public']['Tables']['schedule_blocks']['Update'];

export interface AvailabilityBlock {
  id: string;
  therapistId: string;
  startTime: Date;
  endTime: Date;
  title: string;
  blockType?: string;
  description?: string;
  isActive?: boolean;
}

export interface AvailabilityFilters {
  therapistId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  blockType?: string;
  isActive?: boolean;
}

export interface AvailabilityStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
  byTherapist: Record<string, number>;
}

export class AvailabilityService {
  /**
   * Get all availability blocks with optional filters
   */
  static async getAvailabilityBlocks(filters?: AvailabilityFilters) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('schedule_blocks')
        .select('*')
        .order('start_time', { ascending: true });

      if (filters?.therapistId) {
        query = query.eq('therapist_id', filters.therapistId);
      }

      if (filters?.startDate) {
        const startDate =
          filters.startDate instanceof Date
            ? filters.startDate.toISOString()
            : filters.startDate;
        query = query.gte('start_time', startDate);
      }

      if (filters?.endDate) {
        const endDate =
          filters.endDate instanceof Date
            ? filters.endDate.toISOString()
            : filters.endDate;
        query = query.lte('end_time', endDate);
      }

      if (filters?.blockType) {
        query = query.eq('block_type', filters.blockType);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching availability blocks:', error);
      return { data: null, error };
    }
  }

  /**
   * Get availability block by ID
   */
  static async getAvailabilityBlockById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching availability block:', error);
      return { data: null, error };
    }
  }

  /**
   * Get availability blocks for a specific therapist
   */
  static async getTherapistAvailability(
    therapistId: string,
    startDate?: Date | string,
    endDate?: Date | string
  ) {
    return this.getAvailabilityBlocks({
      therapistId,
      startDate,
      endDate,
      isActive: true,
    });
  }

  /**
   * Create a new availability block
   */
  static async createAvailabilityBlock(blockData: {
    therapist_id: string;
    start_time: string | Date;
    end_time: string | Date;
    title: string;
    block_type?: string;
    description?: string;
    is_active?: boolean;
  }) {
    try {
      const supabase = await createServerComponentClient();

      const startTime =
        blockData.start_time instanceof Date
          ? blockData.start_time.toISOString()
          : blockData.start_time;
      const endTime =
        blockData.end_time instanceof Date
          ? blockData.end_time.toISOString()
          : blockData.end_time;

      const insertData: ScheduleBlockInsert = {
        therapist_id: blockData.therapist_id,
        start_time: startTime,
        end_time: endTime,
        title: blockData.title,
        block_type: blockData.block_type || null,
        description: blockData.description || null,
        is_active: blockData.is_active ?? true,
      };

      const { data, error } = await supabase
        .from('schedule_blocks')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating availability block:', error);
      return { data: null, error };
    }
  }

  /**
   * Update availability block
   */
  static async updateAvailabilityBlock(
    id: string,
    blockData: Partial<{
      start_time: string | Date;
      end_time: string | Date;
      title: string;
      block_type: string;
      description: string;
      is_active: boolean;
    }>
  ) {
    try {
      const supabase = await createServerComponentClient();
      const updateData: ScheduleBlockUpdate = {
        ...blockData,
        updated_at: new Date().toISOString(),
      };

      // Convert dates to ISO strings if needed
      if (blockData.start_time) {
        updateData.start_time =
          blockData.start_time instanceof Date
            ? blockData.start_time.toISOString()
            : blockData.start_time;
      }

      if (blockData.end_time) {
        updateData.end_time =
          blockData.end_time instanceof Date
            ? blockData.end_time.toISOString()
            : blockData.end_time;
      }

      const { data, error } = await supabase
        .from('schedule_blocks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating availability block:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete availability block
   */
  static async deleteAvailabilityBlock(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting availability block:', error);
      return { data: null, error };
    }
  }

  /**
   * Deactivate availability block
   */
  static async deactivateAvailabilityBlock(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('schedule_blocks')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deactivating availability block:', error);
      return { data: null, error };
    }
  }

  /**
   * Activate availability block
   */
  static async activateAvailabilityBlock(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('schedule_blocks')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error activating availability block:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a time slot is available for a therapist
   */
  static async isTimeSlotAvailable(
    therapistId: string,
    startTime: Date | string,
    endTime: Date | string
  ) {
    try {
      const start =
        startTime instanceof Date ? startTime.toISOString() : startTime;
      const end = endTime instanceof Date ? endTime.toISOString() : endTime;

      const { data: blocks, error } = await this.getAvailabilityBlocks({
        therapistId,
        isActive: true,
      });

      if (error) return { data: false, error };

      // Check if any active block overlaps with the requested time slot
      const hasOverlap = (blocks || []).some(block => {
        const blockStart = new Date(block.start_time);
        const blockEnd = new Date(block.end_time);
        const requestedStart = new Date(start);
        const requestedEnd = new Date(end);

        return (
          (requestedStart >= blockStart && requestedStart < blockEnd) ||
          (requestedEnd > blockStart && requestedEnd <= blockEnd) ||
          (requestedStart <= blockStart && requestedEnd >= blockEnd)
        );
      });

      return { data: !hasOverlap, error: null };
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return { data: null, error };
    }
  }

  /**
   * Get available time slots for a therapist on a specific date
   */
  static async getAvailableTimeSlots(
    therapistId: string,
    date: Date | string
  ) {
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const startOfDay = `${dateStr}T00:00:00`;
      const endOfDay = `${dateStr}T23:59:59`;

      // Get therapist working hours
      const { TherapistService } = await import('../therapists/therapistService');
      const therapistResult = await TherapistService.getTherapistById(therapistId);

      if (!therapistResult.data?.working_hours) {
        return { data: [], error: null };
      }

      // Get all blocks for this date
      const { data: blocks } = await this.getAvailabilityBlocks({
        therapistId,
        startDate: startOfDay,
        endDate: endOfDay,
        isActive: true,
      });

      // Get appointments for this date (would need to import AppointmentService)
      // For now, just return based on blocks
      const workingHours = therapist.data.working_hours as any;
      const slots: Array<{ start: string; end: string }> = [];

      // This is a simplified implementation
      // In a real scenario, you'd calculate slots based on working hours
      // and exclude both blocks and appointments

      return { data: slots, error: null };
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return { data: null, error };
    }
  }

  /**
   * Get availability statistics
   */
  static async getStats(filters?: { therapistId?: string }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase.from('schedule_blocks').select('*');

      if (filters?.therapistId) {
        query = query.eq('therapist_id', filters.therapistId);
      }

      const { data: blocks, error } = await query;

      if (error) throw error;

      const stats: AvailabilityStats = {
        total: blocks?.length || 0,
        active: blocks?.filter(b => b.is_active).length || 0,
        inactive: blocks?.filter(b => !b.is_active).length || 0,
        byType: {},
        byTherapist: {},
      };

      blocks?.forEach(block => {
        // Count by type
        const type = block.block_type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count by therapist
        if (block.therapist_id) {
          stats.byTherapist[block.therapist_id] =
            (stats.byTherapist[block.therapist_id] || 0) + 1;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching availability stats:', error);
      return { data: null, error };
    }
  }
}

