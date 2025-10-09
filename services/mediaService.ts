/**
 * Serviço de Gestão de Mídia
 * Upload e gerenciamento de imagens/vídeos
 */

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  maxSize?: number; // em MB
  compress?: boolean;
}

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

class MediaService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

  /**
   * Upload de arquivo (localStorage temporário)
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const { file, onProgress, maxSize = this.MAX_FILE_SIZE, compress = true } = options;

    // Validação
    this.validateFile(file, maxSize);

    // Simular progresso
    if (onProgress) {
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(i);
      }
    }

    // Converter para base64
    const base64 = await this.fileToBase64(file);

    // Comprimir imagem se necessário
    const finalData = compress && this.isImage(file)
      ? await this.compressImage(base64, file.type)
      : base64;

    // Salvar em localStorage (temporário)
    const id = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mediaData = {
      id,
      data: finalData,
      type: file.type,
      size: file.size,
      name: file.name,
      uploadedAt: new Date().toISOString(),
    };

    const storedMedia = this.getStoredMedia();
    storedMedia.push(mediaData);
    localStorage.setItem('exerciseMedia', JSON.stringify(storedMedia));

    // Gerar thumbnail se for imagem
    const thumbnailUrl = this.isImage(file)
      ? await this.generateThumbnail(finalData, file.type)
      : undefined;

    return {
      url: finalData,
      thumbnailUrl,
      size: file.size,
      type: file.type,
    };
  }

  /**
   * Validar arquivo
   */
  private validateFile(file: File, maxSize: number): void {
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = this.ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error('Tipo de arquivo não suportado');
    }
  }

  /**
   * Verificar se é imagem
   */
  private isImage(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * Converter arquivo para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprimir imagem
   */
  private async compressImage(base64: string, type: string, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Redimensionar se muito grande
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL(type, quality);
        resolve(compressed);
      };
      img.src = base64;
    });
  }

  /**
   * Gerar thumbnail
   */
  private async generateThumbnail(base64: string, type: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const thumbnailSize = 200;
        canvas.width = thumbnailSize;
        canvas.height = thumbnailSize;

        // Crop central
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, thumbnailSize, thumbnailSize);

        const thumbnail = canvas.toDataURL(type, 0.7);
        resolve(thumbnail);
      };
      img.src = base64;
    });
  }

  /**
   * Obter mídias armazenadas
   */
  private getStoredMedia(): any[] {
    try {
      const stored = localStorage.getItem('exerciseMedia');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Deletar mídia
   */
  deleteMedia(id: string): void {
    const storedMedia = this.getStoredMedia();
    const filtered = storedMedia.filter(m => m.id !== id);
    localStorage.setItem('exerciseMedia', JSON.stringify(filtered));
  }

  /**
   * Limpar mídias antigas (> 30 dias)
   */
  cleanupOldMedia(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const storedMedia = this.getStoredMedia();
    const filtered = storedMedia.filter(m => {
      const uploadDate = new Date(m.uploadedAt);
      return uploadDate >= cutoffDate;
    });

    localStorage.setItem('exerciseMedia', JSON.stringify(filtered));
    console.log(`🗑️ Mídias antigas removidas. Mantidas: ${filtered.length}`);
  }

  /**
   * Obter tamanho total de mídias
   */
  getTotalMediaSize(): number {
    const storedMedia = this.getStoredMedia();
    return storedMedia.reduce((sum, m) => sum + (m.size || 0), 0);
  }

  /**
   * Verificar espaço disponível
   */
  checkStorageSpace(): { used: number; available: number; percentage: number } {
    const totalSize = this.getTotalMediaSize();
    const maxStorage = 5 * 1024 * 1024; // 5MB limite estimado do localStorage
    
    return {
      used: totalSize,
      available: maxStorage - totalSize,
      percentage: (totalSize / maxStorage) * 100,
    };
  }
}

export const mediaService = new MediaService();

