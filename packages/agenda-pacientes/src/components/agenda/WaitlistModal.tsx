import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Patient, Therapist, WaitlistEntry } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  patients: Patient[];
  therapists: Therapist[];
  initialPatientId?: string;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  therapists,
  initialPatientId
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: initialPatientId || '',
    therapistId: '',
    preferredStartFrom: '',
    preferredStartTo: '',
    urgency: '3' as string,
    notes: '',
    status: 'waiting' as const
  });

  useEffect(() => {
    if (initialPatientId) {
      setFormData(prev => ({ ...prev, patientId: initialPatientId }));
    }
  }, [initialPatientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      showToast('Selecione um paciente', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const entryData = {
        patientId: formData.patientId,
        therapistId: formData.therapistId || undefined,
        preferredStartFrom: formData.preferredStartFrom ? new Date(formData.preferredStartFrom) : undefined,
        preferredStartTo: formData.preferredStartTo ? new Date(formData.preferredStartTo) : undefined,
        urgency: parseInt(formData.urgency) as 1 | 2 | 3 | 4 | 5,
        notes: formData.notes,
        status: formData.status
      };

      await onSave(entryData);
      showToast('Paciente adicionado à lista de espera', 'success');
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        therapistId: '',
        preferredStartFrom: '',
        preferredStartTo: '',
        urgency: '3',
        notes: '',
        status: 'waiting'
      });
    } catch (error) {
      console.error('Erro ao adicionar à lista de espera:', error);
      showToast('Erro ao adicionar à lista de espera', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.patientId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Adicionar à Lista de Espera
          </DialogTitle>
          <DialogDescription>
            Adicione um paciente à lista de espera para ser notificado quando houver vagas disponíveis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paciente */}
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente *</Label>
            <Select value={formData.patientId} onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Terapeuta (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="therapist">Terapeuta (opcional)</Label>
            <Select value={formData.therapistId || 'any'} onValueChange={(value) => setFormData(prev => ({ ...prev, therapistId: value === 'any' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Qualquer terapeuta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer terapeuta</SelectItem>
                {therapists.map((therapist) => (
                  <SelectItem key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período preferido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startFrom">Data inicial</Label>
              <Input
                id="startFrom"
                type="date"
                value={formData.preferredStartFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredStartFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTo">Data final</Label>
              <Input
                id="startTo"
                type="date"
                value={formData.preferredStartTo}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredStartTo: e.target.value }))}
              />
            </div>
          </div>

          {/* Urgência */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgência</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Muito Baixa</SelectItem>
                <SelectItem value="2">2 - Baixa</SelectItem>
                <SelectItem value="3">3 - Média</SelectItem>
                <SelectItem value="4">4 - Alta</SelectItem>
                <SelectItem value="5">5 - Muito Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o paciente..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.patientId}>
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
