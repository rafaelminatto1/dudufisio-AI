// pages/ExerciseLibraryPage.tsx
import React, { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { Plus, Search, ChevronDown, Edit, Copy, Trash2, Filter, X } from 'lucide-react';
import { useExercises } from '../hooks/useExercises';
import PageHeader from '../components/PageHeader';
import { Exercise } from '../services/exerciseService';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseFormModal from '../components/ExerciseFormModal';
import { Skeleton } from '../components/ui/skeleton';
import GroupFormModal from '../components/GroupFormModal';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { useDebouncedValue } from '../lib/performanceOptimization';
import { H1, H2, H3, H4, Body, Small } from '../src/components/ui/Typography';

// Memoizado para evitar re-renders desnecessários
const FilterCheckbox = memo<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; }>(
  ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <label htmlFor={id} className="ml-3 text-sm text-neutral-textSecondary">
            {label}
        </label>
    </div>
  )
);
FilterCheckbox.displayName = 'FilterCheckbox';

const ExerciseLibraryPage: React.FC = () => {
  const { exercises, categories, isLoading, addExercise, updateExercise, deleteExercise, addCategory, updateCategory, copyCategory, deleteCategory, uniqueBodyParts, uniqueEquipment } = useExercises();
  
  // Debug logs to understand what's being returned
  

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [maxDifficulty, setMaxDifficulty] = useState<number>(5);

  // 🚀 Debounce do search para melhorar performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | undefined>();
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalState, setGroupModalState] = useState<{ mode: 'create' | 'edit' | 'copy', name?: string }>({ mode: 'create' });

  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (!isLoading && categories.length > 0 && openCategories.length === 0 && categories[0]) {
      setOpenCategories([categories[0]]);
    }
  }, [isLoading, categories, openCategories.length]);

  // 🚀 Callbacks memoizados para evitar re-renders
  const handleBodyPartChange = useCallback((part: string, isChecked: boolean) => {
    setSelectedBodyParts(prev => isChecked ? [...prev, part] : prev.filter(p => p !== part));
  }, []);

  const handleEquipmentChange = useCallback((equip: string, isChecked: boolean) => {
    setSelectedEquipment(prev => isChecked ? [...prev, equip] : prev.filter(e => e !== equip));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedBodyParts([]);
    setSelectedEquipment([]);
    setMaxDifficulty(5);
  }, []);

  const areFiltersActive = searchTerm || selectedBodyParts.length > 0 || selectedEquipment.length > 0 || maxDifficulty < 5;

  // 🚀 Usa debouncedSearchTerm ao invés de searchTerm direto
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const searchMatch = debouncedSearchTerm === '' ||
        ex.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        ex.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const bodyPartMatch = selectedBodyParts.length === 0 || selectedBodyParts.some(p => (ex.muscle_groups || []).includes(p));
      const equipmentMatch = selectedEquipment.length === 0 || selectedEquipment.some(e => (ex.equipment || []).includes(e));
      const difficultyMatch = (ex.difficulty_level || 'beginner') === 'beginner' || maxDifficulty >= 2; // Simplified difficulty check

      return searchMatch && bodyPartMatch && equipmentMatch && difficultyMatch;
    });
  }, [exercises, debouncedSearchTerm, selectedBodyParts, selectedEquipment, maxDifficulty]);

  const handleOpenExerciseModal = (exercise?: Exercise, category?: string) => {
    setExerciseToEdit(exercise);
    setDefaultCategory(category);
    setIsExerciseModalOpen(true);
  };
  
  const handleCloseExerciseModal = () => {
    setExerciseToEdit(undefined);
    setDefaultCategory(undefined);
    setIsExerciseModalOpen(false);
  };

  const handleSaveExercise = async (data: Omit<Exercise, 'id'> & { id?: string }) => {
    if (data.id) {
      await updateExercise(data as Exercise);
    } else {
      // Convert to CreateExerciseRequest format
      const createData = {
        name: data.name,
        description: data.description || '',
        category: data.category,
        difficulty_level: data.difficulty_level || 'beginner',
        benefits: data.benefits || [],
        precautions: (data as any).contraindications || [],
        instructions: data.instructions || [],
        video_url: data.video_url || null,
        image_urls: data.image_urls || [],
        muscle_groups: data.muscle_groups || [],
        equipment: data.equipment || []
      };
      await addExercise(createData);
    }
    handleCloseExerciseModal();
  };
  
  const handleDeleteExercise = (exercise: Exercise) => {
    if(window.confirm(`Tem certeza que deseja excluir o exercício "${exercise.name}"?`)) {
      deleteExercise(exercise.id);
    }
  };

  const handleOpenGroupModal = (mode: 'create' | 'edit' | 'copy', name?: string) => {
    setGroupModalState({ mode, ...(name && { name }) });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (newName: string) => {
    if (groupModalState.mode === 'create') await addCategory(newName);
    else if (groupModalState.mode === 'edit' && groupModalState.name) await updateCategory(groupModalState.name, newName);
    else if (groupModalState.mode === 'copy' && groupModalState.name) await copyCategory(groupModalState.name, newName);
    setIsGroupModalOpen(false);
  };
  
  const handleDeleteCategory = (name: string) => {
      if(window.confirm(`Tem certeza que deseja excluir o grupo "${name}" e todos os seus exercícios? Esta ação não pode ser desfeita.`)) {
          deleteCategory(name);
      }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
        <Skeleton className="lg:col-span-1 h-96 rounded-cardLarge" />
        <div className="lg:col-span-3 space-y-md">
             {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-md rounded-cardLarge shadow-card">
                    <Skeleton className="h-8 w-1/3 mb-md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                        <Skeleton className="h-48 w-full rounded-card" />
                        <Skeleton className="h-48 w-full rounded-card" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Biblioteca de Exercícios"
        subtitle="Gerencie os exercícios utilizados nas prescrições da clínica."
      >
        <button onClick={() => handleOpenGroupModal('create')} className="inline-flex items-center justify-center rounded-lg border border-neutral-border bg-white px-md py-sm text-sm font-medium text-neutral-text shadow-card hover:bg-neutral-bgAlt mr-3">
            <Plus className="-ml-xs mr-sm h-5 w-5" />
            Novo Grupo
        </button>
        <button onClick={() => handleOpenExerciseModal()} className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-md py-sm text-sm font-medium text-white shadow-card hover:bg-teal-600">
          <Plus className="-ml-xs mr-sm h-5 w-5" />
          Novo Exercício
        </button>
      </PageHeader>
      
      <ExerciseFormModal isOpen={isExerciseModalOpen} onClose={handleCloseExerciseModal} onSave={handleSaveExercise} exerciseToEdit={exerciseToEdit as any} defaultCategory={defaultCategory} allCategories={categories} />
      <GroupFormModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onSave={handleSaveGroup} mode={groupModalState.mode} initialName={groupModalState.name} />
      <VideoPlayerModal 
        isOpen={!!playingVideo} 
        onClose={() => setPlayingVideo(null)} 
        videoUrl={playingVideo?.url} 
        title={playingVideo?.title} 
      />

      {isLoading ? renderSkeleton() : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
          <aside className="lg:col-span-1 space-y-xl">
            <div className="bg-white p-md rounded-cardLarge shadow-card">
                <h3 className="font-bold text-neutral-text mb-md flex items-center justify-between">
                    <span className="flex items-center"><Filter className="w-5 h-5 mr-sm" />Filtros</span>
                     {areFiltersActive && (
                        <button onClick={resetFilters} className="text-xs font-semibold text-teal-600 hover:underline flex items-center">
                            <X className="w-3 h-3 mr-xs"/> Limpar
                        </button>
                    )}
                </h3>

                <div className="space-y-xl">
                     <div>
                        <label className="text-sm font-semibold text-neutral-text">Busca por nome</label>
                        <div className="relative mt-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
                            <input type="text" placeholder="Ex: Agachamento" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-neutral-text">Nível de Dificuldade (máx. {maxDifficulty})</label>
                        <input type="range" min="1" max="5" value={maxDifficulty} onChange={(e) => setMaxDifficulty(Number(e.target.value))} className="w-full mt-sm"/>
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-neutral-text mb-sm">Parte do Corpo</h4>
                        <div className="space-y-sm max-h-40 overflow-y-auto pr-2">
                           {Array.isArray(uniqueBodyParts) ? uniqueBodyParts.map(part => <FilterCheckbox key={part} id={`part-${part}`} label={part} checked={selectedBodyParts.includes(part)} onChange={(c) => handleBodyPartChange(part, c)} />) : <div className="text-sm text-gray-500">Carregando...</div>}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-neutral-text mb-sm">Equipamento</h4>
                        <div className="space-y-sm max-h-40 overflow-y-auto pr-2">
                            {Array.isArray(uniqueEquipment) ? uniqueEquipment.map(equip => <FilterCheckbox key={equip} id={`equip-${equip}`} label={equip} checked={selectedEquipment.includes(equip)} onChange={(c) => handleEquipmentChange(equip, c)} />) : <div className="text-sm text-gray-500">Carregando...</div>}
                        </div>
                    </div>
                </div>
            </div>
          </aside>
          
          <main className="lg:col-span-3 space-y-md">
            {categories.map(category => {
              const categoryExercises = filteredExercises.filter(ex => ex.category === category);
              if (categoryExercises.length === 0) return null;
              const isOpen = openCategories.includes(category);
              
              return (
                <div key={category} className="bg-white rounded-cardLarge shadow-card transition-shadow hover:shadow-cardHover">
                  <div className="group flex items-center p-md cursor-pointer" onClick={() => toggleCategory(category)}>
                    <h3 className="text-xl font-bold text-neutral-text flex-1">{category} <span className="text-base font-normal text-neutral-textSecondary">({categoryExercises.length})</span></h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleOpenExerciseModal(undefined, category)} className="p-sm rounded-full hover:bg-neutral-bgDark text-neutral-textSecondary" title="Adicionar Exercício"><Plus size={18}/></button>
                      <button onClick={() => handleOpenGroupModal('edit', category)} className="p-sm rounded-full hover:bg-neutral-bgDark text-neutral-textSecondary" title="Renomear Grupo"><Edit size={16}/></button>
                      <button onClick={() => handleOpenGroupModal('copy', category)} className="p-sm rounded-full hover:bg-neutral-bgDark text-neutral-textSecondary" title="Copiar Grupo"><Copy size={16}/></button>
                      <button onClick={() => handleDeleteCategory(category)} className="p-sm rounded-full hover:bg-error-light text-error" title="Excluir Grupo"><Trash2 size={16}/></button>
                    </div>
                    <ChevronDown className={`ml-sm w-6 h-6 text-neutral-textTertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="p-md border-t border-neutral-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
                        {categoryExercises.map(ex => (
                          <ExerciseCard 
                            key={ex.id} 
                            exercise={ex as any} 
                            onEdit={() => handleOpenExerciseModal(ex)} 
                            onDelete={() => handleDeleteExercise(ex)} 
                            onPlay={() => ex.video_url && setPlayingVideo({ url: ex.video_url, title: ex.name })}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
             {filteredExercises.length === 0 && (
                <div className="text-center p-10 bg-white rounded-cardLarge shadow-card">
                    <h3 className="text-lg font-semibold text-neutral-text">Nenhum exercício encontrado</h3>
                    <p className="text-neutral-textSecondary mt-xs">Tente ajustar seus filtros para encontrar o que procura.</p>
                </div>
            )}
          </main>
        </div>
      )}
    </>
  );
};

export default ExerciseLibraryPage;