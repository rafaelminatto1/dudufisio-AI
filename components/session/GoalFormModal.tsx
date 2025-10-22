import React, { useState, useEffect } from 'react';
import { X, Save, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as patientGoalsService from '../../services/patientGoalsService';
import { PatientGoal } from '../../types';

/**
 * Modal CRUD para objetivos do paciente
 * Formulário completo com calculadora de progresso
 * Validação de datas
 */

interface GoalFormModalProps {
  isOpen: boolean;
  patientId: string;
  goal?: PatientGoal | null;
  onClose: (refresh?: boolean) => void;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  patientId,
  goal,
  onClose,
}) => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PatientGoal['category']>('recovery');
  const [targetDate, setTargetDate] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState<PatientGoal['priority']>('medium');
  const [status, setStatus] = useState<PatientGoal['status']>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category);
      setTargetDate(goal.targetDate || '');
      setTargetValue(goal.targetValue || '');
      setCurrentValue(goal.currentValue || '');
      setCurrentProgress(goal.currentProgress || 0);
      setUnit(goal.unit || '');
      setPriority(goal.priority);
      setStatus(goal.status);
      setNotes(goal.notes || '');
    }
  }, [goal]);

  const handleSave = async () => {
    // Validações
    if (!title.trim()) {
      showToast('Título do objetivo é obrigatório', 'error');
      return;
    }

    if (targetDate) {
      const target = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (target < today) {
        showToast('Data alvo não pode ser no passado', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      if (goal?.id) {
        // Update
        await patientGoalsService.updateGoal(goal.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          targetDate: targetDate || undefined,
          targetValue: targetValue.trim() || undefined,
          currentValue: currentValue.trim() || undefined,
          currentProgress,
          unit: unit.trim() || undefined,
          priority,
          status,
          notes: notes.trim() || undefined,
        });
        showToast('Objetivo atualizado com sucesso', 'success');
      } else {
        // Create
        await patientGoalsService.addGoal(patientId, {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          targetDate: targetDate || undefined,
          targetValue: targetValue.trim() || undefined,
          currentValue: currentValue.trim() || undefined,
          currentProgress,
          unit: unit.trim() || undefined,
          priority,
          status,
          notes: notes.trim() || undefined,
        });
        showToast('Objetivo adicionado com sucesso', 'success');
      }

      onClose(true);
    } catch (error: any) {
      console.error('Erro ao salvar objetivo:', error);
      showToast(error.message || 'Erro ao salvar objetivo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              {goal ? 'Editar Objetivo' : 'Novo Objetivo'}
            </h2>
          </div>
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
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título do Objetivo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Correr 1km em 2 minutos na Prova TAF"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
              placeholder="Detalhes adicionais sobre o objetivo..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Categoria e Prioridade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PatientGoal['category'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              >
                <option value="performance">Desempenho</option>
                <option value="recovery">Recuperação</option>
                <option value="fitness">Condicionamento</option>
                <option value="lifestyle">Estilo de Vida</option>
                <option value="medical">Médico</option>
                <option value="mobility">Mobilidade</option>
                <option value="strength">Força</option>
                <option value="pain_reduction">Redução de Dor</option>
                <option value="functional">Funcional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PatientGoal['priority'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          {/* Data Alvo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data Alvo
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isSaving}
            />
            {targetDate && (
              <p className="text-xs text-slate-600 mt-1">
                {patientGoalsService.calculateCountdown(targetDate).formatted}
              </p>
            )}
          </div>

          {/* Valores Alvo e Atual */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor Alvo
              </label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Ex: 1km"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor Atual
              </label>
              <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Ex: 500m"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unidade
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ex: metros"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Progresso Manual */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Progresso Manual (%)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(Number(e.target.value))}
                className="flex-1"
                disabled={isSaving}
              />
              <div className="w-16 text-center">
                <span className="text-xl font-bold text-blue-600">{currentProgress}</span>
                <span className="text-xs text-slate-500">%</span>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PatientGoal['status'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isSaving}
            >
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="paused">Pausado</option>
              <option value="cancelled">Cancelado</option>
              <option value="archived">Arquivado</option>
            </select>
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

export default GoalFormModal;

