import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, Music, FileText } from 'lucide-react';
import { mediaUploadService } from '../../services/mediaUploadService';
import { MediaAttachment } from '../../types';

interface MediaUploadNodeProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
}

export const MediaUploadNode: React.FC<MediaUploadNodeProps> = ({
  node,
  updateAttributes,
  deleteNode
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      const type = getFileType(file);
      
      // Get material ID from editor context
      const materialId = node.attrs.materialId || 'temp';

      const media = await mediaUploadService.uploadFile({
        materialId,
        file,
        type,
      });

      updateAttributes({
        src: media.url,
        alt: media.alt,
        title: media.caption,
        type: media.type,
        uploaded: true,
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error - maybe show error message
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (file: File): 'image' | 'video' | 'gif' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) {
      return file.type === 'image/gif' ? 'gif' : 'image';
    }
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
      case 'gif':
        return <Image className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'audio':
        return <Music className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const renderMedia = () => {
    const { src, type, alt, title } = node.attrs;

    if (!src) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Clique para fazer upload de mídia
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={isUploading}
          >
            {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
          </button>
        </div>
      );
    }

    switch (type) {
      case 'image':
      case 'gif':
        return (
          <div className="relative group">
            <img
              src={src}
              alt={alt || ''}
              title={title || ''}
              className="max-w-full h-auto rounded-lg"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={deleteNode}
                className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="relative group">
            <video
              src={src}
              controls
              className="max-w-full h-auto rounded-lg"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={deleteNode}
                className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="relative group border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              {getMediaIcon(type)}
              <span className="text-sm font-medium">Arquivo de Áudio</span>
              <button
                onClick={deleteNode}
                className="ml-auto p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <audio src={src} controls className="w-full" />
          </div>
        );
      
      case 'document':
        return (
          <div className="relative group border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              {getMediaIcon(type)}
              <span className="text-sm font-medium">Documento</span>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Abrir
              </a>
              <button
                onClick={deleteNode}
                className="ml-auto p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative group border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              {getMediaIcon(type)}
              <span className="text-sm font-medium">Mídia</span>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Abrir
              </a>
              <button
                onClick={deleteNode}
                className="ml-auto p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="media-upload-node">
      {renderMedia()}
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
