/**
 * Material Card Component
 * MoocaFisio - Sistema de Gestão de Clínicas de Fisioterapia
 * 
 * Card visual para exibir materiais clínicos na biblioteca
 */

import React from 'react';
import { Download, Star } from 'lucide-react';
import { Button } from '../ui/button';
import type { ClinicalMaterial } from './types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from './types';

interface MaterialCardProps {
  material: ClinicalMaterial;
  onDownload: (material: ClinicalMaterial) => void;
  onToggleFavorite: (materialId: string) => void;
}

export function MaterialCard({ 
  material, 
  onDownload, 
  onToggleFavorite 
}: MaterialCardProps) {
  const categoryLabel = CATEGORY_LABELS[material.category];
  const categoryIcon = CATEGORY_ICONS[material.category];

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-emerald-500 transition-all overflow-hidden group hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        {material.thumbnail_url ? (
          <img
            src={material.thumbnail_url}
            alt={material.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-6xl">{categoryIcon}</div>
        )}
        
        {/* Botão de Favorito */}
        <button
          onClick={() => onToggleFavorite(material.id)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          aria-label={material.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Star
            className={`w-5 h-5 ${
              material.is_favorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        </button>

        {/* Badge de Categoria */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">
            {categoryLabel}
          </span>
        </div>

        {/* Badge Editável */}
        {material.is_fillable && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-emerald-500 text-white rounded text-xs font-medium">
              Editável
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {material.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {material.description}
        </p>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {material.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
            {material.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{material.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Download className="w-4 h-4" />
            <span>{material.download_count || 0} downloads</span>
          </div>

          <Button
            size="sm"
            onClick={() => onDownload(material)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="w-4 h-4" />
            Baixar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MaterialCard;

