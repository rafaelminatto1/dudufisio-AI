import { createServerComponentClient } from '~/lib/supabase/server';

export interface VideoLibraryItem {
  id: string;
  name: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  linked_exercises?: string[];
  views?: number;
  likes?: number;
  is_public?: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface VideoLibraryFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  isPublic?: boolean;
}

/**
 * Service para gerenciar biblioteca de vídeos
 * Adaptado para Next.js App Router
 */
export class VideoLibraryService {
  /**
   * Lista vídeos da biblioteca com filtros
   */
  static async getVideos(filters?: VideoLibraryFilters) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('video_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca um vídeo por ID
   */
  static async getVideoById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('video_library')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Incrementar visualizações
      if (data) {
        await supabase
          .from('video_library')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching video:', error);
      return { data: null, error };
    }
  }

  /**
   * Cria um novo vídeo na biblioteca
   */
  static async createVideo(video: Omit<VideoLibraryItem, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('video_library')
        .insert({
          name: video.name,
          description: video.description,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          category: video.category,
          difficulty: video.difficulty,
          linked_exercises: video.linked_exercises || [],
          views: video.views || 0,
          likes: video.likes || 0,
          is_public: video.is_public ?? true,
          created_by: video.created_by,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating video:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualiza um vídeo
   */
  static async updateVideo(id: string, updates: Partial<VideoLibraryItem>) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('video_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating video:', error);
      return { data: null, error };
    }
  }

  /**
   * Deleta um vídeo
   */
  static async deleteVideo(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('video_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting video:', error);
      return { data: null, error };
    }
  }

  /**
   * Vincula vídeo a exercícios
   */
  static async linkVideoToExercises(videoId: string, exerciseIds: string[]) {
    try {
      const supabase = await createServerComponentClient();
      const { data: video } = await supabase
        .from('video_library')
        .select('linked_exercises')
        .eq('id', videoId)
        .single();

      if (!video) {
        throw new Error('Video not found');
      }

      const currentLinks = (video.linked_exercises as string[]) || [];
      const newLinks = Array.from(new Set([...currentLinks, ...exerciseIds]));

      const { data, error } = await supabase
        .from('video_library')
        .update({ linked_exercises: newLinks })
        .eq('id', videoId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error linking video to exercises:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém vídeos mais populares
   */
  static async getPopularVideos(limit: number = 10) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('video_library')
        .select('*')
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém vídeos por categoria
   */
  static async getVideosByCategory(category: string) {
    try {
      return await this.getVideos({ category, isPublic: true });
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      return { data: null, error };
    }
  }
}

