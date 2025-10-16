/**
 * components/patient/GoalsManager.tsx
 * 
 * Componente para gerenciamento de metas de pacientes
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { goalsService } from '@/services/supabase/goalsService';
import { predictionService } from '@/services/ai/predictionService';
import { PatientGoal } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

interface GoalsManagerProps {
  patientId: string;
}

type GoalCategory = 'performance' | 'recovery' | 'fitness' | 'lifestyle' | 'medical' | 'mobility' | 'strength' | 'pain_reduction' | 'functional';
type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'archived';

export function GoalsManager({ patientId }: GoalsManagerProps) {
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PatientGoal | null>(null);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('active');
  const [historicalSuccessRate, setHistoricalSuccessRate] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'recovery' as GoalCategory,
    targetDate: '',
    targetValue: '',
    currentValue: '',
    currentProgress: 0,
    unit: '',
    priority: 'medium' as GoalPriority,
    status: 'active' as GoalStatus,
    notes: ''
  });

  useEffect(() => {
    loadGoals();
    loadHistoricalSuccessRate();
  }, [patientId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getGoalsByPatient(patientId);
      setGoals(data);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalSuccessRate = async () => {
    try {
      const rate = await goalsService.getHistoricalSuccessRate(patientId);
      setHistoricalSuccessRate(rate);
    } catch (error) {
      console.error('Erro ao calcular taxa de sucesso:', error);
    }
  };

  const handleOpenDialog = (goal?: PatientGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        targetDate: goal.targetDate || '',
        targetValue: goal.targetValue || '',
        currentValue: goal.currentValue || '',
        currentProgress: goal.currentProgress || 0,
        unit: goal.unit || '',
        priority: goal.priority,
        status: goal.status,
        notes: goal.notes || ''
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        category: 'recovery',
        targetDate: '',
        targetValue: '',
        currentValue: '',
        currentProgress: 0,
        unit: '',
        priority: 'medium',
        status: 'active',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        targetDate: formData.targetDate || undefined,
        targetValue: formData.targetValue || undefined,
        currentValue: formData.currentValue || undefined,
        currentProgress: formData.currentProgress,
        unit: formData.unit || undefined,
        priority: formData.priority,
        status: formData.status,
        notes: formData.notes || undefined
      };

      if (editingGoal) {
        await goalsService.updateGoal(editingGoal.id, data);
        toast.success('Meta atualizada com sucesso!');
      } else {
        await goalsService.createGoal({ ...data, patientId });
        toast.success('Meta adicionada com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingGoal(null);
      loadGoals();
      loadHistoricalSuccessRate();
    } catch (error: any) {
      console.error('Erro ao salvar meta:', error);
      toast.error(error.message || 'Erro ao salvar meta');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await goalsService.deleteGoal(id);
        toast.success('Meta excluída com sucesso!');
        loadGoals();
        loadHistoricalSuccessRate();
      } catch (error: any) {
        console.error('Erro ao excluir meta:', error);
        toast.error(error.message || 'Erro ao excluir meta');
      }
    }
  };

  const handleCompleteGoal = async (id: string) => {
    try {
      await goalsService.completeGoal(id);
      toast.success('Meta marcada como concluída!');
      loadGoals();
      loadHistoricalSuccessRate();
    } catch (error: any) {
      console.error('Erro ao concluir meta:', error);
      toast.error(error.message || 'Erro ao concluir meta');
    }
  };

  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case 'performance': return '🏃';
      case 'recovery': return '💊';
      case 'fitness': return '💪';
      case 'lifestyle': return '🏠';
      case 'medical': return '🏥';
      case 'mobility': return '🚶';
      case 'strength': return '⚡';
      case 'pain_reduction': return '😌';
      case 'functional': return '✨';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'medium': return 'bg-health-info-100 text-health-info-700 border-health-info-300';
      case 'high': return 'bg-health-warning-100 text-health-warning-700 border-health-warning-300';
      case 'critical': return 'bg-health-danger-100 text-health-danger-700 border-health-danger-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityLabel = (priority: GoalPriority) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Média';
    }
  };

  const filteredGoals = filterStatus === 'all' 
    ? goals 
    : goals.filter(g => g.status === filterStatus);

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-health-success-500" />
          Metas ({goals.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-health-primary-600 hover:bg-health-primary-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Meta *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Correr 10 km em 1 hora"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada da meta"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as GoalCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">🏃 Performance</SelectItem>
                      <SelectItem value="recovery">💊 Recuperação</SelectItem>
                      <SelectItem value="fitness">💪 Fitness</SelectItem>
                      <SelectItem value="lifestyle">🏠 Estilo de Vida</SelectItem>
                      <SelectItem value="medical">🏥 Médica</SelectItem>
                      <SelectItem value="mobility">🚶 Mobilidade</SelectItem>
                      <SelectItem value="strength">⚡ Força</SelectItem>
                      <SelectItem value="pain_reduction">😌 Redução de Dor</SelectItem>
                      <SelectItem value="functional">✨ Funcional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as GoalPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="targetValue">Valor Alvo</Label>
                  <Input
                    id="targetValue"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    placeholder="Ex: 10"
                  />
                </div>

                <div>
                  <Label htmlFor="currentValue">Valor Atual</Label>
                  <Input
                    id="currentValue"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="Ex: 5"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ex: km, kg"
                  />
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
                  onChange={(e) => setFormData({ ...formData, currentProgress: parseInt(e.target.value) || 0 })}
                />
                <Progress value={formData.currentProgress} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-health-primary-600 hover:bg-health-primary-700">
                  {editingGoal ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Todas ({goals.length})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Ativas ({activeGoals.length})
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
          >
            Concluídas ({completedGoals.length})
          </Button>
          <Button
            variant={filterStatus === 'paused' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('paused')}
          >
            Pausadas ({goals.filter(g => g.status === 'paused').length})
          </Button>
        </div>

        {/* Taxa de Sucesso Histórica */}
        {goals.length > 0 && (
          <div className="mb-4 p-3 bg-health-success-50 rounded-lg">
            <p className="text-sm font-semibold text-health-success-700 mb-2">
              Taxa de Sucesso Histórica
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Progress value={historicalSuccessRate} className="h-2" />
              </div>
              <span className="text-sm font-bold text-health-success-600">
                {historicalSuccessRate}%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {completedGoals.length} de {goals.length} metas alcançadas
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Carregando...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma meta registrada</p>
            <p className="text-sm mt-1">Clique em "Nova Meta" para adicionar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal) => {
              const isAtRisk = goal.currentProgress < 50 && goal.status === 'active';
              
              return (
                <div 
                  key={goal.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                        <h4 className="font-semibold text-lg text-slate-900">{goal.title}</h4>
                        <StatusBadge status={goal.status} size="sm" />
                        <Badge className={`${getPriorityColor(goal.priority)} text-xs`}>
                          {getPriorityLabel(goal.priority)}
                        </Badge>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        {goal.targetDate && (
                          <span className="text-xs text-slate-600">
                            📅 Alvo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {goal.targetValue && goal.currentValue && (
                          <span className="text-xs text-slate-600">
                            • {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600">Progresso</span>
                          <span className="text-xs font-semibold text-health-primary-600">
                            {goal.currentProgress}%
                          </span>
                        </div>
                        <Progress value={goal.currentProgress} className="h-2" />
                      </div>

                      {/* Alerta de Meta em Risco */}
                      {isAtRisk && (
                        <div className="mt-3 p-2 bg-health-warning-50 rounded border border-health-warning-200">
                          <p className="text-xs font-medium text-health-warning-700">
                            ⚠️ Meta em risco
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Sugestão: Aumentar frequência de sessões ou revisar estratégia
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {goal.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="text-health-success-600 hover:text-health-success-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-health-danger-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

