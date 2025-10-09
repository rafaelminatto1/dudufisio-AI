/**
 * Página de Lista de Protocolos
 * Sistema completo de gerenciamento de protocolos de exercícios
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercise } from '../contexts/ExerciseContext';
import { ExerciseProtocol } from '../types/exercise';
import { DataTable } from '../components/ui/data-table';
import { createProtocolColumns } from '../components/protocols/ProtocolColumns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Plus,
  Search,
  Download,
  Upload,
  Activity,
  Clock,
  Zap,
  Target,
} from 'lucide-react';

const ProtocolsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    protocols,
    isLoading,
    getAllProtocols,
    deleteProtocol,
  } = useExercise();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [filteredProtocols, setFilteredProtocols] = useState<ExerciseProtocol[]>([]);
  const [protocolToDelete, setProtocolToDelete] = useState<ExerciseProtocol | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Carregar dados
  useEffect(() => {
    getAllProtocols();
  }, []);

  // Filtrar protocolos
  useEffect(() => {
    let results = [...protocols];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(prot =>
        prot.name.toLowerCase().includes(query) ||
        prot.description.toLowerCase().includes(query) ||
        prot.targetConditions.some(cond => cond.toLowerCase().includes(query))
      );
    }

    if (selectedIntensity !== 'all') {
      results = results.filter(prot => prot.intensity === selectedIntensity);
    }

    setFilteredProtocols(results);
  }, [searchQuery, selectedIntensity, protocols]);

  // Handlers
  const handleCreateProtocol = () => {
    navigate('/protocols/new');
  };

  const handleEditProtocol = (protocol: ExerciseProtocol) => {
    navigate(`/protocols/${protocol.id}`);
  };

  const handleViewProtocol = (protocol: ExerciseProtocol) => {
    navigate(`/protocols/${protocol.id}/view`);
  };

  const handleDeleteProtocol = (protocol: ExerciseProtocol) => {
    setProtocolToDelete(protocol);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (protocolToDelete) {
      try {
        await deleteProtocol(protocolToDelete.id);
        setShowDeleteDialog(false);
        setProtocolToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir protocolo:', error);
      }
    }
  };

  const handleDuplicateProtocol = async (protocol: ExerciseProtocol) => {
    // Implementar duplicação de protocolo
    console.log('Duplicar protocolo:', protocol.name);
  };

  // Estatísticas
  const stats = {
    total: protocols.length,
    active: protocols.filter(p => p.isActive).length,
    avgDuration: protocols.length > 0 
      ? Math.round(protocols.reduce((sum, p) => sum + p.duration, 0) / protocols.length)
      : 0,
    totalExercises: protocols.reduce((sum, p) => sum + p.exercises.length, 0),
  };

  // Colunas da tabela
  const columns = createProtocolColumns(
    handleEditProtocol,
    handleDeleteProtocol,
    handleViewProtocol,
    handleDuplicateProtocol
  );

  if (isLoading && protocols.length === 0) {
    return <ProtocolsPageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Protocolos de Exercícios</h1>
          <p className="text-gray-500 mt-1">
            Gerencie protocolos completos de tratamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateProtocol}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Protocolo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Protocolos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}</div>
            <p className="text-xs text-muted-foreground">
              semanas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExercises}</div>
            <p className="text-xs text-muted-foreground">
              em todos protocolos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Protocolo</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {protocols.length > 0 
                ? Math.round(stats.totalExercises / protocols.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              exercícios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Pesquise e filtre protocolos por nome e intensidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar protocolos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Intensity Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedIntensity} onValueChange={setSelectedIntensity}>
                <SelectTrigger>
                  <SelectValue placeholder="Intensidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Intensidades</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="very_high">Muito Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedIntensity !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIntensity('all');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Protocolos</CardTitle>
              <CardDescription>
                {filteredProtocols.length} protocolo(s) encontrado(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredProtocols}
            meta={{
              onEdit: handleEditProtocol,
              onDelete: handleDeleteProtocol,
              onView: handleViewProtocol,
              onDuplicate: handleDuplicateProtocol,
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o protocolo "{protocolToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Skeleton Loading
const ProtocolsPageSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtocolsPage;
