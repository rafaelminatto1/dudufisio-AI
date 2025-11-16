import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as surgeryService from '../../services/surgeryService';
import { Surgery } from '../../types';

/**
 * Modal CRUD para cirurgias
 * Formulário completo: nome, data, descrição, cirurgião, hospital, complicações
 */

interface SurgeryFormModalProps {
  isOpen: boolean;
  patientId: string;
  surgery?: Surgery | null;
  onClose: (refresh?: boolean) => void;
}

export const SurgeryFormModal: React.FC<SurgeryFormModalProps> = ({
  isOpen,
  patientId,
  surgery,
  onClose,
}) => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [surgeon, setSurgeon] = useState('');
  const [hospital, setHospital] = useState('');
  const [complications, setComplications] = useState('');
  const [recoveryTimeDays, setRecoveryTimeDays] = useState<number | undefined>();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (surgery) {
      setName(surgery.name || '');
      setDate(surgery.date || '');
      setDescription(surgery.description || '');
      setSurgeon(surgery.surgeon || '');
      setHospital(surgery.hospital || '');
      setComplications(surgery.complications || '');
      setRecoveryTimeDays(surgery.recoveryTimeDays);
      setNotes(surgery.notes || '');
    }
  }, [surgery]);

  const handleSave = async () => {
    // Validações
    if (!name.trim()) {
      showToast('Nome da cirurgia é obrigatório', 'error');
      return;
    }

    if (!date) {
      showToast('Data da cirurgia é obrigatória', 'error');
      return;
    }

    // Validar data não pode ser futura
    const surgeryDate = new Date(date);
    if (surgeryDate > new Date()) {
      showToast('Data da cirurgia não pode ser no futuro', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (surgery?.id) {
        // Update
        await surgeryService.updateSurgery(surgery.id, {
          name: name.trim(),
          date,
          description: description.trim() || undefined,
          surgeon: surgeon.trim() || undefined,
          hospital: hospital.trim() || undefined,
          complications: complications.trim() || undefined,
          recoveryTimeDays,
          notes: notes.trim() || undefined,
        });
        showToast('Cirurgia atualizada com sucesso', 'success');
      } else {
        // Create
        await surgeryService.addSurgery(patientId, {
          name: name.trim(),
          date,
          description: description.trim() || undefined,
          surgeon: surgeon.trim() || undefined,
          hospital: hospital.trim() || undefined,
          complications: complications.trim() || undefined,
          recoveryTimeDays,
          notes: notes.trim() || undefined,
        });
        showToast('Cirurgia adicionada com sucesso', 'success');
      }

      onClose(true); // Fecha e sinaliza para refresh
    } catch (error: any) {
      console.error('Erro ao salvar cirurgia:', error);
      showToast(error.message || 'Erro ao salvar cirurgia', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {surgery ? 'Editar Cirurgia' : 'Nova Cirurgia'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose(false)}
            className="h-8 w-8 p-0"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Cirurgia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Reconstrução de LCA"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data da Cirurgia <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Cirurgião */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cirurgião
            </label>
            <input
              type="text"
              value={surgeon}
              onChange={(e) => setSurgeon(e.target.value)}
              placeholder="Ex: Dr. João Silva"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hospital
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="Ex: Hospital Albert Einstein"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do procedimento cirúrgico..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Complicações */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Complicações
            </label>
            <textarea
              value={complications}
              onChange={(e) => setComplications(e.target.value)}
              placeholder="Caso tenha ocorrido alguma complicação..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Tempo de Recuperação */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tempo de Recuperação Previsto (dias)
            </label>
            <input
              type="number"
              value={recoveryTimeDays || ''}
              onChange={(e) => setRecoveryTimeDays(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Ex: 180"
              min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClose(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurgeryFormModal;

