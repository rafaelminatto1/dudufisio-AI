'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { createSOAPNote, updateSOAPNote } from '../actions';

interface SOAPFormProps {
  treatment?: any;
  initialNotes?: any[];
  onNoteAdded?: () => void;
}

type SOAPNote = {
  id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at: string;
  isPending?: boolean;
};

type OptimisticAction =
  | { type: 'create'; note: SOAPNote }
  | { type: 'update'; note: SOAPNote };

export function SOAPForm({ treatment, initialNotes = [], onNoteAdded }: SOAPFormProps) {
  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [isPending, startTransition] = useTransition();

  // React 19 useOptimistic - Atualização instantânea
  const [optimisticNotes, updateOptimisticNotes] = useOptimistic(
    initialNotes,
    (state: SOAPNote[], action: OptimisticAction) => {
      switch (action.type) {
        case 'create':
          return [{ ...action.note, isPending: true }, ...state];
        case 'update':
          return state.map((note) =>
            note.id === action.note.id ? { ...action.note, isPending: true } : note
          );
        default:
          return state;
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!treatment?.id) {
      alert('Selecione um tratamento primeiro');
      return;
    }

    // Criar nota temporária para UI otimista
    const tempNote: SOAPNote = {
      id: `temp-${Date.now()}`,
      subjective: formData.subjective,
      objective: formData.objective,
      assessment: formData.assessment,
      plan: formData.plan,
      created_at: new Date().toISOString(),
    };

    // 1. Atualização otimista - UI atualiza IMEDIATAMENTE
    startTransition(() => {
      updateOptimisticNotes({ type: 'create', note: tempNote });
    });

    // 2. Limpar formulário imediatamente (melhor UX)
    setFormData({
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    });

    // 3. Salvar no servidor
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('treatment_id', treatment.id);
      formDataToSend.append('subjective', formData.subjective);
      formDataToSend.append('objective', formData.objective);
      formDataToSend.append('assessment', formData.assessment);
      formDataToSend.append('plan', formData.plan);

      const result = await createSOAPNote(formDataToSend);

      if (!result.success) {
        // React reverte automaticamente
        alert(result.error || 'Erro ao salvar evolução');
        // Restaurar dados no formulário
        setFormData({
          subjective: formData.subjective,
          objective: formData.objective,
          assessment: formData.assessment,
          plan: formData.plan,
        });
        return;
      }

      // Sucesso - callback opcional
      onNoteAdded?.();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar evolução');
      // Restaurar dados
      setFormData({
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Lista de notas salvas */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {optimisticNotes.map((note) => (
          <div
            key={note.id}
            className={`p-3 rounded-md border ${
              note.isPending ? 'opacity-60 bg-muted' : 'bg-background'
            } transition-opacity`}
          >
            <div className="text-xs text-muted-foreground mb-2">
              {new Date(note.created_at).toLocaleString('pt-BR')}
              {note.isPending && ' (Salvando...)'}
            </div>
            <div className="space-y-1 text-sm">
              {note.subjective && (
                <div>
                  <strong>S:</strong> {note.subjective}
                </div>
              )}
              {note.objective && (
                <div>
                  <strong>O:</strong> {note.objective}
                </div>
              )}
              {note.assessment && (
                <div>
                  <strong>A:</strong> {note.assessment}
                </div>
              )}
              {note.plan && (
                <div>
                  <strong>P:</strong> {note.plan}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
        <div>
          <Label htmlFor="subjective">Subjetivo (S)</Label>
          <Textarea
            id="subjective"
            placeholder="Queixas e relatos do paciente..."
            value={formData.subjective}
            onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
            rows={3}
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor="objective">Objetivo (O)</Label>
          <Textarea
            id="objective"
            placeholder="Achados objetivos da avaliação..."
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            rows={3}
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor="assessment">Avaliação (A)</Label>
          <Textarea
            id="assessment"
            placeholder="Análise e interpretação..."
            value={formData.assessment}
            onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
            rows={3}
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor="plan">Plano (P)</Label>
          <Textarea
            id="plan"
            placeholder="Plano de tratamento..."
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            rows={3}
            disabled={isPending}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending || !treatment}>
          {isPending ? 'Salvando...' : 'Salvar Evolução'}
        </Button>
      </form>
    </div>
  );
}

