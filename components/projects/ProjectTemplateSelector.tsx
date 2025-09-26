import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Filter,
  Clock,
  DollarSign,
  Users,
  Target,
  FileText,
  Stethoscope,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Settings,
  ChevronRight,
  Star
} from 'lucide-react';

import { 
  ProjectTemplate,
  ProjectType,
  Project
} from '../../types';
import projectService from '../../services/projectService';

interface ProjectTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
  onCreateFromScratch: (type: ProjectType) => void;
}

const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateFromScratch
}) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templatesData = await projectService.getProjectTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case ProjectType.Research:
        return <FileText className="w-5 h-5 text-blue-600" />;
      case ProjectType.ClinicalCase:
        return <Stethoscope className="w-5 h-5 text-green-600" />;
      case ProjectType.Operational:
        return <Settings className="w-5 h-5 text-orange-600" />;
      case ProjectType.Innovation:
        return <Lightbulb className="w-5 h-5 text-purple-600" />;
      case ProjectType.Training:
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default:
        return <Target className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeColor = (type: ProjectType) => {
    switch (type) {
      case ProjectType.Research:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ProjectType.ClinicalCase:
        return 'bg-green-100 text-green-800 border-green-200';
      case ProjectType.Operational:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ProjectType.Innovation:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ProjectType.Training:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDuration = (days: number) => {
    if (days < 30) {
      return `${days} dias`;
    } else if (days < 365) {
      const months = Math.round(days / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.round(days / 365);
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Criar Novo Projeto</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Escolha um template ou crie do zero
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Criar do Zero</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.values(ProjectType).map((type) => (
                <button
                  key={type}
                  onClick={() => onCreateFromScratch(type)}
                  className="flex flex-col items-center p-3 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className="mb-2 group-hover:scale-110 transition-transform">
                    {getTypeIcon(type)}
                  </div>
                  <span className="text-xs font-medium text-slate-700 text-center">
                    {type === ProjectType.Research && 'Pesquisa'}
                    {type === ProjectType.ClinicalCase && 'Caso Clínico'}
                    {type === ProjectType.Operational && 'Operacional'}
                    {type === ProjectType.Innovation && 'Inovação'}
                    {type === ProjectType.Training && 'Treinamento'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ProjectType | 'all')}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  <option value={ProjectType.Research}>Pesquisa</option>
                  <option value={ProjectType.ClinicalCase}>Caso Clínico</option>
                  <option value={ProjectType.Operational}>Operacional</option>
                  <option value={ProjectType.Innovation}>Inovação</option>
                  <option value={ProjectType.Training}>Treinamento</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum template encontrado</h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Nenhum template disponível no momento.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => onSelectTemplate(template)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(template.type)}`}>
                          {template.type === ProjectType.Research && 'Pesquisa'}
                          {template.type === ProjectType.ClinicalCase && 'Caso Clínico'}
                          {template.type === ProjectType.Operational && 'Operacional'}
                          {template.type === ProjectType.Innovation && 'Inovação'}
                          {template.type === ProjectType.Training && 'Treinamento'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>

                    {/* Title and Description */}
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(template.estimatedDuration)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <Target className="w-3 h-3" />
                        <span>{template.defaultMilestones.length} marcos</span>
                      </div>
                      {template.estimatedBudget && (
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <DollarSign className="w-3 h-3" />
                          <span>{formatBudget(template.estimatedBudget)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <Users className="w-3 h-3" />
                        <span>{template.requiredResources.filter(r => r.type === 'Human').length} pessoas</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        {template.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplateSelector;