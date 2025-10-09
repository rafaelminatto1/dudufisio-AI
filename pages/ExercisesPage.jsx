/**
 * Página de Lista de Exercícios
 * Sistema completo de gerenciamento de exercícios fisioterapêuticos
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercise } from '../contexts/ExerciseContext';
import { DataTable } from '../components/ui/data-table';
import { createExerciseColumns } from '../components/exercises/ExerciseColumns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '../components/ui/alert-dialog';
import { Plus, Search, Download, Upload, Dumbbell, Activity, TrendingUp, Users, } from 'lucide-react';
const ExercisesPage = () => {
    const navigate = useNavigate();
    const { exercises, categories, isLoading, getAllExercises, getAllCategories, deleteExercise, duplicateExercise, searchExercises, } = useExercise();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // Carregar dados na inicialização
    useEffect(() => {
        getAllExercises();
        getAllCategories();
    }, []);
    // Filtrar exercícios
    useEffect(() => {
        const applyFilters = async () => {
            const filters = {};
            if (searchQuery) {
                filters.query = searchQuery;
            }
            if (selectedCategory !== 'all') {
                filters.category = selectedCategory;
            }
            if (selectedDifficulty !== 'all') {
                filters.difficulty = selectedDifficulty;
            }
            if (Object.keys(filters).length > 0) {
                const results = await searchExercises(filters);
                setFilteredExercises(results);
            }
            else {
                setFilteredExercises(exercises);
            }
        };
        applyFilters();
    }, [searchQuery, selectedCategory, selectedDifficulty, exercises, searchExercises]);
    // Handlers
    const handleCreateExercise = () => {
        navigate('/exercises/new');
    };
    const handleEditExercise = (exercise) => {
        navigate(`/exercises/${exercise.id}`);
    };
    const handleViewExercise = (exercise) => {
        navigate(`/exercises/${exercise.id}/view`);
    };
    const handleDeleteExercise = (exercise) => {
        setExerciseToDelete(exercise);
        setShowDeleteDialog(true);
    };
    const confirmDelete = async () => {
        if (exerciseToDelete) {
            try {
                await deleteExercise(exerciseToDelete.id);
                setShowDeleteDialog(false);
                setExerciseToDelete(null);
                console.log('✅ Exercício excluído com sucesso');
            }
            catch (error) {
                console.error('❌ Erro ao excluir exercício:', error);
            }
        }
    };
    const handleDuplicateExercise = async (exercise) => {
        try {
            const duplicated = await duplicateExercise(exercise.id);
            console.log('✅ Exercício duplicado:', duplicated.name);
            navigate(`/exercises/${duplicated.id}`);
        }
        catch (error) {
            console.error('❌ Erro ao duplicar exercício:', error);
        }
    };
    // Estatísticas
    const stats = {
        total: exercises.length,
        active: exercises.filter(ex => ex.isActive).length,
        beginner: exercises.filter(ex => ex.difficulty === 'beginner').length,
        advanced: exercises.filter(ex => ex.difficulty === 'advanced' || ex.difficulty === 'expert').length,
    };
    // Colunas da tabela
    const columns = createExerciseColumns(handleEditExercise, handleDeleteExercise, handleViewExercise, handleDuplicateExercise);
    if (isLoading && exercises.length === 0) {
        return <ExercisesPageSkeleton />;
    }
    return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercícios</h1>
          <p className="text-gray-500 mt-1">
            Gerencie sua biblioteca de exercícios fisioterapêuticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2"/>
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2"/>
            Exportar
          </Button>
          <Button onClick={handleCreateExercise}>
            <Plus className="h-4 w-4 mr-2"/>
            Novo Exercício
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes categorias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iniciantes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.beginner}</div>
            <p className="text-xs text-muted-foreground">
              Nível iniciante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avançados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.advanced}</div>
            <p className="text-xs text-muted-foreground">
              Nível avançado/expert
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Pesquise e filtre exercícios por categoria e dificuldade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <Input placeholder="Buscar exercícios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map((category) => (<SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Dificuldade"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Dificuldades</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (<Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
            }}>
                Limpar Filtros
              </Button>)}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Exercícios</CardTitle>
              <CardDescription>
                {filteredExercises.length} exercício(s) encontrado(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredExercises} meta={{
            onEdit: handleEditExercise,
            onDelete: handleDeleteExercise,
            onView: handleViewExercise,
            onDuplicate: handleDuplicateExercise,
        }}/>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o exercício "{exerciseToDelete?.name}"?
              Esta ação não pode ser desfeita e removerá todas as atribuições associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
};
// Skeleton Loading
const ExercisesPageSkeleton = () => {
    return (<div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2"/>
          <Skeleton className="h-4 w-64"/>
        </div>
        <Skeleton className="h-10 w-32"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (<Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32"/>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2"/>
              <Skeleton className="h-3 w-24"/>
            </CardContent>
          </Card>))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32"/>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full"/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48"/>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full"/>
        </CardContent>
      </Card>
    </div>);
};
export default ExercisesPage;
