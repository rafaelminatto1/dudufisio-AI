import { createServerComponentClient } from '~/lib/supabase/server';

export interface UploadOptions {
  file: File;
  folder?: string;
  maxSize?: number; // em MB
  compress?: boolean;
}

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  path: string;
}

/**
 * Service para gerenciar upload e gestão de mídia
 * Adaptado para Next.js App Router com Supabase Storage
 */
export class MediaService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

  /**
   * Upload de arquivo para Supabase Storage
   */
  static async upload(options: UploadOptions) {
    try {
      const { file, folder = 'media', maxSize = this.MAX_FILE_SIZE, compress = true } = options;

      // Validação
      this.validateFile(file, maxSize);

      const supabase = await createServerComponentClient();

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Converter para ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const result: UploadResult = {
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        path: filePath,
      };

      // Se for imagem, gerar thumbnail (simplificado - em produção usaria imagem otimizada)
      if (this.isImage(file)) {
        result.thumbnailUrl = urlData.publicUrl; // Por enquanto, mesma URL
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }

  /**
   * Deleta arquivo do storage
   */
  static async delete(filePath: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { data: null, error };
    }
  }

  /**
   * Lista arquivos em uma pasta
   */
  static async listFiles(folder: string = 'media', limit: number = 100) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase.storage
        .from('media')
        .list(folder, {
          limit,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      // Adicionar URLs públicas
      const filesWithUrls = (data || []).map(file => ({
        ...file,
        url: supabase.storage.from('media').getPublicUrl(`${folder}/${file.name}`).data.publicUrl,
      }));

      return { data: filesWithUrls, error: null };
    } catch (error) {
      console.error('Error listing files:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém URL pública de um arquivo
   */
  static getPublicUrl(filePath: string) {
    // Esta função pode ser chamada no cliente também
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = 'media';
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
  }

  /**
   * Valida arquivo
   */
  private static validateFile(file: File, maxSize: number): void {
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = this.ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error('Tipo de arquivo não suportado. Use imagens (JPEG, PNG, GIF, WebP) ou vídeos (MP4, WebM)');
    }
  }

  /**
   * Verifica se é imagem
   */
  private static isImage(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * Verifica se é vídeo
   */
  private static isVideo(file: File): boolean {
    return this.ALLOWED_VIDEO_TYPES.includes(file.type);
  }
}

