import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  User,
  FileText,
  Filter,
  Search,
  MoreVertical,
  Eye,
  MessageSquare,
  Flag,
  Plus
} from 'lucide-react';
import { materialTaskService, TaskSearchParams } from '../services/materialTaskService';
import { MaterialTask } from '../types';
import { useToast } from '../contexts/ToastContext';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useApp } from '../contexts/AppContext';

const MaterialTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useApp();
  
  const [tasks, setTasks] = useState<MaterialTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const [tasksData, statsData] = await Promise.all([
          materialTaskService.getTasksByUser(user.id),
          materialTaskService.getTaskStats(user.id)
        ]);
        
        setTasks(tasksData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Erro ao carregar tarefas', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user?.id, showToast]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.mentionedUserName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await materialTaskService.updateTask({
        id: taskId,
        status: newStatus as any
      });

      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus as any,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
            }
          : task
      ));

      showToast('Status da tarefa atualizado', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Erro ao atualizar tarefa', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await materialTaskService.deleteTask(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
        showToast('Tarefa excluída com sucesso', 'success');
      } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Erro ao excluir tarefa', 'error');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in_progress':
        return 'Em Andamento';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Tarefas de Materiais"
        subtitle="Gerencie suas tarefas atribuídas via menções em materiais clínicos"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por conteúdo ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredTasks.length} tarefa(s) encontrada(s)
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className={`${isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(task.status)}
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Badge>
                      {isOverdue(task.dueDate, task.status) && (
                        <Badge className="bg-red-100 text-red-800">
                          Atrasada
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {task.content}
                  </h3>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Atribuída por: {task.mentionedUserName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(task.assignedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Vence: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {task.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm text-gray-700">{task.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/material-detail/${task.materialId}`)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Material</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Iniciar
                    </Button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Concluir
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Concluída
                        </DropdownMenuItem>
                      )}
                      {task.status === 'completed' && (
                        <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'pending')}>
                          <Clock className="mr-2 h-4 w-4" />
                          Reabrir Tarefa
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600"
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Tente ajustar os filtros para encontrar suas tarefas.'
                  : 'Você não possui tarefas atribuídas no momento.'}
              </p>
              <Button
                onClick={() => navigate('/materials')}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Explorar Materiais
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default MaterialTasksPage;
