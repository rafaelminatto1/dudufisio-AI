// services/attachmentStorageService.ts
// Service para gerenciar anexos no Supabase Storage

import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/logger';

export interface AttachmentMetadata {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  storage_path: string;
  size: number;
  mime_type: string;
  session_id?: string;
  patient_id?: string;
  uploaded_by?: string;
  uploaded_at: string;
  thumbnail_url?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const BUCKET_NAME = 'attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

class AttachmentStorageService {
  /**
   * Inicializa o bucket de attachments se não existir
   */
  async ensureBucketExists(): Promise<boolean> {
    try {
      // Verificar se bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        logger.error('Erro ao listar buckets', {
          context: 'attachmentStorage.ensureBucket',
          data: { error: listError },
        });
        return false;
      }

      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

      if (!bucketExists) {
        // Criar bucket
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: false, // Privado - requer autenticação
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: [
            'image/*',
            'video/*',
            'audio/*',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ],
        });

        if (createError) {
          logger.error('Erro ao criar bucket', {
            context: 'attachmentStorage.createBucket',
            data: { error: createError },
          });
          return false;
        }

        logger.info(`Bucket '${BUCKET_NAME}' criado com sucesso`);
      }

      return true;
    } catch (error) {
      logger.error('Erro ao verificar/criar bucket', {
        context: 'attachmentStorage.ensureBucket',
        data: { error },
      });
      return false;
    }
  }

  /**
   * Faz upload de um arquivo para o Supabase Storage
   */
  async uploadFile(
    file: File,
    sessionId?: string,
    patientId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AttachmentMetadata | null> {
    try {
      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Garantir que bucket existe
      await this.ensureBucketExists();

      // Gerar nome único
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${timestamp}-${randomString}-${sanitizedFileName}`;

      // Determinar pasta baseado em sessionId ou patientId
      let folder = 'general';
      if (sessionId) {
        folder = `sessions/${sessionId}`;
      } else if (patientId) {
        folder = `patients/${patientId}`;
      }

      const storagePath = `${folder}/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        logger.error('Erro ao fazer upload', {
          context: 'attachmentStorage.upload',
          data: { error: uploadError, fileName: file.name },
        });
        throw uploadError;
      }

      // Obter URL pública (signed URL válida por 1 ano)
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 31536000); // 1 ano em segundos

      if (!urlData) {
        throw new Error('Falha ao gerar URL do arquivo');
      }

      // Determinar tipo de arquivo
      const fileType = this.getFileType(file.type);

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();

      // Criar metadata
      const metadata: AttachmentMetadata = {
        id: crypto.randomUUID(),
        name: file.name,
        type: fileType,
        url: urlData.signedUrl,
        storage_path: storagePath,
        size: file.size,
        mime_type: file.type,
        session_id: sessionId,
        patient_id: patientId,
        uploaded_by: user?.id,
        uploaded_at: new Date().toISOString(),
      };

      // Se for imagem, gerar thumbnail (opcional)
      if (fileType === 'image') {
        metadata.thumbnail_url = urlData.signedUrl; // Por enquanto usa mesma URL
      }

      // Salvar metadata no banco de dados
      const { error: dbError } = await supabase
        .from('attachments')
        .insert({
          id: metadata.id,
          name: metadata.name,
          type: metadata.type,
          url: metadata.url,
          storage_path: metadata.storage_path,
          size: metadata.size,
          mime_type: metadata.mime_type,
          session_id: metadata.session_id,
          patient_id: metadata.patient_id,
          uploaded_by: metadata.uploaded_by,
          uploaded_at: metadata.uploaded_at,
        });

      if (dbError) {
        logger.warn('Erro ao salvar metadata no banco', {
          context: 'attachmentStorage.saveMetadata',
          data: { error: dbError },
        });
        // Não falhar o upload por causa disso
      }

      logger.info('Arquivo enviado com sucesso', {
        context: 'attachmentStorage.upload',
        data: { fileName: file.name, size: file.size, path: storagePath },
      });

      return metadata;
    } catch (error) {
      logger.error('Erro ao fazer upload de arquivo', {
        context: 'attachmentStorage.upload',
        data: { error, fileName: file.name },
      });
      return null;
    }
  }

  /**
   * Faz upload de múltiplos arquivos
   */
  async uploadMultipleFiles(
    files: FileList | File[],
    sessionId?: string,
    patientId?: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<AttachmentMetadata[]> {
    const filesArray = Array.from(files);
    const results: AttachmentMetadata[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const metadata = await this.uploadFile(
        file,
        sessionId,
        patientId,
        progress => onProgress?.(i, progress)
      );

      if (metadata) {
        results.push(metadata);
      }
    }

    return results;
  }

  /**
   * Lista anexos por sessão
   */
  async getAttachmentsBySession(sessionId: string): Promise<AttachmentMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('session_id', sessionId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar anexos', {
          context: 'attachmentStorage.getBySession',
          data: { error, sessionId },
        });
        return [];
      }

      return data as AttachmentMetadata[];
    } catch (error) {
      logger.error('Erro ao buscar anexos', {
        context: 'attachmentStorage.getBySession',
        data: { error, sessionId },
      });
      return [];
    }
  }

  /**
   * Lista anexos por paciente
   */
  async getAttachmentsByPatient(patientId: string): Promise<AttachmentMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar anexos do paciente', {
          context: 'attachmentStorage.getByPatient',
          data: { error, patientId },
        });
        return [];
      }

      return data as AttachmentMetadata[];
    } catch (error) {
      logger.error('Erro ao buscar anexos do paciente', {
        context: 'attachmentStorage.getByPatient',
        data: { error, patientId },
      });
      return [];
    }
  }

  /**
   * Deleta um anexo (storage + metadata)
   */
  async deleteAttachment(attachmentId: string, storagePath: string): Promise<boolean> {
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

      if (storageError) {
        logger.error('Erro ao deletar arquivo do storage', {
          context: 'attachmentStorage.delete',
          data: { error: storageError, path: storagePath },
        });
        // Continuar para deletar metadata mesmo assim
      }

      // Deletar metadata do banco
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        logger.error('Erro ao deletar metadata', {
          context: 'attachmentStorage.deleteMetadata',
          data: { error: dbError, attachmentId },
        });
        return false;
      }

      logger.info('Anexo deletado com sucesso', {
        context: 'attachmentStorage.delete',
        data: { attachmentId, path: storagePath },
      });

      return true;
    } catch (error) {
      logger.error('Erro ao deletar anexo', {
        context: 'attachmentStorage.delete',
        data: { error, attachmentId },
      });
      return false;
    }
  }

  /**
   * Gera URL temporária para download
   */
  async getDownloadUrl(storagePath: string, expiresIn = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, expiresIn);

      if (error || !data) {
        logger.error('Erro ao gerar URL de download', {
          context: 'attachmentStorage.getDownloadUrl',
          data: { error, path: storagePath },
        });
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      logger.error('Erro ao gerar URL de download', {
        context: 'attachmentStorage.getDownloadUrl',
        data: { error, path: storagePath },
      });
      return null;
    }
  }

  // Helper methods
  private getFileType(mimeType: string): AttachmentMetadata['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text')
    ) {
      return 'document';
    }
    return 'other';
  }
}

export const attachmentStorageService = new AttachmentStorageService();
