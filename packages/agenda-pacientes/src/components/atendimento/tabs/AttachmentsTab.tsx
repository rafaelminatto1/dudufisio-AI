// components/atendimento/tabs/AttachmentsTab.tsx
import React, { useState, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Upload,
  Camera,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  X,
  Download,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { AttendanceFormData } from '../../../schemas/attendanceFormValidation';
import { useToast } from '../../../contexts/ToastContext';
import { attachmentStorageService } from '../../../services/attachmentStorageService';

interface Attachment {
  id: string;
  name: string;
  type: string; // 'image' | 'video' | 'audio' | 'document' | 'other'
  url: string;
  size: number;
  uploadedAt: Date;
  thumbnailUrl?: string;
}

export const AttachmentsTab: React.FC = () => {
  const { setValue, watch } = useFormContext<AttendanceFormData>();
  const { showToast } = useToast();
  const attachments = watch('attachments') || [];

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determinar tipo de arquivo
  const getFileType = (mimeType: string): Attachment['type'] => {
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
  };

  // Ícone por tipo de arquivo
  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      default:
        return File;
    }
  };

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Upload de arquivo
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      try {
        showToast('Enviando arquivo(s)...', 'info');

        // Tentar upload no Supabase Storage primeiro
        const uploadedMetadata = await attachmentStorageService.uploadMultipleFiles(
          files,
          undefined, // sessionId - será preenchido quando salvar a sessão
          undefined  // patientId - será preenchido quando salvar a sessão
        );

        if (uploadedMetadata.length > 0) {
          // Converter metadata para formato do componente
          const newAttachments: Attachment[] = uploadedMetadata.map(meta => ({
            id: meta.id,
            name: meta.name,
            type: meta.type,
            url: meta.url,
            size: meta.size,
            uploadedAt: new Date(meta.uploaded_at),
            thumbnailUrl: meta.thumbnail_url || (meta.type === 'image' ? meta.url : undefined),
          }));

          setValue('attachments', [...attachments, ...newAttachments], { shouldDirty: true });
          showToast(`${newAttachments.length} arquivo(s) enviado(s) com sucesso!`, 'success');
        } else {
          throw new Error('Nenhum arquivo foi enviado com sucesso');
        }
      } catch (error) {
        console.error('Erro no upload:', error);

        // Fallback: usar blob URLs locais (temporários)
        const newAttachments: Attachment[] = [];

        Array.from(files).forEach((file) => {
          // Validação de tamanho (máx 10MB)
          if (file.size > 10 * 1024 * 1024) {
            showToast(`Arquivo "${file.name}" é muito grande (máx 10MB)`, 'error');
            return;
          }

          // Criar URL temporária
          const url = URL.createObjectURL(file);
          const type = getFileType(file.type);

          const attachment: Attachment = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type,
            url,
            size: file.size,
            uploadedAt: new Date(),
            thumbnailUrl: type === 'image' ? url : undefined,
          };

          newAttachments.push(attachment);
        });

        if (newAttachments.length > 0) {
          setValue('attachments', [...attachments, ...newAttachments], { shouldDirty: true });
          showToast(
            `${newAttachments.length} arquivo(s) adicionado(s) localmente (não persistente)`,
            'warning'
          );
        }
      }
    },
    [attachments, setValue, showToast]
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  // Abrir seletor de arquivo
  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Capturar foto com câmera
  const handleOpenCamera = useCallback(async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      showToast('Erro ao acessar câmera', 'error');
      setShowCamera(false);
    }
  }, [showToast]);

  const handleCapturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Capturar frame do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        // Criar File object do blob
        const fileName = `Foto_${new Date().toISOString().slice(0, 10)}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        showToast('Enviando foto...', 'info');

        // Upload para Supabase Storage
        const metadata = await attachmentStorageService.uploadFile(file);

        if (metadata) {
          const attachment: Attachment = {
            id: metadata.id,
            name: metadata.name,
            type: metadata.type,
            url: metadata.url,
            size: metadata.size,
            uploadedAt: new Date(metadata.uploaded_at),
            thumbnailUrl: metadata.thumbnail_url || metadata.url,
          };

          setValue('attachments', [...attachments, attachment], { shouldDirty: true });
          showToast('Foto capturada e enviada com sucesso!', 'success');
        } else {
          throw new Error('Falha no upload da foto');
        }
      } catch (error) {
        console.error('Erro ao enviar foto:', error);

        // Fallback: usar URL local
        const url = URL.createObjectURL(blob);
        const attachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          name: `Foto_${new Date().toISOString().slice(0, 10)}.jpg`,
          type: 'image',
          url,
          size: blob.size,
          uploadedAt: new Date(),
          thumbnailUrl: url,
        };

        setValue('attachments', [...attachments, attachment], { shouldDirty: true });
        showToast('Foto capturada localmente (não persistente)', 'warning');
      } finally {
        // Fechar câmera
        handleCloseCamera();
      }
    }, 'image/jpeg');
  }, [attachments, setValue, showToast]);

  const handleCloseCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  }, []);

  // Remover anexo
  const handleRemoveAttachment = useCallback(
    (id: string) => {
      const newAttachments = attachments.filter((a: Attachment) => a.id !== id);
      setValue('attachments', newAttachments, { shouldDirty: true });
      showToast('Anexo removido', 'info');
    },
    [attachments, setValue, showToast]
  );

  // Visualizar anexo
  const handleViewAttachment = useCallback((attachment: Attachment) => {
    setSelectedFile(attachment);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          Anexos e Documentação
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Fotos, vídeos, documentos e outros arquivos relacionados à sessão
        </p>
      </div>

      {/* Área de Upload */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-8 border-2 border-dashed transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-100 scale-[1.02]'
            : 'border-slate-300 hover:border-blue-400'
        }`}
      >
        <div className="text-center space-y-4">
          <Upload className={`w-12 h-12 mx-auto transition-colors ${
            isDragging ? 'text-blue-600' : 'text-slate-400'
          }`} />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {isDragging ? 'Solte os arquivos aqui' : 'Adicionar Anexos'}
            </h3>
            <p className="text-sm text-slate-600">
              Arraste arquivos ou clique nos botões abaixo
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSelectFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Selecionar Arquivo</span>
            </button>

            <button
              onClick={handleOpenCamera}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Tirar Foto</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Formatos aceitos: Imagens, vídeos, áudios, PDFs e documentos (máx 10MB)
          </p>
        </div>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Lista de Anexos */}
      {attachments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <span>Anexos ({attachments.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {attachments.map((attachment: Attachment) => {
                const Icon = getFileIcon(attachment.type);
                return (
                  <motion.div
                    key={attachment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Preview */}
                    <div className="relative aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden">
                      {attachment.type === 'image' && attachment.thumbnailUrl ? (
                        <img
                          src={attachment.thumbnailUrl}
                          alt={attachment.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Icon className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(attachment.size)}
                      </p>

                      {/* Ações */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleViewAttachment(attachment)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Baixar</span>
                        </a>
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="inline-flex items-center justify-center p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal da Câmera */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={handleCloseCamera}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Capturar Foto</h3>
                <button
                  onClick={handleCloseCamera}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleCapturePhoto}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capturar Foto</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Visualização */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{selectedFile.name}</h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-100 rounded-lg overflow-hidden">
                  {selectedFile.type === 'image' && (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.name}
                      className="w-full h-auto"
                    />
                  )}
                  {selectedFile.type === 'video' && (
                    <video src={selectedFile.url} controls className="w-full h-auto" />
                  )}
                  {selectedFile.type === 'audio' && (
                    <audio src={selectedFile.url} controls className="w-full" />
                  )}
                  {selectedFile.type !== 'image' &&
                    selectedFile.type !== 'video' &&
                    selectedFile.type !== 'audio' && (
                      <div className="p-8 text-center">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">Preview não disponível para este tipo de arquivo</p>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
