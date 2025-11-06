/**
 * Serviço de Gerenciamento de Vídeos de Exercícios
 * MoocaFisio - Sistema de Upload e Gerenciamento
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ExerciseVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  storage_path?: string;
  video_type: 'url' | 'storage' | 'youtube' | 'vimeo';
  duration?: number;
  category?: string;
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * Faz upload de vídeo para o Supabase Storage
 */
export async function uploadVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string }> {
  // Validar arquivo
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 500MB');
  }
  
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato não suportado. Use MP4, WebM ou MOV');
  }
  
  // Gerar nome único
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomStr}.${extension}`;
  const filePath = `videos/${fileName}`;
  
  // Fazer upload
  const { data, error } = await supabase.storage
    .from('exercise-videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('exercise-videos')
    .getPublicUrl(filePath);
  
  return {
    path: filePath,
    url: publicUrl,
  };
}

/**
 * Faz upload de thumbnail
 */
export async function uploadThumbnail(
  file: File
): Promise<{ path: string; url: string }> {
  // Validar arquivo
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Imagem muito grande. Tamanho máximo: 5MB');
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato não suportado. Use JPEG, PNG ou WebP');
  }
  
  // Gerar nome único
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomStr}.${extension}`;
  const filePath = `thumbnails/${fileName}`;
  
  // Fazer upload
  const { data, error } = await supabase.storage
    .from('exercise-videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('exercise-videos')
    .getPublicUrl(filePath);
  
  return {
    path: filePath,
    url: publicUrl,
  };
}

/**
 * Cria registro de vídeo no banco
 */
export async function createVideoRecord(data: {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  storagePath?: string;
  videoType: 'url' | 'storage' | 'youtube' | 'vimeo';
  duration?: number;
  category?: string;
  tags?: string[];
}): Promise<ExerciseVideo> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: video, error } = await supabase
    .from('exercise_videos')
    .insert({
      title: data.title,
      description: data.description,
      video_url: data.videoUrl,
      thumbnail_url: data.thumbnailUrl,
      storage_path: data.storagePath,
      video_type: data.videoType,
      duration: data.duration,
      category: data.category,
      tags: data.tags,
      created_by: user?.id,
      is_active: true,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao salvar vídeo: ${error.message}`);
  }
  
  return video;
}

/**
 * Lista vídeos
 */
export async function listVideos(filters?: {
  category?: string;
  search?: string;
}): Promise<ExerciseVideo[]> {
  let query = supabase
    .from('exercise_videos')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar vídeos: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Obtém vídeo por ID
 */
export async function getVideo(id: string): Promise<ExerciseVideo> {
  const { data, error } = await supabase
    .from('exercise_videos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Erro ao buscar vídeo: ${error.message}`);
  }
  
  return data;
}

/**
 * Atualiza vídeo
 */
export async function updateVideo(
  id: string,
  updates: Partial<Omit<ExerciseVideo, 'id' | 'created_at' | 'updated_at'>>
): Promise<ExerciseVideo> {
  const { data, error } = await supabase
    .from('exercise_videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao atualizar vídeo: ${error.message}`);
  }
  
  return data;
}

/**
 * Deleta vídeo (soft delete)
 */
export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_videos')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) {
    throw new Error(`Erro ao deletar vídeo: ${error.message}`);
  }
}

/**
 * Remove arquivo do storage
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('exercise-videos')
    .remove([path]);
  
  if (error) {
    throw new Error(`Erro ao remover arquivo: ${error.message}`);
  }
}

