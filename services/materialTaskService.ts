// services/materialTaskService.ts
import { MaterialTask, MaterialMention } from '../types';
import { supabase } from '../lib/supabaseClient';

export interface TaskCreateData {
  materialId: string;
  mentionedUserId: string;
  mentionedUserName: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface TaskUpdateData {
  id: string;
  status?: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskSearchParams {
  userId?: string;
  status?: string;
  priority?: string;
  materialId?: string;
  limit?: number;
  offset?: number;
}

class MaterialTaskService {
  private useSupabase = false;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      const { data, error } = await supabase.from('clinical_material_tasks').select('count').limit(1);
      if (!error) {
        this.useSupabase = true;
        console.log('Material Task Service: Using Supabase');
      }
    } catch (error) {
      console.log('Material Task Service: Using Mock data');
    }
  }

  // Create task from mention
  async createTaskFromMention(mention: MaterialMention, materialId: string, content: string): Promise<MaterialTask> {
    if (this.useSupabase) {
      try {
        const { data: task, error } = await supabase
          .from('clinical_material_tasks')
          .insert([{
            material_id: materialId,
            mention_id: mention.id,
            user_id: mention.userId,
            user_name: mention.userName,
            content,
            status: 'pending',
            priority: 'medium',
            assigned_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;

        // Create notification
        await this.createNotification(task.id, mention.userId, materialId, content);

        return task;
      } catch (error) {
        console.error('Error creating task from mention in Supabase:', error);
        throw error;
      }
    }

    // Mock task
    return {
      id: `task-${Date.now()}`,
      materialId,
      mentionedUserId: mention.userId,
      mentionedUserName: mention.userName,
      content,
      status: 'pending',
      priority: 'medium',
      assignedAt: new Date().toISOString(),
    };
  }

  // Create task directly
  async createTask(data: TaskCreateData): Promise<MaterialTask> {
    if (this.useSupabase) {
      try {
        const { data: task, error } = await supabase
          .from('clinical_material_tasks')
          .insert([{
            material_id: data.materialId,
            user_id: data.mentionedUserId,
            user_name: data.mentionedUserName,
            content: data.content,
            status: 'pending',
            priority: data.priority || 'medium',
            due_date: data.dueDate,
            assigned_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;

        // Create notification
        await this.createNotification(task.id, data.mentionedUserId, data.materialId, data.content);

        return task;
      } catch (error) {
        console.error('Error creating task in Supabase:', error);
        throw error;
      }
    }

    // Mock task
    return {
      id: `task-${Date.now()}`,
      materialId: data.materialId,
      mentionedUserId: data.mentionedUserId,
      mentionedUserName: data.mentionedUserName,
      content: data.content,
      status: 'pending',
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      assignedAt: new Date().toISOString(),
    };
  }

  // Get tasks by user
  async getTasksByUser(userId: string, params: TaskSearchParams = {}): Promise<MaterialTask[]> {
    if (this.useSupabase) {
      try {
        let query = supabase
          .from('clinical_material_tasks')
          .select(`
            *,
            clinical_materials!inner(name, type, status)
          `)
          .eq('user_id', userId);

        if (params.status) {
          query = query.eq('status', params.status);
        }
        if (params.priority) {
          query = query.eq('priority', params.priority);
        }
        if (params.materialId) {
          query = query.eq('material_id', params.materialId);
        }

        query = query
          .order('assigned_at', { ascending: false })
          .limit(params.limit || 50)
          .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

        const { data, error } = await query;
        if (error) throw error;

        return data;
      } catch (error) {
        console.error('Error fetching tasks from Supabase:', error);
        return this.getMockTasks(userId);
      }
    }
    return this.getMockTasks(userId);
  }

  // Update task
  async updateTask(data: TaskUpdateData): Promise<MaterialTask> {
    if (this.useSupabase) {
      try {
        const updateData: any = {};
        
        if (data.status) updateData.status = data.status;
        if (data.notes) updateData.notes = data.notes;
        if (data.dueDate) updateData.due_date = data.dueDate;
        if (data.priority) updateData.priority = data.priority;

        if (data.status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }

        const { data: task, error } = await supabase
          .from('clinical_material_tasks')
          .update(updateData)
          .eq('id', data.id)
          .select()
          .single();

        if (error) throw error;
        return task;
      } catch (error) {
        console.error('Error updating task in Supabase:', error);
        throw error;
      }
    }

    // Mock update
    const mockTask: MaterialTask = {
      id: data.id,
      materialId: 'mock-material',
      mentionedUserId: 'mock-user',
      mentionedUserName: 'Mock User',
      content: 'Mock content',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      assignedAt: new Date().toISOString(),
      notes: data.notes,
      dueDate: data.dueDate,
    };

    return mockTask;
  }

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from('clinical_material_tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting task from Supabase:', error);
        throw error;
      }
    }
  }

  // Get task statistics
  async getTaskStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('clinical_material_tasks')
          .select('status, due_date')
          .eq('user_id', userId);

        if (error) throw error;

        const stats = {
          total: data.length,
          pending: data.filter(t => t.status === 'pending').length,
          inProgress: data.filter(t => t.status === 'in_progress').length,
          completed: data.filter(t => t.status === 'completed').length,
          overdue: data.filter(t => 
            t.status !== 'completed' && 
            t.due_date && 
            new Date(t.due_date) < new Date()
          ).length,
        };

        return stats;
      } catch (error) {
        console.error('Error fetching task stats from Supabase:', error);
        return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
      }
    }

    return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  }

  // Create notification
  private async createNotification(taskId: string, userId: string, materialId: string, content: string): Promise<void> {
    if (this.useSupabase) {
      try {
        // Get material name
        const { data: material } = await supabase
          .from('clinical_materials')
          .select('name')
          .eq('id', materialId)
          .single();

        const { error } = await supabase
          .from('notifications')
          .insert([{
            user_id: userId,
            type: 'material_mention',
            title: 'Nova tarefa atribuída',
            message: `Você foi mencionado no material "${material?.name || 'Material'}"`,
            metadata: {
              task_id: taskId,
              material_id: materialId,
              content: content.substring(0, 100) + '...'
            }
          }]);

        if (error) throw error;
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }
  }

  // Mock data
  private getMockTasks(userId: string): MaterialTask[] {
    return [
      {
        id: 'task-1',
        materialId: 'mat001',
        mentionedUserId: userId,
        mentionedUserName: 'Amanda Silva',
        content: 'Revisar protocolo de fisioterapia respiratória',
        status: 'pending',
        priority: 'high',
        assignedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      },
      {
        id: 'task-2',
        materialId: 'mat002',
        mentionedUserId: userId,
        mentionedUserName: 'Carlos Santos',
        content: 'Validar escala de avaliação de dor',
        status: 'in_progress',
        priority: 'medium',
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        notes: 'Aguardando feedback do supervisor',
      },
      {
        id: 'task-3',
        materialId: 'mat003',
        mentionedUserId: userId,
        mentionedUserName: 'Maria Oliveira',
        content: 'Atualizar guia de exercícios domiciliares',
        status: 'completed',
        priority: 'low',
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ];
  }
}

// Export singleton instance
export const materialTaskService = new MaterialTaskService();
