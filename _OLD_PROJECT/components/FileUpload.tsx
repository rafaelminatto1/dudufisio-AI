'use client';

/**
 * Componente de upload de arquivos com drag-and-drop
 */

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'indexing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };
  
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setStatusMessage('Fazendo upload...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('displayName', file.name);
      
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload');
      }
      
      setUploadProgress(100);
      setUploadStatus('success');
      setStatusMessage('Arquivo indexado com sucesso!');
      
      // Reset após 2 segundos
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus('idle');
        setUploadProgress(0);
        setStatusMessage('');
        
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notificar parent
        onUploadComplete?.();
      }, 2000);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadStatus('error');
      setStatusMessage(error.message || 'Erro ao fazer upload');
      setIsUploading(false);
      
      // Reset após 3 segundos
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };
  
  return (
    <div className="w-full">
      {/* Área de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        {/* Ícone */}
        <div className="flex justify-center mb-4">
          {uploadStatus === 'idle' && (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          {uploadStatus === 'uploading' && (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          )}
          {uploadStatus === 'indexing' && (
            <FileText className="w-12 h-12 text-blue-500 animate-pulse" />
          )}
          {uploadStatus === 'success' && (
            <CheckCircle className="w-12 h-12 text-green-500" />
          )}
          {uploadStatus === 'error' && (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </div>
        
        {/* Texto */}
        <div>
          {uploadStatus === 'idle' && (
            <>
              <p className="text-lg font-medium text-gray-700 mb-1">
                Arraste um arquivo ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                PDF, TXT, MD, DOC, DOCX (máx. 100MB)
              </p>
            </>
          )}
          
          {(uploadStatus === 'uploading' || uploadStatus === 'indexing') && (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {statusMessage}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {uploadProgress}%
              </p>
            </>
          )}
          
          {uploadStatus === 'success' && (
            <p className="text-lg font-medium text-green-600">
              {statusMessage}
            </p>
          )}
          
          {uploadStatus === 'error' && (
            <p className="text-lg font-medium text-red-600">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
      
      {/* Informações */}
      {uploadStatus === 'idle' && (
        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-1">
            <strong>Tipos aceitos:</strong> PDF, TXT, Markdown, Word
          </p>
          <p>
            <strong>Tamanho máximo:</strong> 100 MB por arquivo
          </p>
        </div>
      )}
    </div>
  );
}

