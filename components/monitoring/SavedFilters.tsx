import React, { useState, useEffect } from 'react';
import { Save, Star, Trash2, Plus, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { MonitoringFilters } from '../../types';
import * as cacheManager from '../../lib/cacheManager';

interface SavedFilter {
  id: string;
  name: string;
  filters: MonitoringFilters;
  createdAt: string;
  isFavorite: boolean;
}

interface SavedFiltersProps {
  currentFilters: MonitoringFilters;
  onLoadFilter: (filters: MonitoringFilters) => void;
}

const STORAGE_KEY = 'saved_filters';

export const SavedFilters: React.FC<SavedFiltersProps> = ({
  currentFilters,
  onLoadFilter,
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Carregar filtros salvos ao montar
  useEffect(() => {
    const cached = cacheManager.getCache<SavedFilter[]>(STORAGE_KEY, {
      storage: 'local',
      ttl: 1000 * 60 * 60 * 24 * 365, // 1 ano
    });
    if (cached) {
      setSavedFilters(cached);
    }
  }, []);

  // Salvar no cache quando mudar
  useEffect(() => {
    if (savedFilters.length > 0) {
      cacheManager.setCache(STORAGE_KEY, savedFilters, {
        storage: 'local',
        ttl: 1000 * 60 * 60 * 24 * 365, // 1 ano
      });
    }
  }, [savedFilters]);

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName.trim(),
      filters: currentFilters,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setFilterName('');
    setIsSaving(false);
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    onLoadFilter(filter.filters);
    setIsOpen(false);
  };

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleToggleFavorite = (filterId: string) => {
    setSavedFilters(prev =>
      prev.map(f =>
        f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f
      )
    );
  };

  const hasActiveFilters = Object.values(currentFilters).some(
    v => v !== 'all' && v !== ''
  );

  // Filtros favoritos primeiro
  const sortedFilters = [...savedFilters].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Star className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros Salvos</span>
          {savedFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {savedFilters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Filtros Salvos</h4>
            <p className="text-xs text-slate-500">
              Salve suas configurações favoritas de filtros
            </p>
          </div>

          {/* Salvar filtro atual */}
          {hasActiveFilters && (
            <div className="space-y-2 pb-3 border-b">
              {!isSaving ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaving(true)}
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Filtros Atuais
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="filter-name" className="text-xs">
                    Nome do filtro
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="filter-name"
                      placeholder="Ex: Pacientes Críticos"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveFilter();
                        if (e.key === 'Escape') setIsSaving(false);
                      }}
                      className="text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveFilter}
                      disabled={!filterName.trim()}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lista de filtros salvos */}
          <ScrollArea className="h-64">
            {sortedFilters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Save className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm text-slate-600">Nenhum filtro salvo</p>
                <p className="text-xs text-slate-500 mt-1">
                  Configure filtros e salve para reutilizar
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => handleLoadFilter(filter)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {filter.isFavorite && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          )}
                          <p className="font-medium text-sm text-slate-900">
                            {filter.name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">
                          Criado em {new Date(filter.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {/* Preview dos filtros */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {filter.filters.status !== 'all' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Status: {filter.filters.status}
                            </Badge>
                          )}
                          {filter.filters.riskLevel !== 'all' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Risco: {filter.filters.riskLevel}
                            </Badge>
                          )}
                          {filter.filters.attendanceRange !== 'all' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Presença: {filter.filters.attendanceRange}
                            </Badge>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(filter.id);
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Star
                            className={`w-3 h-3 ${
                              filter.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFilter(filter.id);
                          }}
                          className="h-7 w-7 p-0 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};


