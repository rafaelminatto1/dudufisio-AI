/**
 * Componente: Lista de Condutas
 * Exibe condutas agrupadas por categoria com opções de edição e remoção
 */

import React from 'react';
import { X, Clock, Box, MapPin, AlertCircle } from 'lucide-react';
import { Conduct, ConductCategory, getCategoryMetadata } from '../../types/conducts';
import { Badge } from '../ui/badge';

interface ConductListProps {
  conducts: Conduct[];
  onRemove: (id: string) => void;
  onEdit?: (conduct: Conduct) => void;
}

export function ConductList({ conducts, onRemove, onEdit }: ConductListProps) {
  if (conducts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Nenhuma conduta adicionada ainda</p>
        <p className="text-sm text-gray-500 mt-2">
          Use o formulário acima para adicionar condutas realizadas na sessão.
        </p>
      </div>
    );
  }

  // Agrupar por categoria
  const groupedConducts = conducts.reduce((acc, conduct) => {
    if (!acc[conduct.category]) {
      acc[conduct.category] = [];
    }
    acc[conduct.category].push(conduct);
    return acc;
  }, {} as Record<ConductCategory, Conduct[]>);

  // Ordenar categorias para exibição consistente
  const categoryOrder: ConductCategory[] = [
    'manual_therapy',
    'electrotherapy',
    'therapeutic_exercise',
    'stretching',
    'strengthening',
    'mobilization',
    'other',
  ];

  const sortedCategories = categoryOrder.filter(cat => groupedConducts[cat]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com resumo */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div>
          <h3 className="font-semibold text-blue-900">
            Total de Condutas: {conducts.length}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {sortedCategories.length} categoria{sortedCategories.length !== 1 ? 's' : ''} utilizada{sortedCategories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {sortedCategories.map(category => {
            const metadata = getCategoryMetadata(category);
            const count = groupedConducts[category].length;
            return (
              <Badge key={category} variant="secondary" className="text-xs">
                {metadata.emoji} {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Condutas agrupadas por categoria */}
      {sortedCategories.map((category) => {
        const metadata = getCategoryMetadata(category);
        const categoryConducts = groupedConducts[category];

        return (
          <div key={category} className="space-y-3">
            {/* Título da Categoria */}
            <div className="flex items-center gap-3">
              <div
                className={`w-1 h-8 rounded-full bg-${metadata.color}-500`}
                style={{ backgroundColor: `var(--${metadata.color}-500)` }}
              />
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{metadata.emoji}</span>
                {metadata.label}
                <Badge variant="outline" className="ml-2">
                  {categoryConducts.length}
                </Badge>
              </h3>
            </div>

            {/* Lista de Condutas da Categoria */}
            <div className="space-y-2 pl-6">
              {categoryConducts.map((conduct) => (
                <div
                  key={conduct.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Nome da Conduta */}
                      <p className="font-medium text-gray-900 mb-2">
                        {conduct.name}
                      </p>

                      {/* Detalhes em linha */}
                      {(conduct.details || conduct.duration || conduct.equipment) && (
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                          {conduct.details && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span>{conduct.details}</span>
                            </span>
                          )}
                          {conduct.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{conduct.duration}</span>
                            </span>
                          )}
                          {conduct.equipment && (
                            <span className="flex items-center gap-1.5">
                              <Box className="w-3.5 h-3.5 text-gray-400" />
                              <span>{conduct.equipment}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Observações */}
                      {conduct.notes && (
                        <div className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 mt-2">
                          <span className="font-medium not-italic text-gray-600">Obs:</span> {conduct.notes}
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(conduct)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Editar conduta"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemove(conduct.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Remover conduta"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

