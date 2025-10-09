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
        <label htmlFor={id} className="ml-3 text-sm text-slate-600">
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
    console.log('Salvando exercício:', data);
    handleCloseExerciseModal();
    // Recarregar dados após salvar
    await loadData();
  };
  
  const handleDeleteExercise = (exercise: Exercise) => {
    if(window.confirm(`Tem certeza que deseja excluir o exercício "${exercise.name}"?`)) {
      console.log('Excluindo exercício:', exercise.id);
      // Implementar exclusão
      loadData();
    }
  };

  const handleOpenGroupModal = (mode: 'create' | 'edit' | 'copy', name?: string) => {
    setGroupModalState({ mode, ...(name && { name }) });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (newName: string) => {
    console.log('Salvando grupo:', newName);
    setIsGroupModalOpen(false);
  };
  
  const handleDeleteCategory = (name: string) => {
    if(window.confirm(`Tem certeza que deseja excluir o grupo "${name}" e todos os seus exercícios? Esta ação não pode ser desfeita.`)) {
      console.log('Excluindo categoria:', name);
      loadData();
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Skeleton className="lg:col-span-1 h-96 rounded-2xl" />
        <div className="lg:col-span-3 space-y-4">
             {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
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
        <button onClick={() => handleOpenGroupModal('create')} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 mr-3">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Novo Grupo
        </button>
        <button onClick={() => handleOpenExerciseModal()} className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Novo Exercício
        </button>
      </PageHeader>
      
      {/* Estatísticas */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total de Exercícios</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.totalExercises || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Com Protocolos</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.exercisesWithProtocols || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Especialidades</p>
              <p className="text-2xl font-bold text-slate-900">{Object.keys(statistics.specialties || {}).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Link className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Categorias</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.totalCategories || 0}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</span>
                     {areFiltersActive && (
                        <button onClick={resetFilters} className="text-xs font-semibold text-teal-600 hover:underline flex items-center">
                            <X className="w-3 h-3 mr-1"/> Limpar
                        </button>
                    )}
                </h3>

                <div className="space-y-6">
                     <div>
                        <label className="text-sm font-semibold text-slate-700">Busca por nome</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text" placeholder="Ex: Agachamento" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="specialty-select" className="text-sm font-semibold text-slate-700">Especialidade</label>
                        <select 
                            id="specialty-select"
                            value={selectedSpecialty} 
                            onChange={(e) => setSelectedSpecialty(e.target.value)} 
                            className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                            title="Filtrar exercícios por especialidade clínica"
                        >
                            <option value="">Todas as especialidades</option>
                            <option value="esportiva">Fisioterapia Esportiva</option>
                            <option value="pos-operatoria">Fisioterapia Pós-Operatória</option>
                            <option value="geriatrica">Fisioterapia Gerontológica</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="difficulty-range" className="text-sm font-semibold text-slate-700">Nível de Dificuldade (máx. {maxDifficulty})</label>
                        <input 
                            id="difficulty-range"
                            type="range" 
                            min="1" 
                            max="5" 
                            value={maxDifficulty} 
                            onChange={(e) => setMaxDifficulty(Number(e.target.value))} 
                            className="w-full mt-2"
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
                        <label htmlFor="showProtocols" className="ml-3 text-sm text-slate-600">
                            Apenas exercícios com protocolos
                        </label>
                    </div>
                     
                     <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Parte do Corpo</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                           {bodyParts.map(part => <FilterCheckbox key={part} id={`part-${part}`} label={part} checked={selectedBodyParts.includes(part)} onChange={(c) => handleBodyPartChange(part, c)} />)}
                        </div>
                    </div>
                     
                     <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Equipamento</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {equipment.map(equip => <FilterCheckbox key={equip} id={`equip-${equip}`} label={equip} checked={selectedEquipment.includes(equip)} onChange={(c) => handleEquipmentChange(equip, c)} />)}
                        </div>
                    </div>
                </div>
            </div>
          </aside>
          
          <main className="lg:col-span-3 space-y-4">
            {categories.map(category => {
              const categoryExercises = filteredExercises.filter(ex => ex.category === category);
              if (categoryExercises.length === 0) return null;
              const isOpen = openCategories.includes(category);
              
              return (
                <div key={category} className="bg-white rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                  <div className="group flex items-center p-4 cursor-pointer" onClick={() => toggleCategory(category)}>
                    <h3 className="text-xl font-bold text-slate-800 flex-1">
                      {category} 
                      <span className="text-base font-normal text-slate-500">({categoryExercises.length})</span>
                      {categoryExercises.some(ex => (ex as any).linkedProtocols?.length > 0) && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Link className="w-3 h-3 mr-1" />
                          Protocolos
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleOpenExerciseModal(undefined, category)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600" title="Adicionar Exercício"><Plus size={18}/></button>
                      <button onClick={() => handleOpenGroupModal('edit', category)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600" title="Renomear Grupo"><Edit size={16}/></button>
                      <button onClick={() => handleOpenGroupModal('copy', category)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600" title="Copiar Grupo"><Copy size={16}/></button>
                      <button onClick={() => handleDeleteCategory(category)} className="p-2 rounded-full hover:bg-red-50 text-red-600" title="Excluir Grupo"><Trash2 size={16}/></button>
                    </div>
                    <ChevronDown className={`ml-2 w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="p-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {categoryExercises.map(ex => (
                          <div key={ex.id} className="relative">
                            <ExerciseCard 
                              exercise={ex as any} 
                              onEdit={() => handleOpenExerciseModal(ex)} 
                              onDelete={() => handleDeleteExercise(ex)} 
                              onPlay={() => ex.media?.videoUrl && setPlayingVideo({ url: ex.media.videoUrl, title: ex.name })}
                            />
                            {(ex as any).linkedProtocols?.length > 0 && (
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Link className="w-3 h-3 mr-1" />
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
                <div className="text-center p-10 bg-white rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700">Nenhum exercício encontrado</h3>
                    <p className="text-slate-500 mt-1">Tente ajustar seus filtros para encontrar o que procura.</p>
                </div>
            )}
          </main>
        </div>
      )}
    </>
  );
};

export default EnhancedExerciseLibraryPage;
