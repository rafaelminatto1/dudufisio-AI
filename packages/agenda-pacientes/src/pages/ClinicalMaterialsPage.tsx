/**
 * Clinical Materials Library Page
 * MoocaFisio - Sistema de Gestão de Clínicas de Fisioterapia
 * 
 * Página da biblioteca de materiais clínicos (fichas, escalas, formulários)
 */

import React, { useState, useEffect } from 'react';
import { Search, FileText, Star } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { MaterialCard } from '../components/clinical-materials/MaterialCard';
import { clinicalMaterialsService } from '../components/clinical-materials/clinicalMaterialsService';
import type { 
  ClinicalMaterial, 
  MaterialCategory, 
  Specialty 
} from '../components/clinical-materials/types';
import { 
  CATEGORY_LABELS, 
  CATEGORY_ICONS, 
  SPECIALTY_LABELS 
} from '../components/clinical-materials/types';
import { toast } from 'sonner';

export function ClinicalMaterialsPage() {
  const [materials, setMaterials] = useState<ClinicalMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Carregar materiais quando filtros mudarem
  useEffect(() => {
    loadMaterials();
  }, [selectedCategory, selectedSpecialty, searchTerm, showFavoritesOnly]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await clinicalMaterialsService.getAll({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        search: searchTerm || undefined,
        favorites_only: showFavoritesOnly,
      });
      setMaterials(data);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast.error('Não foi possível carregar os materiais');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material: ClinicalMaterial) => {
    try {
      await clinicalMaterialsService.download(material.id);
      toast.success(`Download iniciado: ${material.name}`);
      
      // Recarregar para atualizar contador
      loadMaterials();
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Não foi possível fazer o download');
    }
  };

  const handleToggleFavorite = async (materialId: string) => {
    try {
      const isFavorite = await clinicalMaterialsService.toggleFavorite(materialId);
      
      if (isFavorite) {
        toast.success('Adicionado aos favoritos');
      } else {
        toast.success('Removido dos favoritos');
      }
      
      // Recarregar materiais para atualizar UI
      loadMaterials();
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      toast.error('Não foi possível atualizar favorito');
    }
  };

  const categories = [
    { value: 'all' as const, label: 'Todos', icon: '📚' },
    { value: 'assessment_forms' as const, label: CATEGORY_LABELS.assessment_forms, icon: CATEGORY_ICONS.assessment_forms },
    { value: 'validated_scales' as const, label: CATEGORY_LABELS.validated_scales, icon: CATEGORY_ICONS.validated_scales },
    { value: 'anamnesis' as const, label: CATEGORY_LABELS.anamnesis, icon: CATEGORY_ICONS.anamnesis },
    { value: 'pain_maps' as const, label: CATEGORY_LABELS.pain_maps, icon: CATEGORY_ICONS.pain_maps },
    { value: 'follow_up' as const, label: CATEGORY_LABELS.follow_up, icon: CATEGORY_ICONS.follow_up },
    { value: 'treatment_plan' as const, label: CATEGORY_LABELS.treatment_plan, icon: CATEGORY_ICONS.treatment_plan },
    { value: 'patient_education' as const, label: CATEGORY_LABELS.patient_education, icon: CATEGORY_ICONS.patient_education },
  ];

  const specialties = [
    { value: 'all' as const, label: 'Todas as Especialidades' },
    ...Object.entries(SPECIALTY_LABELS).map(([value, label]) => ({
      value: value as Specialty,
      label,
    })),
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Biblioteca de Materiais Clínicos
        </h1>
        <p className="text-gray-600">
          Fichas, escalas e formulários prontos para uso com seus pacientes
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* Busca */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtro de Categoria */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Especialidade e Favoritos */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="specialty">
              Especialidade
            </label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value as Specialty | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {specialties.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="favorites"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star className="w-4 h-4" />
                Apenas Favoritos
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )}

      {/* Grid de Materiais */}
      {!loading && materials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onDownload={handleDownload}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!loading && materials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum material encontrado</p>
          <p className="text-gray-400 text-sm mt-2">
            Tente ajustar os filtros ou a busca
          </p>
          {(selectedCategory !== 'all' || selectedSpecialty !== 'all' || searchTerm || showFavoritesOnly) && (
            <Button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSpecialty('all');
                setSearchTerm('');
                setShowFavoritesOnly(false);
              }}
              variant="outline"
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ClinicalMaterialsPage;

