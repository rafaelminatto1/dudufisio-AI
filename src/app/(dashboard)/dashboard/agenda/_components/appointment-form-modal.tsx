'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  patients: any[];
  therapists: any[];
  onSave: (data: any) => void;
  onConflict: (conflicts: any) => void;
}

export function AppointmentFormModal({
  open,
  onOpenChange,
  appointment,
  patients,
  therapists,
  onSave,
  onConflict,
}: AppointmentFormModalProps) {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || '',
    therapist_id: appointment?.therapist_id || '',
    start_time: appointment?.start_time ? new Date(appointment.start_time).toISOString().slice(0, 16) : '',
    end_time: appointment?.end_time ? new Date(appointment.end_time).toISOString().slice(0, 16) : '',
    status: appointment?.status || 'agendado',
  });

  useEffect(() => {
    if (appointment) {
      // Usar setTimeout para evitar chamada síncrona de setState
      setTimeout(() => {
        setFormData({
          patient_id: appointment.patient_id || '',
          therapist_id: appointment.therapist_id || '',
          start_time: new Date(appointment.start_time).toISOString().slice(0, 16),
          end_time: new Date(appointment.end_time).toISOString().slice(0, 16),
          status: appointment.status || 'agendado',
        });
      }, 0);
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('patient_id', formData.patient_id);
    data.append('therapist_id', formData.therapist_id);
    data.append('start_time', new Date(formData.start_time).toISOString());
    data.append('end_time', new Date(formData.end_time).toISOString());
    data.append('status', formData.status);

    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {appointment ? 'Edite os dados do agendamento' : 'Preencha os dados para criar um novo agendamento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_id">Paciente</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="therapist_id">Terapeuta</Label>
              <Select
                value={formData.therapist_id}
                onValueChange={(value) => setFormData({ ...formData, therapist_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o terapeuta" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map((therapist) => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.users?.full_name || `Terapeuta ${therapist.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Data/Hora Início</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_time">Data/Hora Fim</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="falta">Falta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

