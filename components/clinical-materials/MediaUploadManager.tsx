import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  FileText, 
  X, 
  Plus, 
  ExternalLink,
  Trash2,
  Edit,
  Download,
  Eye
} from 'lucide-react';
import { mediaUploadService, MediaGalleryItem } from '../../services/mediaUploadService';
import { MediaAttachment } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/useToast';

interface MediaUploadManagerProps {
  materialId: string;
  onMediaChange: (media: MediaAttachment[]) => void;
  className?: string;
}

const MediaUploadManager: React.FC<MediaUploadManagerProps> = ({
  materialId,
  onMediaChange,
  className = ''
}) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [gallery, setGallery] = useState<MediaGalleryItem[]>([]);
  const [showUrlUpload, setShowUrlUpload] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video' | 'gif'>('image');
  const [editingMedia, setEditingMedia] = useState<MediaGalleryItem | null>(null);
  const [editForm, setEditForm] = useState({ alt: '', caption: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Load gallery on mount
  React.useEffect(() => {
    loadGallery();
  }, [materialId]);

  const loadGallery = async () => {
    try {
      const items = await mediaUploadService.getMediaGallery(materialId);
      setGallery(items);
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises: Promise<MediaAttachment>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = getFileType(file);
      
      uploadPromises.push(
        mediaUploadService.uploadFile({
          materialId,
          file,
          type,
        })
      );
    }

    try {
      const uploadedMedia = await Promise.all(uploadPromises);
      onMediaChange(uploadedMedia);
      await loadGallery();
      showToast(`${uploadedMedia.length} arquivo(s) enviado(s) com sucesso`, 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Erro ao enviar arquivos', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [materialId, onMediaChange, showToast]);

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);
    try {
      const media = await mediaUploadService.uploadFromUrl(urlInput, {
        materialId,
        type: urlType,
      });

      onMediaChange([media]);
      await loadGallery();
      showToast('URL adicionada com sucesso', 'success');
      setUrlInput('');
      setShowUrlUpload(false);
    } catch (error) {
      console.error('Error uploading from URL:', error);
      showToast('Erro ao adicionar URL', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
      try {
        await mediaUploadService.deleteMedia(mediaId);
        await loadGallery();
        showToast('Arquivo excluído com sucesso', 'success');
      } catch (error) {
        console.error('Error deleting media:', error);
        showToast('Erro ao excluir arquivo', 'error');
      }
    }
  };

  const handleEditMedia = (media: MediaGalleryItem) => {
    setEditingMedia(media);
    setEditForm({
      alt: media.alt || '',
      caption: media.caption || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    try {
      await mediaUploadService.updateMedia(editingMedia.id, {
        alt: editForm.alt,
        caption: editForm.caption,
      });
      
      await loadGallery();
      setEditingMedia(null);
      showToast('Arquivo atualizado com sucesso', 'success');
    } catch (error) {
      console.error('Error updating media:', error);
      showToast('Erro ao atualizar arquivo', 'error');
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

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'gif':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image':
      case 'gif':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Mídia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Enviar Arquivos</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Selecionar Arquivos
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUrlUpload(!showUrlUpload)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Adicionar URL
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* URL Upload */}
          {showUrlUpload && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <select
                  value={urlType}
                  onChange={(e) => setUrlType(e.target.value as any)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                  <option value="gif">GIF</option>
                </select>
                <Input
                  ref={urlInputRef}
                  placeholder="Cole a URL aqui..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlUpload}
                  disabled={!urlInput.trim() || isUploading}
                  size="sm"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Enviando arquivos...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      {gallery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Galeria de Mídia ({gallery.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="relative group border rounded-lg overflow-hidden bg-white"
                >
                  {/* Media Preview */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {item.type === 'image' || item.type === 'gif' ? (
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === 'video' ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="text-center">
                        {getFileTypeIcon(item.type)}
                        <p className="text-xs text-gray-500 mt-1">
                          {item.filename}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditMedia(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="h-8 w-8 p-0 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getFileTypeColor(item.type)}`}>
                        {item.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {mediaUploadService.formatFileSize(item.size)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.filename}
                    </p>
                    {item.alt && (
                      <p className="text-xs text-gray-600 mt-1">
                        Alt: {item.alt}
                      </p>
                    )}
                    {item.caption && (
                      <p className="text-xs text-gray-600 mt-1">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {editingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Editar Mídia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Texto Alternativo</Label>
                <Input
                  value={editForm.alt}
                  onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                  placeholder="Descreva a imagem para acessibilidade..."
                />
              </div>
              <div>
                <Label>Legenda</Label>
                <Input
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  placeholder="Legenda opcional..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingMedia(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {gallery.length === 0 && !isUploading && (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma mídia adicionada
            </h3>
            <p className="text-gray-600 mb-4">
              Envie arquivos ou adicione URLs para começar
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeira Mídia
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaUploadManager;
