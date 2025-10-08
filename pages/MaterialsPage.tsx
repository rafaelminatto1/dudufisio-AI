import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, FileText, ClipboardList } from 'lucide-react';
import { getMaterialCategories } from '../services/clinicalMaterialService';
import { MaterialCategory } from '../types';
import PageHeader from '../components/PageHeader';
import { Skeleton } from '../components/ui/skeleton';

const MaterialsPage: React.FC = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      try {
        const materialCategories = await getMaterialCategories();
        setCategories(materialCategories);
      } catch (error) {
        console.error('Erro ao carregar materiais:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const filteredMaterials = categories
    .filter(category => selectedCategory === 'all' || category.id === selectedCategory)
    .flatMap(category => 
      category.materials
        .filter(material => 
          material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(material => ({ ...material, category }))
    );

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'Escala de Avaliação':
        return <ClipboardList className="w-5 h-5 text-blue-500" />;
      case 'Protocolo Clínico':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-purple-500" />;
    }
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'Escala de Avaliação':
        return 'bg-blue-100 text-blue-800';
      case 'Protocolo Clínico':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Materiais Clínicos"
          subtitle="Biblioteca de materiais e protocolos clínicos"
        />
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-8 w-1/3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Materiais Clínicos"
        subtitle="Biblioteca de materiais e protocolos clínicos"
      />

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white"
                aria-label="Filtrar por categoria"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total de Materiais</p>
              <p className="text-2xl font-bold text-slate-900">
                {categories.reduce((total, cat) => total + cat.materials.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Protocolos</p>
              <p className="text-2xl font-bold text-slate-900">
                {categories.reduce((total, cat) => 
                  total + cat.materials.filter(m => m.type === 'Protocolo Clínico').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Escalas</p>
              <p className="text-2xl font-bold text-slate-900">
                {categories.reduce((total, cat) => 
                  total + cat.materials.filter(m => m.type === 'Escala de Avaliação').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Link
            key={material.id}
            to={`/material-detail/${material.id}`}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getMaterialIcon(material.type)}
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getMaterialTypeColor(material.type)}`}>
                  {material.type}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {material.category.name}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
              {material.name}
            </h3>
            
            <p className="text-sm text-slate-600 mb-4 line-clamp-3">
              {material.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Atualizado em {new Date(material.updatedAt).toLocaleDateString('pt-BR')}
              </div>
              <div className="text-sky-600 text-sm font-medium group-hover:text-sky-700">
                Ver detalhes →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredMaterials.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Nenhum material encontrado
          </h3>
          <p className="text-slate-600">
            Tente ajustar os filtros ou termo de busca.
          </p>
        </div>
      )}
    </>
  );
};

export default MaterialsPage;
