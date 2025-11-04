import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Patient } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface QuickAddPatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, 'id' | 'code' | 'age' | 'bmi' | 'created_at' | 'updated_at'>) => Promise<Patient>;
  onSelectPatient: (patient: Patient) => void;
}

const QuickAddPatientDialog: React.FC<QuickAddPatientDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onSelectPatient
}) => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    birthDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      showToast('Nome e telefone são obrigatórios', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const newPatient = await onSave({
        name: formData.name,
        cpf: formData.cpf,
        phone: formData.phone,
        email: formData.email || undefined,
        birthDate: formData.birthDate || undefined,
        address: {
          street: '',
          city: '',
          state: '',
          zip: ''
        },
        emergencyContact: {
          name: '',
          phone: ''
        },
        status: 'Active' as const,
        registrationDate: new Date().toISOString(),
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
        whatsappConsent: 'opt-out' as const,
        consentGiven: false,
        lastVisit: new Date().toISOString()
      });

      showToast('Paciente cadastrado com sucesso!', 'success');
      onSelectPatient(newPatient);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        birthDate: ''
      });
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      showToast('Erro ao cadastrar paciente', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Cadastro Rápido de Paciente
          </DialogTitle>
          <DialogDescription>
            Cadastre um paciente rapidamente para prosseguir com o agendamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo do paciente"
              required
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
              placeholder="000.000.000-00"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Você poderá completar o cadastro posteriormente na página de pacientes.
            </p>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !formData.name || !formData.phone}>
              {isSaving ? 'Cadastrando...' : 'Cadastrar e Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddPatientDialog;

