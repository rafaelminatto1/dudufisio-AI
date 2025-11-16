/**
 * components/patient/SurgeryManager.tsx
 * 
 * Componente para gerenciamento de cirurgias de pacientes
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Scissors, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { surgeryService } from '@/services/supabase/surgeryService';
import { Surgery } from '@/types';
import { toast } from 'sonner';

interface SurgeryManagerProps {
  patientId: string;
}

export function SurgeryManager({ patientId }: SurgeryManagerProps) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    surgeon: '',
    hospital: '',
    complications: '',
    recoveryTimeDays: '',
    notes: ''
  });

  useEffect(() => {
    loadSurgeries();
  }, [patientId]);

  const loadSurgeries = async () => {
    try {
      setLoading(true);
      const data = await surgeryService.getSurgeriesByPatient(patientId);
      setSurgeries(data);
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error);
      toast.error('Erro ao carregar cirurgias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (surgery?: Surgery) => {
    if (surgery) {
      setEditingSurgery(surgery);
      setFormData({
        name: surgery.name,
        date: surgery.date,
        description: surgery.description || '',
        surgeon: surgery.surgeon || '',
        hospital: surgery.hospital || '',
        complications: surgery.complications || '',
        recoveryTimeDays: surgery.recoveryTimeDays?.toString() || '',
        notes: surgery.notes || ''
      });
    } else {
      setEditingSurgery(null);
      setFormData({
        name: '',
        date: '',
        description: '',
        surgeon: '',
        hospital: '',
        complications: '',
        recoveryTimeDays: '',
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
        date: formData.date,
        description: formData.description || undefined,
        surgeon: formData.surgeon || undefined,
        hospital: formData.hospital || undefined,
        complications: formData.complications || undefined,
        recoveryTimeDays: formData.recoveryTimeDays ? parseInt(formData.recoveryTimeDays) : undefined,
        notes: formData.notes || undefined
      };

      if (editingSurgery) {
        await surgeryService.updateSurgery(editingSurgery.id, data);
        toast.success('Cirurgia atualizada com sucesso!');
      } else {
        await surgeryService.createSurgery({ ...data, patientId });
        toast.success('Cirurgia adicionada com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingSurgery(null);
      loadSurgeries();
    } catch (error: any) {
      console.error('Erro ao salvar cirurgia:', error);
      toast.error(error.message || 'Erro ao salvar cirurgia');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cirurgia?')) {
      try {
        await surgeryService.deleteSurgery(id);
        toast.success('Cirurgia excluída com sucesso!');
        loadSurgeries();
      } catch (error: any) {
        console.error('Erro ao excluir cirurgia:', error);
        toast.error(error.message || 'Erro ao excluir cirurgia');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-health-danger-500" />
          Cirurgias ({surgeries.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-health-primary-600 hover:bg-health-primary-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Cirurgia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSurgery ? 'Editar Cirurgia' : 'Nova Cirurgia'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Cirurgia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Artroscopia do Joelho"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data da Cirurgia *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="recoveryTimeDays">Tempo de Recuperação (dias)</Label>
                  <Input
                    id="recoveryTimeDays"
                    type="number"
                    value={formData.recoveryTimeDays}
                    onChange={(e) => setFormData({ ...formData, recoveryTimeDays: e.target.value })}
                    placeholder="Ex: 90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="surgeon">Cirurgião</Label>
                  <Input
                    id="surgeon"
                    value={formData.surgeon}
                    onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                    placeholder="Nome do cirurgião"
                  />
                </div>

                <div>
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input
                    id="hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    placeholder="Nome do hospital"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes da cirurgia"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="complications">Complicações</Label>
                <Textarea
                  id="complications"
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                  placeholder="Complicações observadas"
                  rows={2}
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
                  {editingSurgery ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Carregando...</p>
          </div>
        ) : surgeries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Scissors className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma cirurgia registrada</p>
            <p className="text-sm mt-1">Clique em "Nova Cirurgia" para adicionar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {surgeries.map((surgery) => {
              const { days, weeks, months } = surgeryService.calculateDaysSinceSurgery(surgery.date);
              const recoveryProgress = surgery.recoveryTimeDays 
                ? surgeryService.calculateRecoveryProgress(surgery)
                : 0;
              
              return (
                <div 
                  key={surgery.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-slate-900">{surgery.name}</h4>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {new Date(surgery.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <Badge variant="outline" className="text-xs">
                          {days} dias
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {weeks} semanas
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {months} meses
                        </Badge>
                      </div>

                      {surgery.surgeon && (
                        <p className="text-sm text-slate-600 mt-2">
                          <strong>Cirurgião:</strong> {surgery.surgeon}
                        </p>
                      )}
                      
                      {surgery.hospital && (
                        <p className="text-sm text-slate-600">
                          <strong>Hospital:</strong> {surgery.hospital}
                        </p>
                      )}
                      
                      {surgery.description && (
                        <p className="text-sm text-slate-700 mt-2">{surgery.description}</p>
                      )}
                      
                      {surgery.complications && (
                        <div className="mt-3 p-2 bg-health-warning-50 rounded border border-health-warning-200">
                          <p className="text-sm font-medium text-health-warning-700">
                            ⚠️ Complicações:
                          </p>
                          <p className="text-sm text-slate-700 mt-1">{surgery.complications}</p>
                        </div>
                      )}

                      {surgery.recoveryTimeDays && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-600">Progresso de Recuperação</span>
                            <span className="text-xs font-semibold text-health-primary-600">{recoveryProgress}%</span>
                          </div>
                          <Progress value={recoveryProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(surgery)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(surgery.id)}
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

