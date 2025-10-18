import React, { useState } from 'react';
import { PatientGoal } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Target, Plus, Edit, Trash2, Calendar, Clock, CheckCircle, Pause, X } from 'lucide-react';
import format from 'date-fns/format';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import { ptBR } from 'date-fns/locale';

interface PatientGoalsManagerProps {
  goals: PatientGoal[];
  onAddGoal: (goal: Omit<PatientGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (id: string, goal: Partial<PatientGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

const PatientGoalsManager: React.FC<PatientGoalsManagerProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PatientGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    targetValue: '',
    category: 'performance' as PatientGoal['category'],
    priority: 'medium' as PatientGoal['priority'],
    currentProgress: '0'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: '',
      targetValue: '',
      category: 'performance',
      priority: 'medium',
      currentProgress: '0'
    });
  };

  const handleAddGoal = () => {
    if (!formData.title || !formData.targetDate) return;

    onAddGoal({
      patientId: '', // Will be set by parent component
      title: formData.title,
      description: formData.description,
      targetDate: formData.targetDate,
      targetValue: formData.targetValue || undefined,
      currentProgress: parseInt(formData.currentProgress),
      status: 'active',
      category: formData.category,
      priority: formData.priority
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditGoal = (goal: PatientGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      targetValue: goal.targetValue || '',
      category: goal.category,
      priority: goal.priority,
      currentProgress: goal.currentProgress?.toString() || '0'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !formData.title || !formData.targetDate) return;

    onUpdateGoal(editingGoal.id, {
      title: formData.title,
      description: formData.description,
      targetDate: formData.targetDate,
      targetValue: formData.targetValue || undefined,
      currentProgress: parseInt(formData.currentProgress),
      category: formData.category,
      priority: formData.priority
    });

    resetForm();
    setEditingGoal(null);
    setIsEditDialogOpen(false);
  };

  const getTimeToTarget = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    
    if (isBefore(target, now)) {
      return 'Prazo vencido';
    }
    
    const days = differenceInDays(target, now);
    const weeks = differenceInWeeks(target, now);
    const months = differenceInMonths(target, now);
    const years = differenceInYears(target, now);

    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''} restante${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} mês${months > 1 ? 'es' : ''} restante${months > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      return `${weeks} semana${weeks > 1 ? 's' : ''} restante${weeks > 1 ? 's' : ''}`;
    } else {
      return `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
    }
  };

  const getStatusIcon = (status: PatientGoal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: PatientGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: PatientGoal['priority']) => {
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

  const getCategoryLabel = (category: PatientGoal['category']) => {
    switch (category) {
      case 'performance':
        return 'Performance';
      case 'recovery':
        return 'Recuperação';
      case 'fitness':
        return 'Fitness';
      case 'lifestyle':
        return 'Estilo de Vida';
      case 'medical':
        return 'Médico';
      default:
        return category;
    }
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Objetivos do Paciente</span>
            </CardTitle>
            <CardDescription>
              Metas e objetivos de tratamento
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Objetivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Objetivo</DialogTitle>
                <DialogDescription>
                  Defina um novo objetivo para o paciente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Objetivo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Correr maratona"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes do objetivo"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Data Alvo *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="targetValue">Valor Alvo</Label>
                  <Input
                    id="targetValue"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    placeholder="Ex: pace 4:30/km"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as PatientGoal['category'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="recovery">Recuperação</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="lifestyle">Estilo de Vida</SelectItem>
                        <SelectItem value="medical">Médico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as PatientGoal['priority'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="currentProgress">Progresso Atual (%)</Label>
                  <Input
                    id="currentProgress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentProgress}
                    onChange={(e) => setFormData({ ...formData, currentProgress: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddGoal}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhum objetivo definido</p>
            <p className="text-sm">Defina objetivos para acompanhar o progresso do paciente</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Objetivos Ativos ({activeGoals.length})</span>
                </h4>
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    const timeToTarget = getTimeToTarget(goal.targetDate);
                    const isOverdue = isBefore(new Date(goal.targetDate), new Date());
                    
                    return (
                      <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900">{goal.title}</h5>
                            {goal.description && (
                              <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                            )}
                            {goal.targetValue && (
                              <p className="text-sm text-slate-600 mt-1">
                                <span className="font-medium">Meta:</span> {goal.targetValue}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(goal.priority)}>
                              {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            <Badge variant="outline">
                              {getCategoryLabel(goal.category)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteGoal(goal.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progresso</span>
                            <span className="font-medium">{goal.currentProgress || 0}%</span>
                          </div>
                          <Progress value={goal.currentProgress || 0} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                            <Clock className="h-4 w-4" />
                            <span>{timeToTarget}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Objetivos Concluídos ({completedGoals.length})</span>
                </h4>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-900">{goal.title}</h5>
                          {goal.description && (
                            <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                          )}
                          {goal.completedAt && (
                            <p className="text-sm text-green-600 mt-1">
                              Concluído em {format(new Date(goal.completedAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Concluído
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Objetivo</DialogTitle>
            <DialogDescription>
              Atualize as informações do objetivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título do Objetivo *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Correr maratona"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes do objetivo"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-targetDate">Data Alvo *</Label>
              <Input
                id="edit-targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-targetValue">Valor Alvo</Label>
              <Input
                id="edit-targetValue"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                placeholder="Ex: pace 4:30/km"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as PatientGoal['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="recovery">Recuperação</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="lifestyle">Estilo de Vida</SelectItem>
                    <SelectItem value="medical">Médico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as PatientGoal['priority'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-currentProgress">Progresso Atual (%)</Label>
              <Input
                id="edit-currentProgress"
                type="number"
                min="0"
                max="100"
                value={formData.currentProgress}
                onChange={(e) => setFormData({ ...formData, currentProgress: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateGoal}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatientGoalsManager;
