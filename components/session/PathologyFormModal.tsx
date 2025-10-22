import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as pathologyService from '../../services/pathologyService';
import { Pathology } from '../../types';

/**
 * Modal CRUD para patologias
 * Formulário: nome, CID, data diagnóstico, severidade, região, status
 */

interface PathologyFormModalProps {
  isOpen: boolean;
  patientId: string;
  pathology?: Pathology | null;
  onClose: (refresh?: boolean) => void;
}

export const PathologyFormModal: React.FC<PathologyFormModalProps> = ({
  isOpen,
  patientId,
  pathology,
  onClose,
}) => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [status, setStatus] = useState<Pathology['status']>('active');
  const [severity, setSeverity] = useState<Pathology['severity']>('moderate');
  const [affectedRegion, setAffectedRegion] = useState('');
  const [description, setDescription] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (pathology) {
      setName(pathology.name || '');
      setIcdCode(pathology.icdCode || '');
      setDiagnosisDate(pathology.diagnosisDate || '');
      setStatus(pathology.status);
      setSeverity(pathology.severity || 'moderate');
      setAffectedRegion(pathology.affectedRegion || '');
      setDescription(pathology.description || '');
      setTreatmentPlan(pathology.treatmentPlan || '');
      setNotes(pathology.notes || '');
    }
  }, [pathology]);

  const handleSave = async () => {
    // Validações
    if (!name.trim()) {
      showToast('Nome da patologia é obrigatório', 'error');
      return;
    }

    if (!diagnosisDate) {
      showToast('Data do diagnóstico é obrigatória', 'error');
      return;
    }

    // Validar data não pode ser futura
    const diagDate = new Date(diagnosisDate);
    if (diagDate > new Date()) {
      showToast('Data do diagnóstico não pode ser no futuro', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (pathology?.id) {
        // Update
        await pathologyService.updatePathology(pathology.id, {
          name: name.trim(),
          icdCode: icdCode.trim() || undefined,
          diagnosisDate,
          status,
          severity,
          affectedRegion: affectedRegion.trim() || undefined,
          description: description.trim() || undefined,
          treatmentPlan: treatmentPlan.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        showToast('Patologia atualizada com sucesso', 'success');
      } else {
        // Create
        await pathologyService.addPathology(patientId, {
          name: name.trim(),
          icdCode: icdCode.trim() || undefined,
          diagnosisDate,
          status,
          severity,
          affectedRegion: affectedRegion.trim() || undefined,
          description: description.trim() || undefined,
          treatmentPlan: treatmentPlan.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        showToast('Patologia adicionada com sucesso', 'success');
      }

      onClose(true);
    } catch (error: any) {
      console.error('Erro ao salvar patologia:', error);
      showToast(error.message || 'Erro ao salvar patologia', 'error');
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
            {pathology ? 'Editar Patologia' : 'Nova Patologia'}
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
              Nome da Patologia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lesão do Ligamento Cruzado Anterior"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isSaving}
            />
          </div>

          {/* CID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código CID
            </label>
            <input
              type="text"
              value={icdCode}
              onChange={(e) => setIcdCode(e.target.value)}
              placeholder="Ex: M23.6"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Data e Região */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data do Diagnóstico <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={diagnosisDate}
                onChange={(e) => setDiagnosisDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Região Afetada
              </label>
              <input
                type="text"
                value={affectedRegion}
                onChange={(e) => setAffectedRegion(e.target.value)}
                placeholder="Ex: Joelho direito"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Status e Severidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Pathology['status'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              >
                <option value="active">Em Tratamento</option>
                <option value="chronic">Crônica</option>
                <option value="monitoring">Em Monitoramento</option>
                <option value="resolved">Resolvida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Severidade
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Pathology['severity'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              >
                <option value="mild">Leve</option>
                <option value="moderate">Moderada</option>
                <option value="severe">Grave</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a patologia..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Plano de Tratamento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Plano de Tratamento
            </label>
            <textarea
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Objetivos e abordagem terapêutica..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
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

export default PathologyFormModal;

