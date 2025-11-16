/**
 * Modal de Upload de Vídeo de Exercício
 * MoocaFisio - Fisioterapeuta
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { X, Upload, Link as LinkIcon, Youtube, Video } from 'lucide-react';

interface VideoUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function VideoUploadModal({ onClose, onSuccess }: VideoUploadModalProps) {
  const [uploadType, setUploadType] = useState<'upload' | 'url'>('url');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };
  
  const handleThumbnailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };
  
  const detectVideoType = (url: string): 'url' | 'youtube' | 'vimeo' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'url';
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }
    
    if (uploadType === 'upload' && !videoFile) {
      setError('Selecione um arquivo de vídeo');
      return;
    }
    
    if (uploadType === 'url' && !videoUrl.trim()) {
      setError('URL do vídeo é obrigatória');
      return;
    }
    
    setLoading(true);
    
    try {
      let finalVideoUrl = videoUrl;
      let finalThumbnailUrl: string | undefined;
      let storagePath: string | undefined;
      let videoType: 'url' | 'storage' | 'youtube' | 'vimeo' = 'url';
      
      // Upload de vídeo se for arquivo local
      if (uploadType === 'upload' && videoFile) {
        setUploadProgress(10);
        const videoUpload = await uploadVideo(videoFile, (progress) => {
          setUploadProgress(10 + progress * 0.6); // 10% a 70%
        });
        finalVideoUrl = videoUpload.url;
        storagePath = videoUpload.path;
        videoType = 'storage';
        setUploadProgress(70);
      } else {
        videoType = detectVideoType(videoUrl);
        setUploadProgress(30);
      }
      
      // Upload de thumbnail se fornecida
      if (thumbnailFile) {
        setUploadProgress(70);
        const thumbnailUpload = await uploadThumbnail(thumbnailFile);
        finalThumbnailUrl = thumbnailUpload.url;
        setUploadProgress(85);
      }
      
      // Criar registro no banco
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      
      await createVideoRecord({
        title,
        description,
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        storagePath,
        videoType,
        category: category || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });
      
      setUploadProgress(100);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Adicionar Vídeo de Exercício
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Upload Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Vídeo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  uploadType === 'url'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span className="font-medium">URL Externa</span>
              </button>
              
              <button
                type="button"
                onClick={() => setUploadType('upload')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  uploadType === 'upload'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload Local</span>
              </button>
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Alongamento de quadríceps"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o exercício..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>
          
          {/* Video Input */}
          {uploadType === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo *
              </label>
              <div className="relative">
                <Youtube className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Suporta YouTube, Vimeo ou links diretos
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo de Vídeo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileChange}
                  className="hidden"
                  id="video-file"
                  disabled={loading}
                />
                <label
                  htmlFor="video-file"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Selecionar arquivo
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  MP4, WebM ou MOV (máx. 500MB)
                </p>
                {videoFile && (
                  <p className="text-sm text-gray-700 mt-3 font-medium">
                    {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miniatura (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailFileChange}
                className="hidden"
                id="thumbnail-file"
                disabled={loading}
              />
              <label
                htmlFor="thumbnail-file"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Selecionar imagem
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG ou WebP (máx. 5MB)
              </p>
              {thumbnailFile && (
                <p className="text-sm text-gray-700 mt-2 font-medium">
                  {thumbnailFile.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Alongamento, Fortalecimento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="joelho, quadríceps, pós-operatório (separadas por vírgula)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          {/* Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {uploadProgress < 100 ? 'Fazendo upload...' : 'Concluído!'}
                </span>
                <span className="text-sm font-medium text-blue-900">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Salvar Vídeo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

