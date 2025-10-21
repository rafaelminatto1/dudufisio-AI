// services/mediaUploadService.ts
import { supabase } from '../lib/supabaseClient';
import { MediaAttachment } from '../types';

export interface UploadOptions {
  materialId: string;
  file: File;
  type: 'image' | 'video' | 'gif' | 'audio' | 'document';
  alt?: string;
  caption?: string;
}

export interface MediaGalleryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  type: string;
  size: number;
  alt?: string;
  caption?: string;
  createdAt: string;
  materialId: string;
}

class MediaUploadService {
  private useSupabase = false;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
  private readonly ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/ogg'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword'];

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      const { data, error } = await supabase.from('clinical_material_media').select('count').limit(1);
      if (!error) {
        this.useSupabase = true;
        console.log('Media Upload Service: Using Supabase');
      }
    } catch (error) {
      console.log('Media Upload Service: Using Mock data');
    }
  }

  // Upload file to Supabase Storage
  async uploadFile(options: UploadOptions): Promise<MediaAttachment> {
    const { materialId, file, type, alt, caption } = options;

    // Validate file
    this.validateFile(file, type);

    if (this.useSupabase) {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `materials/${materialId}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('clinical-materials')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('clinical-materials')
          .getPublicUrl(filePath);

        // Save metadata to database
        const { data: mediaData, error: dbError } = await supabase
          .from('clinical_material_media')
          .insert([{
            material_id: materialId,
            type,
            url: urlData.publicUrl,
            filename: file.name,
            size: file.size,
            alt: alt || '',
            caption: caption || '',
            position: 0
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        // Generate thumbnail for images
        let thumbnailUrl = undefined;
        if (type === 'image' || type === 'gif') {
          thumbnailUrl = await this.generateThumbnail(urlData.publicUrl);
        }

        return {
          id: mediaData.id,
          type,
          url: urlData.publicUrl,
          thumbnailUrl,
          filename: file.name,
          size: file.size,
          alt: alt || '',
          caption: caption || '',
          position: 0,
        };
      } catch (error) {
        console.error('Error uploading file to Supabase:', error);
        throw error;
      }
    }

    // Mock upload
    return this.mockUpload(options);
  }

  // Upload from URL
  async uploadFromUrl(url: string, options: Omit<UploadOptions, 'file'>): Promise<MediaAttachment> {
    if (this.useSupabase) {
      try {
        // Save URL to database
        const { data: mediaData, error } = await supabase
          .from('clinical_material_media')
          .insert([{
            material_id: options.materialId,
            type: options.type,
            url,
            filename: this.extractFilenameFromUrl(url),
            size: 0, // Unknown size for URLs
            alt: options.alt || '',
            caption: options.caption || '',
            position: 0
          }])
          .select()
          .single();

        if (error) throw error;

        return {
          id: mediaData.id,
          type: options.type,
          url,
          filename: this.extractFilenameFromUrl(url),
          size: 0,
          alt: options.alt || '',
          caption: options.caption || '',
          position: 0,
        };
      } catch (error) {
        console.error('Error saving URL to Supabase:', error);
        throw error;
      }
    }

    // Mock URL upload
    return {
      id: `media-${Date.now()}`,
      type: options.type,
      url,
      filename: this.extractFilenameFromUrl(url),
      size: 0,
      alt: options.alt || '',
      caption: options.caption || '',
      position: 0,
    };
  }

  // Get media gallery for a material
  async getMediaGallery(materialId: string): Promise<MediaGalleryItem[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('clinical_material_media')
          .select('*')
          .eq('material_id', materialId)
          .order('position');

        if (error) throw error;

        return data.map(item => ({
          id: item.id,
          url: item.url,
          thumbnailUrl: item.thumbnail_url,
          filename: item.filename,
          type: item.type,
          size: item.size,
          alt: item.alt,
          caption: item.caption,
          createdAt: item.created_at,
          materialId: item.material_id,
        }));
      } catch (error) {
        console.error('Error fetching media gallery from Supabase:', error);
        return this.getMockGallery(materialId);
      }
    }
    return this.getMockGallery(materialId);
  }

  // Delete media
  async deleteMedia(mediaId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        // Get media info first
        const { data: media, error: fetchError } = await supabase
          .from('clinical_material_media')
          .select('url')
          .eq('id', mediaId)
          .single();

        if (fetchError) throw fetchError;

        // Delete from storage if it's a file (not URL)
        if (media.url.includes('supabase.co/storage')) {
          const filePath = media.url.split('/storage/v1/object/public/')[1];
          const { error: storageError } = await supabase.storage
            .from('clinical-materials')
            .remove([filePath]);

          if (storageError) {
            console.error('Error deleting from storage:', storageError);
          }
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('clinical_material_media')
          .delete()
          .eq('id', mediaId);

        if (dbError) throw dbError;
      } catch (error) {
        console.error('Error deleting media from Supabase:', error);
        throw error;
      }
    }
  }

  // Update media metadata
  async updateMedia(mediaId: string, updates: { alt?: string; caption?: string; position?: number }): Promise<void> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from('clinical_material_media')
          .update(updates)
          .eq('id', mediaId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating media in Supabase:', error);
        throw error;
      }
    }
  }

  // Validate file
  private validateFile(file: File, type: string): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo permitido: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    switch (type) {
      case 'image':
      case 'gif':
        if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Tipo de arquivo não suportado para imagem');
        }
        break;
      case 'video':
        if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
          throw new Error('Tipo de arquivo não suportado para vídeo');
        }
        break;
      case 'audio':
        if (!this.ALLOWED_AUDIO_TYPES.includes(file.type)) {
          throw new Error('Tipo de arquivo não suportado para áudio');
        }
        break;
      case 'document':
        if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
          throw new Error('Tipo de arquivo não suportado para documento');
        }
        break;
    }
  }

  // Generate thumbnail for images
  private async generateThumbnail(imageUrl: string): Promise<string> {
    // For now, return the original URL
    // In a real implementation, you'd use a service like Cloudinary or ImageKit
    return imageUrl;
  }

  // Extract filename from URL
  private extractFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Mock methods
  private mockUpload(options: UploadOptions): MediaAttachment {
    const { file, type, alt, caption } = options;
    
    return {
      id: `mock-media-${Date.now()}`,
      type,
      url: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
      alt: alt || '',
      caption: caption || '',
      position: 0,
    };
  }

  private getMockGallery(materialId: string): MediaGalleryItem[] {
    return [
      {
        id: 'mock-1',
        url: 'https://via.placeholder.com/400x300?text=Imagem+1',
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=Thumb',
        filename: 'imagem-exemplo.jpg',
        type: 'image',
        size: 1024000,
        alt: 'Imagem de exemplo',
        caption: 'Esta é uma imagem de exemplo',
        createdAt: new Date().toISOString(),
        materialId,
      },
      {
        id: 'mock-2',
        url: 'https://via.placeholder.com/600x400?text=Video+1',
        filename: 'video-exemplo.mp4',
        type: 'video',
        size: 5120000,
        alt: 'Vídeo de exemplo',
        caption: 'Este é um vídeo de exemplo',
        createdAt: new Date().toISOString(),
        materialId,
      },
    ];
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileTypeIcon(type: string): string {
    switch (type) {
      case 'image':
      case 'gif':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      default:
        return '📎';
    }
  }
}

// Export singleton instance
export const mediaUploadService = new MediaUploadService();
