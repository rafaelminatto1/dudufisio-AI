/**
 * Service para upload de fotos de progresso
 * Usa Supabase Storage com compressão automática
 */

import { supabase } from '@/lib/supabaseClient';
import { ProgressPhoto } from '@/types';

const BUCKET_NAME = 'progress-photos';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

/**
 * Comprime uma imagem antes do upload
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular novas dimensões mantendo aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          QUALITY
        );
      };

      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'O arquivo deve ser uma imagem' };
  }

  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `A imagem deve ter menos de ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  return { valid: true };
}

/**
 * Upload de foto para Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  patientId: string,
  sessionId: string
): Promise<string> {
  try {
    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Comprimir imagem
    const compressedFile = await compressImage(file);

    // Gerar nome único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const extension = compressedFile.type.split('/')[1] || 'jpg';
    const fileName = `${timestamp}-${randomStr}.${extension}`;
    
    // Path: patientId/sessionId/filename
    const filePath = `${patientId}/${sessionId}/${fileName}`;

    // Upload para Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    throw new Error('Não foi possível fazer upload da foto');
  }
}

/**
 * Upload de múltiplas fotos
 */
export async function uploadMultiplePhotos(
  files: File[],
  patientId: string,
  sessionId: string,
  onProgress?: (current: number, total: number) => void
): Promise<ProgressPhoto[]> {
  const photos: ProgressPhoto[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadPhoto(files[i], patientId, sessionId);
      
      photos.push({
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        caption: '',
        uploaded_at: new Date().toISOString()
      });

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Erro ao fazer upload do arquivo ${i + 1}:`, error);
      // Continuar com as outras fotos
    }
  }

  return photos;
}

/**
 * Deleta uma foto do Supabase Storage
 */
export async function deletePhoto(url: string): Promise<void> {
  try {
    // Extrair o path da URL
    const urlParts = url.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      throw new Error('URL inválida');
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    throw new Error('Não foi possível deletar a foto');
  }
}

/**
 * Deleta múltiplas fotos
 */
export async function deleteMultiplePhotos(urls: string[]): Promise<void> {
  const promises = urls.map(url => deletePhoto(url));
  await Promise.all(promises);
}

/**
 * Cria o bucket se não existir (útil para setup inicial)
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE
      });

      if (error) {
        console.error('Erro ao criar bucket:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar bucket:', error);
  }
}

