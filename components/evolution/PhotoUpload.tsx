/**
 * Componente: PhotoUpload
 * Upload de fotos de progresso do paciente
 */

import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { ProgressPhoto } from '@/types';
import { uploadMultiplePhotos, deletePhoto } from '@/services/storage/photoUploadService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/contexts/ToastContext';

interface PhotoUploadProps {
  patientId: string;
  sessionId: string;
  photos: ProgressPhoto[];
  onPhotosChange: (photos: ProgressPhoto[]) => void;
}

export function PhotoUpload({ patientId, sessionId, photos, onPhotosChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const uploadedPhotos = await uploadMultiplePhotos(
        files,
        patientId,
        sessionId,
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );

      if (uploadedPhotos.length > 0) {
        onPhotosChange([...photos, ...uploadedPhotos]);
        showToast(`${uploadedPhotos.length} foto(s) adicionada(s)`, 'success');
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showToast('Erro ao fazer upload das fotos', 'error');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], caption };
    onPhotosChange(updated);
  };

  const handleRemovePhoto = async (index: number) => {
    const photo = photos[index];
    
    try {
      // Tentar deletar do storage
      await deletePhoto(photo.url);
    } catch (error) {
      console.error('Erro ao deletar foto do storage:', error);
      // Continuar mesmo se falhar (pode ser mock)
    }

    // Remover da lista
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
    showToast('Foto removida', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header e botão de upload */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Fotos de Progresso</Label>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando {uploadProgress.current}/{uploadProgress.total}...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Adicionar Fotos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid de fotos */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              {/* Imagem */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={photo.url}
                  alt={photo.caption || `Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Botão remover (aparece no hover) */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  title="Remover foto"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Overlay com número */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                  Foto {index + 1}
                </div>
              </div>
              
              {/* Campo de legenda */}
              <Input
                type="text"
                placeholder="Adicionar legenda..."
                value={photo.caption || ''}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                className="mt-2 text-sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            Nenhuma foto adicionada
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Adicione fotos para documentar o progresso do paciente
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Selecionar Fotos
          </Button>
        </div>
      )}

      {/* Info sobre fotos */}
      {photos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong>{photos.length}</strong> foto(s) adicionada(s) • 
            As fotos serão salvas com a evolução da sessão
          </p>
        </div>
      )}
    </div>
  );
}

