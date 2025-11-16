'use client';

/**
 * Página Unificada de Base de Conhecimento
 * Combina biblioteca de documentos + chat inteligente
 */

import { useState } from 'react';
import { KnowledgeChat } from '@/components/KnowledgeChat';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { BookOpen, Upload, MessageSquare, Menu, X } from 'lucide-react';

export default function KnowledgePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Biblioteca de Materiais */}
      <div
        className={`
          ${sidebarOpen ? 'w-96' : 'w-0'}
          transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header da Sidebar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Biblioteca</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Gerencie seus documentos
            </p>
          </div>
          
          {/* Conteúdo da Sidebar */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Upload */}
            <div>
              <div className="flex items-center mb-3">
                <Upload className="w-5 h-5 text-gray-700 mr-2" />
                <h3 className="font-semibold text-gray-800">Adicionar Documento</h3>
              </div>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
            
            {/* Lista de arquivos */}
            <div>
              <FileList refreshTrigger={refreshTrigger} />
            </div>
          </div>
          
          {/* Footer da Sidebar */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs font-semibold text-blue-600">1GB</p>
                <p className="text-xs text-gray-500">Grátis</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600">100MB</p>
                <p className="text-xs text-gray-500">Máx.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-600">Auto</p>
                <p className="text-xs text-gray-500">Index</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header do Chat */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chat Inteligente
                </h1>
                <p className="text-sm text-gray-600">
                  Converse com sua base de conhecimento
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <span className="text-xs font-medium text-blue-700">
                  ✨ Gemini 1.5 Pro
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Área do Chat */}
        <div className="flex-1 p-6">
          <KnowledgeChat />
        </div>
      </div>
    </div>
  );
}
