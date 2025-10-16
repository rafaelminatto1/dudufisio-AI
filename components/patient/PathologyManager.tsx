/**
 * components/patient/PathologyManager.tsx
 * 
 * Componente para gerenciamento de patologias de pacientes
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { pathologyService } from '@/services/supabase/pathologyService';
import { Pathology } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

interface PathologyManagerProps {
  patientId: string;
}

type PathologyStatus = 'active' | 'resolved' | 'chronic' | 'monitoring';
type PathologySeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export function PathologyManager({ patientId }: PathologyManagerProps) {
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPathology, setEditingPathology] = useState<Pathology | null>(null);
  const [filterStatus, setFilterStatus] = useState<PathologyStatus | 'all'>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icdCode: '',
    diagnosisDate: '',
    status: 'active' as PathologyStatus,
    severity: 'moderate' as PathologySeverity,
    affectedRegion: '',
    description: '',
    treatmentPlan: '',
    notes: ''
  });

  useEffect(() => {
    loadPathologies();
  }, [patientId]);

  const loadPathologies = async () => {
    try {
      setLoading(true);
      const data = await pathologyService.getPathologiesByPatient(patientId);
      setPathologies(data);
    } catch (error) {
      console.error('Erro ao carregar patologias:', error);
      toast.error('Erro ao carregar patologias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pathology?: Pathology) => {
    if (pathology) {
      setEditingPathology(pathology);
      setFormData({
        name: pathology.name,
        icdCode: pathology.icdCode || '',
        diagnosisDate: pathology.diagnosisDate,
        status: pathology.status,
        severity: pathology.severity || 'moderate',
        affectedRegion: pathology.affectedRegion || '',
        description: pathology.description || '',
        treatmentPlan: pathology.treatmentPlan || '',
        notes: pathology.notes || ''
      });
    } else {
      setEditingPathology(null);
      setFormData({
        name: '',
        icdCode: '',
        diagnosisDate: '',
        status: 'active',
        severity: 'moderate',
        affectedRegion: '',
        description: '',
        treatmentPlan: '',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        name: formData.name,
        icdCode: formData.icdCode || undefined,
        diagnosisDate: formData.diagnosisDate,
        status: formData.status,
        severity: formData.severity,
        affectedRegion: formData.affectedRegion || undefined,
        description: formData.description || undefined,
        treatmentPlan: formData.treatmentPlan || undefined,
        notes: formData.notes || undefined
      };

      if (editingPathology) {
        await pathologyService.updatePathology(editingPathology.id, data);
        toast.success('Patologia atualizada com sucesso!');
      } else {
        await pathologyService.createPathology({ ...data, patientId });
        toast.success('Patologia adicionada com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingPathology(null);
      loadPathologies();
    } catch (error: any) {
      console.error('Erro ao salvar patologia:', error);
      toast.error(error.message || 'Erro ao salvar patologia');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta patologia?')) {
      try {
        await pathologyService.deletePathology(id);
        toast.success('Patologia excluída com sucesso!');
        loadPathologies();
      } catch (error: any) {
        console.error('Erro ao excluir patologia:', error);
        toast.error(error.message || 'Erro ao excluir patologia');
      }
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'mild': return 'bg-health-success-100 text-health-success-700 border-health-success-300';
      case 'moderate': return 'bg-health-warning-100 text-health-warning-700 border-health-warning-300';
      case 'severe': return 'bg-health-danger-100 text-health-danger-700 border-health-danger-300';
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'mild': return 'Leve';
      case 'moderate': return 'Moderada';
      case 'severe': return 'Severa';
      case 'critical': return 'Crítica';
      default: return 'Não especificada';
    }
  };

  const filteredPathologies = filterStatus === 'all' 
    ? pathologies 
    : pathologies.filter(p => p.status === filterStatus);

  const activePathologies = pathologies.filter(p => p.status === 'active');
  const overallComplexity = activePathologies.length > 3 ? 'Alta' : activePathologies.length > 1 ? 'Média' : 'Baixa';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-health-warning-500" />
          Patologias ({pathologies.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-health-primary-600 hover:bg-health-primary-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Patologia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPathology ? 'Editar Patologia' : 'Nova Patologia'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Patologia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Lombalgia Crônica"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icdCode">Código CID-10</Label>
                  <Input
                    id="icdCode"
                    value={formData.icdCode}
                    onChange={(e) => setFormData({ ...formData, icdCode: e.target.value.toUpperCase() })}
                    placeholder="Ex: M54.5"
                    maxLength={10}
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosisDate">Data do Diagnóstico *</Label>
                  <Input
                    id="diagnosisDate"
                    type="date"
                    value={formData.diagnosisDate}
                    onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as PathologyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="resolved">Resolvida</SelectItem>
                      <SelectItem value="chronic">Crônica</SelectItem>
                      <SelectItem value="monitoring">Em Monitoramento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severidade *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value as PathologySeverity })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Leve</SelectItem>
                      <SelectItem value="moderate">Moderada</SelectItem>
                      <SelectItem value="severe">Severa</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="affectedRegion">Região Afetada</Label>
                <Input
                  id="affectedRegion"
                  value={formData.affectedRegion}
                  onChange={(e) => setFormData({ ...formData, affectedRegion: e.target.value })}
                  placeholder="Ex: Região lombar, joelho direito"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada da patologia"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="treatmentPlan">Plano de Tratamento</Label>
                <Textarea
                  id="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                  placeholder="Protocolo de tratamento recomendado"
                  rows={3}
                />
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
                  {editingPathology ? 'Atualizar' : 'Adicionar'}
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
            Todas ({pathologies.length})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Ativas ({pathologies.filter(p => p.status === 'active').length})
          </Button>
          <Button
            variant={filterStatus === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('resolved')}
          >
            Resolvidas ({pathologies.filter(p => p.status === 'resolved').length})
          </Button>
          <Button
            variant={filterStatus === 'chronic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('chronic')}
          >
            Crônicas ({pathologies.filter(p => p.status === 'chronic').length})
          </Button>
        </div>

        {/* Complexidade Geral */}
        {activePathologies.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Complexidade do Caso</p>
              <Badge variant={overallComplexity === 'Alta' ? 'destructive' : overallComplexity === 'Média' ? 'default' : 'secondary'}>
                {overallComplexity}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {activePathologies.length} patologias ativas requerem abordagem integrada
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Carregando...</p>
          </div>
        ) : filteredPathologies.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma patologia registrada</p>
            <p className="text-sm mt-1">Clique em "Nova Patologia" para adicionar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPathologies.map((pathology) => {
              const impactScore = pathologyService.calculateImpactScore(pathology);
              
              return (
                <div 
                  key={pathology.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg text-slate-900">{pathology.name}</h4>
                        <StatusBadge status={pathology.status} size="sm" />
                        <Badge className={`${getSeverityColor(pathology.severity)} text-xs`}>
                          {getSeverityLabel(pathology.severity)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {pathology.icdCode && (
                          <p className="text-sm text-slate-600">
                            <strong>CID-10:</strong> {pathology.icdCode}
                          </p>
                        )}
                        
                        <p className="text-sm text-slate-600">
                          <strong>Diagnóstico:</strong> {new Date(pathology.diagnosisDate).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {pathology.affectedRegion && (
                          <p className="text-sm text-slate-600">
                            <strong>Região:</strong> {pathology.affectedRegion}
                          </p>
                        )}
                      </div>
                      
                      {pathology.description && (
                        <p className="text-sm text-slate-700 mt-2">{pathology.description}</p>
                      )}
                      
                      {pathology.treatmentPlan && (
                        <div className="mt-3 p-2 bg-health-info-50 rounded border border-health-info-200">
                          <p className="text-xs font-medium text-health-info-700 mb-1">
                            📋 Plano de Tratamento:
                          </p>
                          <p className="text-sm text-slate-700">{pathology.treatmentPlan}</p>
                        </div>
                      )}

                      {/* Score de Impacto */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">Impacto no Tratamento</span>
                          <span className="font-medium">{impactScore}%</span>
                        </div>
                        <Progress value={impactScore} className="h-1" />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(pathology)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pathology.id)}
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

