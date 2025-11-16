/**
 * components/patient/AssessmentTestConfigManager.tsx
 * 
 * Componente para configuração de testes de avaliação obrigatórios
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Activity, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { assessmentTestService } from '@/services/supabase/assessmentTestService';
import { AssessmentTestConfig } from '@/types';
import { toast } from 'sonner';

interface AssessmentTestConfigManagerProps {
  patientId: string;
}

type TestType = 'amplitude' | 'strength' | 'balance' | 'functional' | 'pain';

export function AssessmentTestConfigManager({ patientId }: AssessmentTestConfigManagerProps) {
  const [testConfigs, setTestConfigs] = useState<AssessmentTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AssessmentTestConfig | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    testName: '',
    testType: 'amplitude' as TestType,
    frequencySessions: '',
    frequencyDays: '',
    isMandatory: true,
    notes: ''
  });

  useEffect(() => {
    loadTestConfigs();
  }, [patientId]);

  const loadTestConfigs = async () => {
    try {
      setLoading(true);
      const data = await assessmentTestService.getTestConfigsByPatient(patientId);
      setTestConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar configurações de teste:', error);
      toast.error('Erro ao carregar configurações de teste');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: AssessmentTestConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        testName: config.testName,
        testType: config.testType,
        frequencySessions: config.frequencySessions?.toString() || '',
        frequencyDays: config.frequencyDays?.toString() || '',
        isMandatory: config.isMandatory,
        notes: config.notes || ''
      });
    } else {
      setEditingConfig(null);
      setFormData({
        testName: '',
        testType: 'amplitude',
        frequencySessions: '',
        frequencyDays: '',
        isMandatory: true,
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.frequencySessions && !formData.frequencyDays) {
      toast.error('Defina uma frequência (sessões ou dias)');
      return;
    }
    
    try {
      const data = {
        testName: formData.testName,
        testType: formData.testType,
        frequencySessions: formData.frequencySessions ? parseInt(formData.frequencySessions) : undefined,
        frequencyDays: formData.frequencyDays ? parseInt(formData.frequencyDays) : undefined,
        isMandatory: formData.isMandatory,
        notes: formData.notes || undefined
      };

      if (editingConfig) {
        await assessmentTestService.updateTestConfig(editingConfig.id, data);
        toast.success('Configuração atualizada com sucesso!');
      } else {
        await assessmentTestService.createTestConfig({ ...data, patientId });
        toast.success('Configuração adicionada com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingConfig(null);
      loadTestConfigs();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error(error.message || 'Erro ao salvar configuração');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta configuração de teste?')) {
      try {
        await assessmentTestService.deleteTestConfig(id);
        toast.success('Configuração excluída com sucesso!');
        loadTestConfigs();
      } catch (error: any) {
        console.error('Erro ao excluir configuração:', error);
        toast.error(error.message || 'Erro ao excluir configuração');
      }
    }
  };

  const getTestTypeIcon = (type: TestType) => {
    switch (type) {
      case 'amplitude': return '📐';
      case 'strength': return '💪';
      case 'balance': return '⚖️';
      case 'functional': return '🎯';
      case 'pain': return '😣';
      default: return '📊';
    }
  };

  const getTestTypeLabel = (type: TestType) => {
    switch (type) {
      case 'amplitude': return 'Amplitude de Movimento';
      case 'strength': return 'Força Muscular';
      case 'balance': return 'Equilíbrio';
      case 'functional': return 'Funcional';
      case 'pain': return 'Dor';
      default: return type;
    }
  };

  const getUrgencyBadge = (nextDueDate?: string) => {
    if (!nextDueDate) return null;
    
    const daysUntil = assessmentTestService.calculateDaysUntilTest(nextDueDate);
    
    if (daysUntil < 0) {
      return <Badge className="bg-health-danger-100 text-health-danger-700 border-health-danger-300">Em Atraso</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge className="bg-health-warning-100 text-health-warning-700 border-health-warning-300">Urgente</Badge>;
    } else if (daysUntil <= 30) {
      return <Badge className="bg-health-info-100 text-health-info-700 border-health-info-300">Próximo</Badge>;
    } else {
      return <Badge variant="outline">Agendado</Badge>;
    }
  };

  const mandatoryTests = testConfigs.filter(t => t.isMandatory);
  const overdueTests = testConfigs.filter(t => t.nextDueDate && new Date(t.nextDueDate) < new Date());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-health-info-500" />
          Testes de Avaliação ({testConfigs.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-health-primary-600 hover:bg-health-primary-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Teste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Editar Configuração de Teste' : 'Nova Configuração de Teste'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="testName">Nome do Teste *</Label>
                <Input
                  id="testName"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  required
                  placeholder="Ex: Amplitude de Movimento do Joelho"
                />
              </div>

              <div>
                <Label htmlFor="testType">Tipo de Teste *</Label>
                <Select
                  value={formData.testType}
                  onValueChange={(value) => setFormData({ ...formData, testType: value as TestType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amplitude">📐 Amplitude de Movimento</SelectItem>
                    <SelectItem value="strength">💪 Força Muscular</SelectItem>
                    <SelectItem value="balance">⚖️ Equilíbrio</SelectItem>
                    <SelectItem value="functional">🎯 Funcional</SelectItem>
                    <SelectItem value="pain">😣 Dor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequencySessions">Frequência (Sessões)</Label>
                  <Input
                    id="frequencySessions"
                    type="number"
                    value={formData.frequencySessions}
                    onChange={(e) => setFormData({ ...formData, frequencySessions: e.target.value })}
                    placeholder="Ex: 5"
                  />
                  <p className="text-xs text-slate-500 mt-1">Executar a cada X sessões</p>
                </div>

                <div>
                  <Label htmlFor="frequencyDays">Frequência (Dias)</Label>
                  <Input
                    id="frequencyDays"
                    type="number"
                    value={formData.frequencyDays}
                    onChange={(e) => setFormData({ ...formData, frequencyDays: e.target.value })}
                    placeholder="Ex: 30"
                  />
                  <p className="text-xs text-slate-500 mt-1">Executar a cada X dias</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMandatory"
                  checked={formData.isMandatory}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                  className="w-4 h-4 text-health-primary-600 border-gray-300 rounded focus:ring-health-primary-500"
                />
                <Label htmlFor="isMandatory" className="cursor-pointer">
                  Teste Obrigatório
                </Label>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instruções ou observações sobre o teste"
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
                  {editingConfig ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {/* Alertas */}
        {overdueTests.length > 0 && (
          <div className="mb-4 p-3 bg-health-danger-50 rounded-lg border border-health-danger-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-health-danger-600" />
              <p className="text-sm font-semibold text-health-danger-700">
                {overdueTests.length} Teste(s) em Atraso
              </p>
            </div>
            <p className="text-xs text-slate-700">
              Os seguintes testes devem ser realizados urgentemente
            </p>
          </div>
        )}

        {mandatoryTests.length > 0 && (
          <div className="mb-4 p-3 bg-health-info-50 rounded-lg border border-health-info-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-health-info-600" />
              <p className="text-sm font-semibold text-health-info-700">
                {mandatoryTests.length} Teste(s) Obrigatório(s) Configurado(s)
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Carregando...</p>
          </div>
        ) : testConfigs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma configuração de teste registrada</p>
            <p className="text-sm mt-1">Clique em "Novo Teste" para adicionar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testConfigs.map((config) => {
              const daysUntil = config.nextDueDate 
                ? assessmentTestService.calculateDaysUntilTest(config.nextDueDate)
                : null;
              
              return (
                <div 
                  key={config.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTestTypeIcon(config.testType)}</span>
                        <h4 className="font-semibold text-lg text-slate-900">{config.testName}</h4>
                        {config.isMandatory && (
                          <Badge className="bg-health-danger-100 text-health-danger-700 border-health-danger-300">
                            Obrigatório
                          </Badge>
                        )}
                        {getUrgencyBadge(config.nextDueDate)}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                          <strong>Tipo:</strong> {getTestTypeLabel(config.testType)}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {config.frequencySessions && (
                            <span>📅 A cada {config.frequencySessions} sessões</span>
                          )}
                          {config.frequencyDays && (
                            <span>📆 A cada {config.frequencyDays} dias</span>
                          )}
                        </div>

                        {config.lastPerformedDate && (
                          <p className="text-sm text-slate-600">
                            <strong>Última execução:</strong> {new Date(config.lastPerformedDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}

                        {config.nextDueDate && (
                          <p className="text-sm text-slate-600">
                            <strong>Próxima execução:</strong> {new Date(config.nextDueDate).toLocaleDateString('pt-BR')}
                            {daysUntil !== null && (
                              <span className={`ml-2 ${daysUntil < 0 ? 'text-health-danger-600 font-semibold' : daysUntil <= 7 ? 'text-health-warning-600 font-semibold' : ''}`}>
                                ({daysUntil < 0 ? `${Math.abs(daysUntil)} dias atrasado` : `em ${daysUntil} dias`})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      
                      {config.notes && (
                        <p className="text-sm text-slate-700 mt-2">{config.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(config)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
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

