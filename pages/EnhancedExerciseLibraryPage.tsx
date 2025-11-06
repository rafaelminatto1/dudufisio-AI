// pages/EnhancedExerciseLibraryPage.tsx
import React, { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { Plus, Search, ChevronDown, Edit, Copy, Trash2, Filter, X, Link, BookOpen, Activity, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Exercise } from '../types';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseFormModal from '../components/ExerciseFormModal';
import { Skeleton } from '../components/ui/skeleton';
import GroupFormModal from '../components/GroupFormModal';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { useDebouncedValue } from '../lib/performanceOptimization';
import { integratedExerciseService } from '../services/integratedExerciseService';

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

const EnhancedExerciseLibraryPage: React.FC = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [maxDifficulty, setMaxDifficulty] = useState<number>(5);
  const [showOnlyWithProtocols, setShowOnlyWithProtocols] = useState(false);

  // Estados para modais
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | undefined>();
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalState, setGroupModalState] = useState<{ mode: 'create' | 'edit' | 'copy', name?: string }>({ mode: 'create' });

  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  // Estados dos dados
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // 🚀 Debounce do search para melhorar performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await integratedExerciseService.refresh();
      
      const allExercises = integratedExerciseService.getAllExercises();
      const allCategories = integratedExerciseService.getCategories();
      const allBodyParts = integratedExerciseService.getBodyParts();
      const allEquipment = integratedExerciseService.getEquipment();
      const stats = integratedExerciseService.getStatistics();

      
      
      console.log('🔍 DEBUG - Exercícios por categoria:', allCategories.map(cat => ({
        categoria: cat,
        quantidade: allExercises.filter(ex => ex.category === cat).length
      })));

      setExercises(allExercises);
      setCategories(allCategories);
      setBodyParts(allBodyParts);
      setEquipment(allEquipment);
      setStatistics(stats);

      // Abrir primeira categoria por padrão
      if (allCategories.length > 0 && openCategories.length === 0) {
        setOpenCategories([allCategories[0]]);
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedSpecialty('');
    setMaxDifficulty(5);
    setShowOnlyWithProtocols(false);
  }, []);

  const areFiltersActive = searchTerm || selectedBodyParts.length > 0 || selectedEquipment.length > 0 || 
                          selectedSpecialty || maxDifficulty < 5 || showOnlyWithProtocols;

  // 🚀 Usa debouncedSearchTerm ao invés de searchTerm direto
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Filtro por texto
    if (debouncedSearchTerm) {
      const searchQuery = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery) ||
        ex.description.toLowerCase().includes(searchQuery) ||
        ex.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    // Filtros por categoria, partes do corpo, equipamento
    if (selectedBodyParts.length > 0) {
      filtered = filtered.filter(ex => selectedBodyParts.some(p => ex.bodyParts.includes(p)));
    }

    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(ex => selectedEquipment.some(e => ex.equipment.includes(e)));
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(ex => (ex as any).specialty === selectedSpecialty);
    }

    if (maxDifficulty < 5) {
      filtered = filtered.filter(ex => ex.difficulty <= maxDifficulty);
    }

    if (showOnlyWithProtocols) {
      filtered = filtered.filter(ex => (ex as any).linkedProtocols && (ex as any).linkedProtocols.length > 0);
    }

    return filtered;
  }, [exercises, debouncedSearchTerm, selectedBodyParts, selectedEquipment, selectedSpecialty, maxDifficulty, showOnlyWithProtocols]);

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
    // Implementar salvamento
    
    handleCloseExerciseModal();
    // Recarregar dados após salvar
    await loadData();
  };
  
  const handleDeleteExercise = (exercise: Exercise) => {
    if(window.confirm(`Tem certeza que deseja excluir o exercício "${exercise.name}"?`)) {
      
      // Implementar exclusão
      loadData();
    }
  };

  const handleOpenGroupModal = (mode: 'create' | 'edit' | 'copy', name?: string) => {
    setGroupModalState({ mode, ...(name && { name }) });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (newName: string) => {
    
    setIsGroupModalOpen(false);
  };
  
  const handleDeleteCategory = (name: string) => {
    if(window.confirm(`Tem certeza que deseja excluir o grupo "${name}" e todos os seus exercícios? Esta ação não pode ser desfeita.`)) {
      
      loadData();
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
        title="Biblioteca de Exercícios Integrada"
        subtitle="Exercícios do sistema + conteúdo clínico especializado com vinculação a protocolos."
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
      
      {/* Estatísticas */}
      <div className="mb-mdxl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <div className="bg-white p-lg rounded-cardLarge shadow-card border border-neutral-border">
          <div className="flex items-center">
            <div className="p-sm bg-primary-light rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Total de Exercícios</p>
              <p className="text-2xl font-bold text-neutral-text">{statistics.totalExercises || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-lg rounded-cardLarge shadow-card border border-neutral-border">
          <div className="flex items-center">
            <div className="p-sm bg-success-light rounded-lg">
              <BookOpen className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Com Protocolos</p>
              <p className="text-2xl font-bold text-neutral-text">{statistics.exercisesWithProtocols || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-lg rounded-cardLarge shadow-card border border-neutral-border">
          <div className="flex items-center">
            <div className="p-sm bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Especialidades</p>
              <p className="text-2xl font-bold text-neutral-text">{Object.keys(statistics.specialties || {}).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-lg rounded-cardLarge shadow-card border border-neutral-border">
          <div className="flex items-center">
            <div className="p-sm bg-warning-light rounded-lg">
              <Link className="w-6 h-6 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Categorias</p>
              <p className="text-2xl font-bold text-neutral-text">{statistics.totalCategories || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      <ExerciseFormModal isOpen={isExerciseModalOpen} onClose={handleCloseExerciseModal} onSave={handleSaveExercise} exerciseToEdit={exerciseToEdit as any} defaultCategory={defaultCategory} allCategories={categories} />
      <GroupFormModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onSave={handleSaveGroup} mode={groupModalState.mode} initialName={groupModalState.name} />
      <VideoPlayerModal 
        isOpen={!!playingVideo} 
        onClose={() => setPlayingVideo(null)} 
        videoUrl={playingVideo?.url} 
        title={playingVideo?.title} 
      />

      {loading ? renderSkeleton() : (
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
                        <label htmlFor="specialty-select" className="text-sm font-semibold text-neutral-text">Especialidade</label>
                        <select 
                            id="specialty-select"
                            value={selectedSpecialty} 
                            onChange={(e) => setSelectedSpecialty(e.target.value)} 
                            className="w-full mt-xs p-sm border border-neutral-border rounded-lg"
                            title="Filtrar exercícios por especialidade clínica"
                        >
                            <option value="">Todas as especialidades</option>
                            <option value="esportiva">Fisioterapia Esportiva</option>
                            <option value="pos-operatoria">Fisioterapia Pós-Operatória</option>
                            <option value="geriatrica">Fisioterapia Gerontológica</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="difficulty-range" className="text-sm font-semibold text-neutral-text">Nível de Dificuldade (máx. {maxDifficulty})</label>
                        <input 
                            id="difficulty-range"
                            type="range" 
                            min="1" 
                            max="5" 
                            value={maxDifficulty} 
                            onChange={(e) => setMaxDifficulty(Number(e.target.value))} 
                            className="w-full mt-sm"
                            title={`Filtrar exercícios até nível de dificuldade ${maxDifficulty}`}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="showProtocols"
                            type="checkbox"
                            checked={showOnlyWithProtocols}
                            onChange={(e) => setShowOnlyWithProtocols(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label htmlFor="showProtocols" className="ml-3 text-sm text-neutral-textSecondary">
                            Apenas exercícios com protocolos
                        </label>
                    </div>
                     
                     <div>
                        <h4 className="text-sm font-semibold text-neutral-text mb-sm">Parte do Corpo</h4>
                        <div className="space-y-sm max-h-40 overflow-y-auto pr-2">
                           {bodyParts.map(part => <FilterCheckbox key={part} id={`part-${part}`} label={part} checked={selectedBodyParts.includes(part)} onChange={(c) => handleBodyPartChange(part, c)} />)}
                        </div>
                    </div>
                     
                     <div>
                        <h4 className="text-sm font-semibold text-neutral-text mb-sm">Equipamento</h4>
                        <div className="space-y-sm max-h-40 overflow-y-auto pr-2">
                            {equipment.map(equip => <FilterCheckbox key={equip} id={`equip-${equip}`} label={equip} checked={selectedEquipment.includes(equip)} onChange={(c) => handleEquipmentChange(equip, c)} />)}
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
                    <h3 className="text-xl font-bold text-neutral-text flex-1">
                      {category} 
                      <span className="text-base font-normal text-neutral-textSecondary">({categoryExercises.length})</span>
                      {categoryExercises.some(ex => (ex as any).linkedProtocols?.length > 0) && (
                        <span className="ml-sm inline-flex items-center px-sm py-1 rounded-full text-xs font-medium bg-success-light text-success">
                          <Link className="w-3 h-3 mr-xs" />
                          Protocolos
                        </span>
                      )}
                    </h3>
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
                          <div key={ex.id} className="relative">
                            <ExerciseCard 
                              exercise={ex as any} 
                              onEdit={() => handleOpenExerciseModal(ex)} 
                              onDelete={() => handleDeleteExercise(ex)} 
                              onPlay={() => ex.media?.videoUrl && setPlayingVideo({ url: ex.media.videoUrl, title: ex.name })}
                            />
                            {(ex as any).linkedProtocols?.length > 0 && (
                              <div className="absolute top-sm right-2">
                                <span className="inline-flex items-center px-sm py-1 rounded-full text-xs font-medium bg-success-light text-success">
                                  <Link className="w-3 h-3 mr-xs" />
                                  {(ex as any).linkedProtocols.length}
                                </span>
                              </div>
                            )}
                          </div>
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

export default EnhancedExerciseLibraryPage;
