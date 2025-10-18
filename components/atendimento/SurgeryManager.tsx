import React, { useState } from 'react';
import { Surgery } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar, CalendarDays, Edit, Plus, Trash2, User, MapPin, AlertTriangle } from 'lucide-react';
import format from 'date-fns/format';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import { ptBR } from 'date-fns/locale';

interface SurgeryManagerProps {
  surgeries: Surgery[];
  onAddSurgery: (surgery: Omit<Surgery, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSurgery: (id: string, surgery: Partial<Surgery>) => void;
  onDeleteSurgery: (id: string) => void;
}

const SurgeryManager: React.FC<SurgeryManagerProps> = ({
  surgeries,
  onAddSurgery,
  onUpdateSurgery,
  onDeleteSurgery
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    surgeon: '',
    hospital: '',
    complications: '',
    recoveryTime: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: '',
      surgeon: '',
      hospital: '',
      complications: '',
      recoveryTime: ''
    });
  };

  const handleAddSurgery = () => {
    if (!formData.name || !formData.date) return;

    onAddSurgery({
      name: formData.name,
      date: formData.date,
      description: formData.description || undefined,
      surgeon: formData.surgeon || undefined,
      hospital: formData.hospital || undefined,
      complications: formData.complications || undefined,
      recoveryTime: formData.recoveryTime ? parseInt(formData.recoveryTime) : undefined
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditSurgery = (surgery: Surgery) => {
    setEditingSurgery(surgery);
    setFormData({
      name: surgery.name,
      date: surgery.date,
      description: surgery.description || '',
      surgeon: surgery.surgeon || '',
      hospital: surgery.hospital || '',
      complications: surgery.complications || '',
      recoveryTime: surgery.recoveryTime?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSurgery = () => {
    if (!editingSurgery || !formData.name || !formData.date) return;

    onUpdateSurgery(editingSurgery.id, {
      name: formData.name,
      date: formData.date,
      description: formData.description || undefined,
      surgeon: formData.surgeon || undefined,
      hospital: formData.hospital || undefined,
      complications: formData.complications || undefined,
      recoveryTime: formData.recoveryTime ? parseInt(formData.recoveryTime) : undefined
    });

    resetForm();
    setEditingSurgery(null);
    setIsEditDialogOpen(false);
  };

  const getTimeSinceSurgery = (surgeryDate: string) => {
    const surgery = new Date(surgeryDate);
    const now = new Date();
    
    const days = differenceInDays(now, surgery);
    const weeks = differenceInWeeks(now, surgery);
    const months = differenceInMonths(now, surgery);
    const years = differenceInYears(now, surgery);

    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} mês${months > 1 ? 'es' : ''}`;
    } else if (weeks > 0) {
      return `${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      return `${days} dia${days > 1 ? 's' : ''}`;
    }
  };

  const getRecoveryStatus = (surgery: Surgery) => {
    if (!surgery.recoveryTime) return null;
    
    const daysSince = differenceInDays(new Date(), new Date(surgery.date));
    const recoveryProgress = Math.min((daysSince / surgery.recoveryTime) * 100, 100);
    
    if (recoveryProgress >= 100) {
      return { status: 'completed', text: 'Recuperação completa', color: 'bg-green-100 text-green-800' };
    } else if (recoveryProgress >= 75) {
      return { status: 'almost', text: 'Quase recuperado', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'recovering', text: 'Em recuperação', color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <span>Histórico Cirúrgico</span>
            </CardTitle>
            <CardDescription>
              Cirurgias realizadas e tempo de recuperação
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cirurgia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Cirurgia</DialogTitle>
                <DialogDescription>
                  Adicione uma nova cirurgia ao histórico do paciente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Cirurgia *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Artroscopia do joelho"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Data da Cirurgia *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
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
                <div>
                  <Label htmlFor="recoveryTime">Tempo de Recuperação (dias)</Label>
                  <Input
                    id="recoveryTime"
                    type="number"
                    value={formData.recoveryTime}
                    onChange={(e) => setFormData({ ...formData, recoveryTime: e.target.value })}
                    placeholder="Ex: 30"
                  />
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
                    placeholder="Complicações ou observações"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSurgery}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {surgeries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma cirurgia registrada</p>
            <p className="text-sm">Adicione o histórico cirúrgico do paciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {surgeries.map((surgery) => {
              const timeSince = getTimeSinceSurgery(surgery.date);
              const recoveryStatus = getRecoveryStatus(surgery);
              
              return (
                <div key={surgery.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{surgery.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(surgery.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Há {timeSince}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {recoveryStatus && (
                        <Badge className={recoveryStatus.color}>
                          {recoveryStatus.text}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSurgery(surgery)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSurgery(surgery.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(surgery.surgeon || surgery.hospital) && (
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      {surgery.surgeon && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{surgery.surgeon}</span>
                        </div>
                      )}
                      {surgery.hospital && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{surgery.hospital}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {surgery.description && (
                    <p className="text-sm text-slate-600">{surgery.description}</p>
                  )}
                  
                  {surgery.complications && (
                    <div className="flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <span>{surgery.complications}</span>
                    </div>
                  )}
                  
                  {surgery.recoveryTime && (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Tempo de recuperação estimado:</span> {surgery.recoveryTime} dias
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cirurgia</DialogTitle>
            <DialogDescription>
              Atualize as informações da cirurgia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome da Cirurgia *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Artroscopia do joelho"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Data da Cirurgia *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-surgeon">Cirurgião</Label>
              <Input
                id="edit-surgeon"
                value={formData.surgeon}
                onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                placeholder="Nome do cirurgião"
              />
            </div>
            <div>
              <Label htmlFor="edit-hospital">Hospital</Label>
              <Input
                id="edit-hospital"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                placeholder="Nome do hospital"
              />
            </div>
            <div>
              <Label htmlFor="edit-recoveryTime">Tempo de Recuperação (dias)</Label>
              <Input
                id="edit-recoveryTime"
                type="number"
                value={formData.recoveryTime}
                onChange={(e) => setFormData({ ...formData, recoveryTime: e.target.value })}
                placeholder="Ex: 30"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes da cirurgia"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-complications">Complicações</Label>
              <Textarea
                id="edit-complications"
                value={formData.complications}
                onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                placeholder="Complicações ou observações"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateSurgery}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SurgeryManager;
