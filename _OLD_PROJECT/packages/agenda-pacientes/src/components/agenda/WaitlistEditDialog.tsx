import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { WaitlistEntry, Patient, Therapist } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface WaitlistEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: WaitlistEntry | null;
  patients: Patient[];
  therapists: Therapist[];
  onUpdate: () => void;
}

const WaitlistEditDialog: React.FC<WaitlistEditDialogProps> = ({
  isOpen,
  onClose,
  entry,
  patients,
  therapists,
  onUpdate
}) => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    urgency: 3,
    noShowRisk: 0,
    therapistId: '',
    preferredStartFrom: '',
    preferredStartTo: '',
    preferredDays: [] as number[],
    preferredTimeRanges: [] as { start: string; end: string }[],
    notes: ''
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        urgency: entry.urgency || 3,
        noShowRisk: entry.noShowRisk || 0,
        therapistId: entry.therapistId || '',
        preferredStartFrom: entry.preferredStartFrom 
          ? new Date(entry.preferredStartFrom).toISOString().split('T')[0]
          : '',
        preferredStartTo: entry.preferredStartTo 
          ? new Date(entry.preferredStartTo).toISOString().split('T')[0]
          : '',
        preferredDays: entry.preferredDays || [],
        preferredTimeRanges: entry.preferredTimeRanges || [],
        notes: entry.notes || ''
      });
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry) return;

    try {
      setIsSaving(true);

      const updates: any = {
        urgency: formData.urgency,
        noShowRisk: formData.noShowRisk,
        therapistId: formData.therapistId || undefined,
        notes: formData.notes || undefined,
      };

      if (formData.preferredStartFrom) {
        updates.preferredStartFrom = new Date(formData.preferredStartFrom);
      }

      if (formData.preferredStartTo) {
        updates.preferredStartTo = new Date(formData.preferredStartTo);
      }

      if (formData.preferredDays.length > 0) {
        updates.preferredDays = formData.preferredDays;
      }

      if (formData.preferredTimeRanges.length > 0) {
        updates.preferredTimeRanges = formData.preferredTimeRanges;
      }

      await waitlistService.updateEntry(entry.id, updates);
      showToast('Entrada da lista de espera atualizada com sucesso!', 'success');
      onUpdate();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Falha ao atualizar entrada', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const addTimeRange = () => {
    setFormData(prev => ({
      ...prev,
      preferredTimeRanges: [...prev.preferredTimeRanges, { start: '08:00', end: '12:00' }]
    }));
  };

  const updateTimeRange = (index: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTimeRanges: prev.preferredTimeRanges.map((range, i) =>
        i === index ? { ...range, [field]: value } : range
      )
    }));
  };

  const removeTimeRange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferredTimeRanges: prev.preferredTimeRanges.filter((_, i) => i !== index)
    }));
  };

  if (!entry) return null;

  const patient = patients.find(p => p.id === entry.patientId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Editar Entrada da Lista de Espera
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Patient Info */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">Paciente</div>
            <div className="font-semibold text-slate-900">{patient?.name || 'Paciente não encontrado'}</div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Urgência <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="1">1 - Baixa</option>
              <option value="2">2 - Baixa-Média</option>
              <option value="3">3 - Média</option>
              <option value="4">4 - Alta</option>
              <option value="5">5 - Crítica</option>
            </select>
          </div>

          {/* No-Show Risk */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Risco de Faltar (0-10)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.noShowRisk}
              onChange={(e) => setFormData(prev => ({ ...prev, noShowRisk: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-sm text-slate-600 mt-1">
              Valor: {formData.noShowRisk}/10
            </div>
          </div>

          {/* Therapist */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Terapeuta Preferido
            </label>
            <select
              value={formData.therapistId}
              onChange={(e) => setFormData(prev => ({ ...prev, therapistId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Qualquer terapeuta</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Preferred Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data Inicial
              </label>
              <Input
                type="date"
                value={formData.preferredStartFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredStartFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data Final
              </label>
              <Input
                type="date"
                value={formData.preferredStartTo}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredStartTo: e.target.value }))}
              />
            </div>
          </div>

          {/* Preferred Days */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dias Preferidos
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 0, label: 'Dom' },
                { value: 1, label: 'Seg' },
                { value: 2, label: 'Ter' },
                { value: 3, label: 'Qua' },
                { value: 4, label: 'Qui' },
                { value: 5, label: 'Sex' },
                { value: 6, label: 'Sáb' }
              ].map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    formData.preferredDays.includes(day.value)
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Time Ranges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Horários Preferidos
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeRange}
              >
                + Adicionar Horário
              </Button>
            </div>
            <div className="space-y-2">
              {formData.preferredTimeRanges.map((range, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={range.start}
                    onChange={(e) => updateTimeRange(index, 'start', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-slate-600">até</span>
                  <Input
                    type="time"
                    value={range.end}
                    onChange={(e) => updateTimeRange(index, 'end', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeRange(index)}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              {formData.preferredTimeRanges.length === 0 && (
                <div className="text-sm text-slate-500 italic">
                  Nenhum horário específico definido
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Observações sobre esta entrada..."
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-sky-500 hover:bg-sky-600">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistEditDialog;

