// components/video/VideoUploader.tsx
import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Film, FileVideo } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useToast } from '../../contexts/ToastContext';
export const VideoUploader = ({ onUploadComplete, maxSize = 500, // 500MB default
acceptedFormats = ['video/mp4', 'video/quicktime', 'video/webm'], maxDuration = 60, className = '', }) => {
    const [videoFiles, setVideoFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();
    // Validate video file
    const validateVideo = useCallback((file) => {
        return new Promise((resolve) => {
            // Check file type
            if (!acceptedFormats.includes(file.type)) {
                resolve({
                    valid: false,
                    error: `Formato não suportado. Use: ${acceptedFormats.join(', ')}`,
                });
                return;
            }
            // Check file size
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > maxSize) {
                resolve({
                    valid: false,
                    error: `Arquivo muito grande. Máximo: ${maxSize}MB`,
                });
                return;
            }
            // Check video duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > maxDuration) {
                    resolve({
                        valid: false,
                        error: `Vídeo muito longo. Máximo: ${maxDuration}s`,
                    });
                }
                else {
                    resolve({ valid: true });
                }
            };
            video.onerror = () => {
                resolve({ valid: false, error: 'Erro ao ler arquivo de vídeo' });
            };
            video.src = URL.createObjectURL(file);
        });
    }, [acceptedFormats, maxSize, maxDuration]);
    // Handle file selection
    const handleFiles = useCallback(async (files) => {
        if (!files || files.length === 0)
            return;
        const newVideoFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = await validateVideo(file);
            if (!validation.valid) {
                showToast(validation.error || 'Erro ao validar vídeo', 'error');
                continue;
            }
            const preview = URL.createObjectURL(file);
            newVideoFiles.push({
                file,
                preview,
                progress: 0,
                status: 'pending',
            });
        }
        setVideoFiles(prev => [...prev, ...newVideoFiles]);
        // Auto upload
        newVideoFiles.forEach(videoFile => {
            uploadVideo(videoFile);
        });
    }, [validateVideo, showToast]);
    // Upload video (mock implementation)
    const uploadVideo = useCallback(async (videoFile) => {
        const index = videoFiles.findIndex(vf => vf.file === videoFile.file);
        if (index === -1)
            return;
        // Update status to uploading
        setVideoFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: 'uploading' };
            return updated;
        });
        try {
            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setVideoFiles(prev => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], progress };
                    return updated;
                });
            }
            // Simulate processing
            setVideoFiles(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], status: 'processing' };
                return updated;
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Complete
            setVideoFiles(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], status: 'complete', progress: 100 };
                return updated;
            });
            // Callback
            if (onUploadComplete) {
                const videoUrl = videoFile.preview; // In real implementation, this would be the server URL
                const thumbnailUrl = videoFile.preview;
                onUploadComplete(videoUrl, thumbnailUrl);
            }
            showToast('Vídeo enviado com sucesso!', 'success');
        }
        catch (err) {
            setVideoFiles(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    status: 'error',
                    error: 'Erro ao enviar vídeo',
                };
                return updated;
            });
            showToast('Erro ao enviar vídeo', 'error');
        }
    }, [videoFiles, onUploadComplete, showToast]);
    // Remove video
    const removeVideo = useCallback((index) => {
        setVideoFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    }, []);
    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, [handleFiles]);
    const handleFileInputChange = useCallback((e) => {
        handleFiles(e.target.files);
    }, [handleFiles]);
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Film className="w-5 h-5 text-blue-500"/>;
            case 'uploading':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin"/>;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-purple-500 animate-spin"/>;
            case 'complete':
                return <CheckCircle className="w-5 h-5 text-green-500"/>;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500"/>;
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Aguardando...';
            case 'uploading':
                return 'Enviando...';
            case 'processing':
                return 'Processando...';
            case 'complete':
                return 'Completo';
            case 'error':
                return 'Erro';
        }
    };
    return (<div className={className}>
      {/* Drop Zone */}
      <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
        <input ref={fileInputRef} type="file" accept={acceptedFormats.join(',')} onChange={handleFileInputChange} multiple className="hidden" aria-label="Selecionar arquivos de vídeo" title="Selecionar arquivos de vídeo"/>

        <FileVideo className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`}/>

        <h3 className="text-lg font-semibold mb-2">
          {isDragging ? 'Solte os arquivos aqui' : 'Enviar Vídeos'}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Arraste e solte ou clique para selecionar
        </p>

        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mb-4">
          <Upload className="w-4 h-4 mr-2"/>
          Selecionar Arquivos
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Formatos aceitos: MP4, MOV, WebM</p>
          <p>Tamanho máximo: {maxSize}MB</p>
          <p>Duração máxima: {maxDuration}s</p>
        </div>
      </div>

      {/* Upload Progress */}
      {videoFiles.length > 0 && (<div className="mt-6 space-y-3">
          <h4 className="font-semibold text-sm">Vídeos ({videoFiles.length})</h4>
          {videoFiles.map((videoFile, index) => (<Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  {/* Preview */}
                  <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    <video src={videoFile.preview} className="w-full h-full object-cover" muted/>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(videoFile.status)}
                        <span className="text-sm font-medium truncate">
                          {videoFile.file.name}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeVideo(index)} disabled={videoFile.status === 'uploading'} aria-label="Remover vídeo">
                        <X className="w-4 h-4"/>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getStatusText(videoFile.status)}</span>
                        <span>{(videoFile.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>

                      {(videoFile.status === 'uploading' || videoFile.status === 'processing') && (<Progress value={videoFile.progress} className="h-1"/>)}

                      {videoFile.status === 'error' && videoFile.error && (<p className="text-xs text-red-500">{videoFile.error}</p>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>))}
        </div>)}
    </div>);
};
export default VideoUploader;
