/**
 * Componente de Upload de Mídia
 * Drag-and-drop com preview e validação
 */

import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { mediaService } from '../../services/mediaService';
import { Upload, X, Image as ImageIcon, Video, Check } from 'lucide-react';

interface MediaUploaderProps {
  onUpload: (url: string, thumbnailUrl?: string) => void;
  accept?: 'image' | 'video' | 'both';
  maxSize?: number; // MB
  multiple?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUpload,
  accept = 'both',
  maxSize = 10,
  multiple = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptTypes = {
    image: 'image/jpeg,image/png,image/gif,image/webp',
    video: 'video/mp4,video/webm',
    both: 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm',
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFiles(files);
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      await handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0]; // Por enquanto, apenas um arquivo

      // Validação de tamanho
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      }

      // Upload
      const result = await mediaService.upload({
        file,
        onProgress: setUploadProgress,
        maxSize: maxSize * 1024 * 1024,
        compress: true,
      });

      // Preview
      setPreview(result.url);

      // Callback
      onUpload(result.url, result.thumbnailUrl);

      console.log('✅ Upload concluído:', result);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      console.error('❌ Erro no upload:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-600" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {isDragging ? 'Solte o arquivo aqui' : 'Upload de Mídia'}
                </h3>
                <p className="text-sm text-gray-600">
                  Arraste e solte ou clique para selecionar
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={acceptTypes[accept]}
                  onChange={handleFileInput}
                  multiple={multiple}
                />
                <label htmlFor="file-upload">
                  <Button type="button" asChild>
                    <span>Selecionar Arquivo</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500">
                  {accept === 'image' ? 'Imagens' : accept === 'video' ? 'Vídeos' : 'Imagens ou Vídeos'} 
                  {' '}• Máximo {maxSize}MB
                </p>
              </div>

              {uploading && (
                <div className="w-full max-w-xs space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-center text-gray-600">
                    Enviando... {uploadProgress}%
                  </p>
                </div>
              )}

              {error && (
                <Badge variant="destructive" className="mt-2">
                  {error}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {preview.startsWith('data:image') ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Upload concluído</span>
                </div>
                <p className="text-sm text-gray-600">
                  Arquivo enviado com sucesso
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

