/**
 * Página de Atribuições de Exercícios
 * Gerenciamento de exercícios atribuídos a pacientes
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercise } from '../contexts/ExerciseContext';
import { usePatient } from '../contexts/PatientContext';
import { ExerciseAssignment } from '../types/exercise';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Pause,
  XCircle,
  Activity,
  Users,
} from 'lucide-react';
import { AssignExerciseModal } from '../components/assignments/AssignExerciseModal';
import { AssignmentCard } from '../components/assignments/AssignmentCard';

const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { assignments, isLoading: exerciseLoading } = useExercise();
  const { patients, getAllPatients, isLoading: patientLoading } = usePatient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [filteredAssignments, setFilteredAssignments] = useState<ExerciseAssignment[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const isLoading = exerciseLoading || patientLoading;

  // Carregar dados
  useEffect(() => {
    getAllPatients();
  }, []);

  // Filtrar atribuições
  useEffect(() => {
    let results = [...assignments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(assign =>
        assign.exercise?.name.toLowerCase().includes(query) ||
        assign.instructions?.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== 'all') {
      results = results.filter(assign => assign.status === selectedStatus);
    }

    if (selectedPatient !== 'all') {
      results = results.filter(assign => assign.patientId === selectedPatient);
    }

    // Ordenar por data mais recente
    results.sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());

    setFilteredAssignments(results);
  }, [searchQuery, selectedStatus, selectedPatient, assignments]);

  // Estatísticas
  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    paused: assignments.filter(a => a.status === 'paused').length,
  };

  const statusColors: Record<string, string> = {
    assigned: 'bg-primary-light text-blue-800',
    in_progress: 'bg-warning-light text-yellow-800',
    completed: 'bg-success-light text-success',
    paused: 'bg-neutral-bgDark text-gray-800',
    cancelled: 'bg-error-light text-error',
  };

  const statusLabels: Record<string, string> = {
    assigned: 'Atribuído',
    in_progress: 'Em Progresso',
    completed: 'Concluído',
    paused: 'Pausado',
    cancelled: 'Cancelado',
  };

  if (isLoading && assignments.length === 0) {
    return <AssignmentsPageSkeleton />;
  }

  return (
    <div className="p-lg space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text">Atribuições de Exercícios</h1>
          <p className="text-gray-500 mt-xs">
            Gerencie exercícios atribuídos aos pacientes
          </p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <Plus className="h-4 w-4 mr-sm" />
          Nova Atribuição
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atribuídos</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pausados</CardTitle>
            <Pause className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paused}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Pesquise e filtre atribuições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-md">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-textTertiary" />
                <Input
                  placeholder="Buscar atribuições..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Patient Filter */}
            <div className="w-full md:w-56">
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pacientes</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="assigned">Atribuído</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedStatus !== 'all' || selectedPatient !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedPatient('all');
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-sm">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}

        {filteredAssignments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p className="mb-sm">Nenhuma atribuição encontrada</p>
              <Button variant="outline" onClick={() => setShowAssignModal(true)}>
                <Plus className="h-4 w-4 mr-sm" />
                Criar Primeira Atribuição
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assign Modal */}
      <AssignExerciseModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />
    </div>
  );
};

// Skeleton Loading
const AssignmentsPageSkeleton: React.FC = () => {
  return (
    <div className="p-lg space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-sm" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
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

      <div className="space-y-sm">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;

