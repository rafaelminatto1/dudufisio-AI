import React, { useState } from 'react';
import { Download, FileText, FileCode, FileSpreadsheet, CheckCircle, Loader } from 'lucide-react';
import { Material } from '../../types';
import materialExportService from '../../services/materialExportService';

interface ExportPanelProps {
  material: Material;
  materials?: Material[];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ material, materials }) => {
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'markdown' | 'html'>('pdf');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  const [includeVersionHistory, setIncludeVersionHistory] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      let result;
      
      switch (exportFormat) {
        case 'pdf':
          result = await materialExportService.exportToPDF(material, {
            includeMetadata,
            includeComments,
            includeVersionHistory,
            format: 'pdf',
          });
          break;
        case 'docx':
          result = await materialExportService.exportToWord(material, {
            includeMetadata,
            includeComments,
            includeVersionHistory,
            format: 'docx',
          });
          break;
        case 'markdown':
          result = await materialExportService.exportToMarkdown(material);
          break;
        case 'html':
          result = await materialExportService.exportToHTML(material, {
            includeMetadata,
            includeComments,
            includeVersionHistory,
            format: 'html',
          });
          break;
      }

      if (result.success && result.data) {
        // Criar download
        const blob = result.data instanceof Blob ? result.data : new Blob([result.data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(result.error || 'Erro ao exportar');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar material');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async () => {
    if (!materials || materials.length === 0) return;

    setLoading(true);
    try {
      const result = await materialExportService.exportMultiple(materials, 'xlsx');
      
      if (result.success && result.data) {
        const blob = result.data instanceof Blob ? result.data : new Blob([result.data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(result.error || 'Erro ao exportar');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar materiais');
    } finally {
      setLoading(false);
    }
  };

  const formats = [
    {
      id: 'pdf',
      name: 'PDF',
      icon: FileText,
      description: 'Documento portátil, ideal para impressão e visualização',
      color: 'red',
    },
    {
      id: 'docx',
      name: 'Word',
      icon: FileText,
      description: 'Documento editável do Microsoft Word',
      color: 'blue',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      icon: FileCode,
      description: 'Formato de texto simples, ideal para desenvolvedores',
      color: 'gray',
    },
    {
      id: 'html',
      name: 'HTML',
      icon: FileCode,
      description: 'Página web standalone',
      color: 'orange',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-emerald-600" />
        Exportar Material
      </h3>

      {/* Formatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {formats.map((format) => {
          const Icon = format.icon;
          const isSelected = exportFormat === format.id;
          
          return (
            <button
              key={format.id}
              onClick={() => setExportFormat(format.id as any)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-emerald-600' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{format.name}</h4>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Opções de Exportação */}
      {(exportFormat === 'pdf' || exportFormat === 'docx' || exportFormat === 'html') && (
        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Opções de Exportação</h4>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              Incluir metadados (autor, data, categoria, tags)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeComments}
              onChange={(e) => setIncludeComments(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              Incluir comentários
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeVersionHistory}
              onChange={(e) => setIncludeVersionHistory(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              Incluir histórico de versões
            </span>
          </label>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Exportar Material
            </>
          )}
        </button>

        {materials && materials.length > 1 && (
          <button
            onClick={handleBulkExport}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5" />
                Exportar Todos ({materials.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Informação Adicional */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Para exportar múltiplos materiais em um único arquivo,
          use a opção "Exportar Todos" que gera uma planilha Excel com todos os dados.
        </p>
      </div>
    </div>
  );
};

export default ExportPanel;

