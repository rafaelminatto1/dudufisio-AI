'use client';

/**
 * Componente para listar arquivos da biblioteca
 */

import { useState, useEffect } from 'react';
import { FileText, Trash2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface FileItem {
  name: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
}

interface FileListProps {
  refreshTrigger?: number;
}

export function FileList({ refreshTrigger = 0 }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  
  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar arquivos');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error: any) {
      console.error('Erro ao carregar arquivos:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (fileName: string) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) {
      return;
    }
    
    setDeletingFile(fileName);
    
    try {
      const response = await fetch(`/api/files?documentName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar arquivo');
      }
      
      // Recarregar lista
      await loadFiles();
    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      alert(error.message);
    } finally {
      setDeletingFile(null);
    }
  };
  
  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Carregando arquivos...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Erro ao carregar arquivos</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={loadFiles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Nenhum arquivo na biblioteca</p>
        <p className="text-gray-500 text-sm mt-1">
          Faça upload do seu primeiro documento acima
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {files.length} {files.length === 1 ? 'Documento' : 'Documentos'}
        </h3>
        <button
          onClick={loadFiles}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Atualizar
        </button>
      </div>
      
      {/* Lista de arquivos */}
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center flex-1 min-w-0">
              <FileText className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 truncate">
                  {file.displayName || file.name}
                </p>
                {file.createTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Adicionado em {new Date(file.createTime).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleDelete(file.name)}
              disabled={deletingFile === file.name}
              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Deletar arquivo"
            >
              {deletingFile === file.name ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

