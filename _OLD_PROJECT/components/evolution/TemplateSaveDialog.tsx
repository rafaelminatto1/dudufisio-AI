/**
 * Componente: TemplateSaveDialog
 * Dialog para salvar evolução atual como template
 */

import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { CreateTemplateData } from '@/types';
import { createTemplate } from '@/services/evolutionTemplateService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';

interface TemplateSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistId: string;
  templateData: Omit<CreateTemplateData, 'name' | 'description'>;
  onSuccess?: () => void;
}

export function TemplateSaveDialog({
  open,
  onOpenChange,
  therapistId,
  templateData,
  onSuccess
}: TemplateSaveDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Digite um nome para o template', 'error');
      return;
    }

    try {
      setSaving(true);
      
      await createTemplate(therapistId, {
        ...templateData,
        name: name.trim(),
        description: description.trim() || undefined
      });

      showToast('Template salvo com sucesso!', 'success');
      
      // Reset e fechar
      setName('');
      setDescription('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      showToast('Erro ao salvar template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Salvar como Template
          </DialogTitle>
          <DialogDescription>
            Salve esta evolução como template para reutilizar em futuros atendimentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome do template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Nome do Template <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="Ex: Lombalgia Aguda, Pós-op Joelho..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>

          {/* Descrição (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="template-description">
              Descrição (opcional)
            </Label>
            <Textarea
              id="template-description"
              placeholder="Descreva quando usar este template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>

          {/* Preview do que será salvo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              O que será salvo:
            </p>
            <div className="space-y-1 text-sm text-blue-700">
              {templateData.subjective_template && (
                <p>✓ Texto da avaliação subjetiva</p>
              )}
              {templateData.objective_template && (
                <p>✓ Texto da avaliação objetiva</p>
              )}
              {templateData.assessment_template && (
                <p>✓ Texto da avaliação/análise</p>
              )}
              {templateData.conducts && templateData.conducts.length > 0 && (
                <p>✓ {templateData.conducts.length} conduta(s) estruturada(s)</p>
              )}
              {templateData.exercises && templateData.exercises.length > 0 && (
                <p>✓ {templateData.exercises.length} exercício(s) prescrito(s)</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

