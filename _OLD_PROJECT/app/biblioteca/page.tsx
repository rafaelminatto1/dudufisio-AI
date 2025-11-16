'use client';

/**
 * Página de Biblioteca de Documentos
 * Interface para gerenciar a base de conhecimento
 */

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { BookOpen, Upload } from 'lucide-react';

export default function BibliotecaPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleUploadComplete = () => {
    // Atualizar lista de arquivos
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="w-10 h-10 text-blue-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Biblioteca de Conhecimento
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus documentos e materiais de referência
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> Faça upload de artigos científicos, protocolos de tratamento, 
              livros e notas para criar sua base de conhecimento personalizada. 
              A IA usará esses documentos para responder suas perguntas!
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna 1: Upload */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-gray-700 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Adicionar Documento
                </h2>
              </div>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
            
            {/* Estatísticas */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-blue-600">1GB</p>
                <p className="text-xs text-gray-600 mt-1">Storage grátis</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-green-600">100MB</p>
                <p className="text-xs text-gray-600 mt-1">Tamanho máx.</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-purple-600">Auto</p>
                <p className="text-xs text-gray-600 mt-1">Indexação</p>
              </div>
            </div>
          </div>
          
          {/* Coluna 2: Lista de arquivos */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <FileList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
        
        {/* Informações adicionais */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Como funciona?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="bg-white rounded-lg p-4 h-full">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Upload</h4>
                <p className="text-sm text-gray-600">
                  Faça upload dos seus documentos em PDF, TXT, Markdown ou Word.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg p-4 h-full">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Processamento</h4>
                <p className="text-sm text-gray-600">
                  O Google Gemini automaticamente indexa e organiza o conteúdo.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg p-4 h-full">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Consulta</h4>
                <p className="text-sm text-gray-600">
                  Use o chat para fazer perguntas e obter respostas baseadas nos documentos.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA para chat */}
        <div className="mt-8 text-center">
          <a
            href="/knowledge"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Ir para o Chat Inteligente
          </a>
        </div>
      </div>
    </div>
  );
}

