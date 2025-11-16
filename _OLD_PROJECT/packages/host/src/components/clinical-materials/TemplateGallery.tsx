import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Eye, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { MaterialTemplate } from '../../types';
import materialTemplateService from '../../services/materialTemplateService';

interface TemplateGalleryProps {
  onSelectTemplate: (template: MaterialTemplate) => void;
  onClose: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState<MaterialTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await materialTemplateService.listTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    // Filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Filtro de categoria
    if (selectedCategory !== 'all') {
      const category = typeof template.category === 'string' 
        ? template.category 
        : template.category.name;
      if (category !== selectedCategory) return false;
    }

    // Filtro de público
    if (showOnlyPublic && !template.isPublic) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') {
      return b.usageCount - a.usageCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const categories = Array.from(new Set(
    templates.map(t => typeof t.category === 'string' ? t.category : t.category.name)
  ));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              Galeria de Templates
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Categoria */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Recentes
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                  sortBy === 'popular'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Populares
              </button>
            </div>
          </div>

          {/* Checkbox Público */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="showPublic"
              checked={showOnlyPublic}
              onChange={(e) => setShowOnlyPublic(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="showPublic" className="text-sm text-gray-700">
              Mostrar apenas templates públicos
            </label>
          </div>
        </div>

        {/* Lista de Templates */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum template encontrado</p>
              <p className="text-sm mt-2">Tente ajustar os filtros ou criar um novo template</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer com estatísticas */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredTemplates.length} templates encontrados</span>
            <span className="flex items-center gap-4">
              <span>{templates.filter(t => t.isSystemTemplate).length} templates do sistema</span>
              <span>{templates.filter(t => t.isPublic).length} templates públicos</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: MaterialTemplate;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const category = typeof template.category === 'string' 
    ? template.category 
    : template.category.name;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-emerald-500 hover:shadow-lg transition-all group">
      {/* Thumbnail */}
      {template.thumbnail && (
        <div className="h-40 overflow-hidden bg-gray-100">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
            {template.name}
          </h3>
          {template.isSystemTemplate && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              Sistema
            </span>
          )}
        </div>

        {template.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadados */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {template.usageCount} usos
          </span>
          <span>{category}</span>
        </div>

        {/* Ações */}
        <button
          onClick={onSelect}
          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Usar Template
        </button>
      </div>
    </div>
  );
};

export default TemplateGallery;

