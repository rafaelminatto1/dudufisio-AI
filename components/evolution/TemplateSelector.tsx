/**
 * Componente: TemplateSelector
 * Seletor de templates de evolução salvos
 */

import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, Plus, Loader2, Trash2 } from 'lucide-react';
import { EvolutionTemplate } from '@/types';
import { getMyTemplates, deleteTemplate } from '@/services/evolutionTemplateService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TemplateSelectorProps {
  therapistId: string;
  onSelect: (template: EvolutionTemplate) => void;
  onCreateNew: () => void;
}

export function TemplateSelector({ therapistId, onSelect, onCreateNew }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<EvolutionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [therapistId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getMyTemplates(therapistId);
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Meus Templates
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCreateNew}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Novo
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              Nenhum template salvo ainda
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Crie templates para agilizar evoluções recorrentes
            </p>
            <Button
              type="button"
              onClick={onCreateNew}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="hover:shadow-md transition-shadow cursor-pointer group relative"
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                      {template.name}
                    </h4>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.conducts?.length || 0}
                        </Badge>
                        condutas
                      </span>
                      <span className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.exercises?.length || 0}
                        </Badge>
                        exercícios
                      </span>
                      <span className="text-primary font-medium">
                        Usado {template.usage_count}x
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(template.id);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

