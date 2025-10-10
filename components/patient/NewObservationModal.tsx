import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '../ui/card';
import type { SessionObservation } from '../../types';
import { addObservation } from '../../services/patientTrackingService';

interface NewObservationModalProps {
  patientId: string;
  sessionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (observation: SessionObservation) => void;
}

export const NewObservationModal: React.FC<NewObservationModalProps> = ({
  patientId,
  sessionId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    observationType: 'general' as SessionObservation['observationType'],
    content: '',
    timing: 'independent' as SessionObservation['timing'],
    tags: [] as string[],
    tagInput: '',
    isImportant: false,
    isPinned: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('O conteúdo da observação é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const observation = await addObservation(patientId, {
        observationType: formData.observationType,
        content: formData.content,
        timing: formData.timing,
        tags: formData.tags,
        isImportant: formData.isImportant,
        isPinned: formData.isPinned,
        sessionId: sessionId
      });

      if (onSuccess) {
        onSuccess(observation);
      }

      // Reset form
      setFormData({
        observationType: 'general',
        content: '',
        timing: 'independent',
        tags: [],
        tagInput: '',
        isImportant: false,
        isPinned: false
      });

      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar observação:', err);
      setError(err.message || 'Erro ao salvar observação');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
        tagInput: ''
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-900">
            Nova Observação de Acompanhamento
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Tipo de Observação */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Observação *
            </label>
            <select
              value={formData.observationType}
              onChange={(e) => setFormData({ ...formData, observationType: e.target.value as any })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="general">Geral</option>
              <option value="clinical">Clínico</option>
              <option value="evolution">Evolução</option>
              <option value="assessment">Avaliação</option>
              <option value="alert">Alerta</option>
              <option value="recommendation">Recomendação</option>
            </select>
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
              placeholder="Descreva a observação..."
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.content.length} caracteres
            </p>
          </div>

          {/* Timing */}
          {sessionId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timing (quando foi observado)
              </label>
              <select
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value as any })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="before">Antes da sessão</option>
                <option value="during">Durante a sessão</option>
                <option value="after">Após a sessão</option>
                <option value="independent">Independente da sessão</option>
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite uma tag e pressione Enter"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!formData.tagInput.trim()}
              >
                Adicionar
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                Marcar como importante
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                Fixar no topo
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Observação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewObservationModal;

