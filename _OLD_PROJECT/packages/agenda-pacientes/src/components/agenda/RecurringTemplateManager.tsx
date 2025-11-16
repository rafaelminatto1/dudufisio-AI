import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Save, Trash2, Play, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useToast } from '../../contexts/ToastContext';
import { RecurrenceTemplate, Therapist } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface RecurringTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: Therapist[];
  onApplyTemplate: (templateId: string) => void;
}

const RecurringTemplateManager: React.FC<RecurringTemplateManagerProps> = ({
  isOpen,
  onClose,
  therapists,
  onApplyTemplate
}) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<RecurrenceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RecurrenceTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    days: [] as number[],
    startTime: '08:00',
    endTime: '09:00',
    therapistId: therapists[0]?.id || ''
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await recurrenceTemplateService.listTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      showToast('Falha ao carregar templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.title) {
      showToast('Digite um nome para o template', 'error');
      return;
    }

    if (formData.days.length === 0) {
      showToast('Selecione pelo menos um dia', 'error');
      return;
    }

    try {
      setIsCreating(true);
      const template: RecurrenceTemplate = {
        id: `template_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        recurrenceRule: {
          frequency: formData.frequency,
          days: formData.days,
          until: ''
        },
        startTime: formData.startTime,
        endTime: formData.endTime,
        therapistId: formData.therapistId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await recurrenceTemplateService.saveTemplate(template);
      showToast('Template criado com sucesso!', 'success');
      loadTemplates();
      resetForm();
    } catch (error) {
      showToast('Falha ao criar template', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      await recurrenceTemplateService.deleteTemplate(id);
      showToast('Template removido com sucesso!', 'success');
      loadTemplates();
    } catch (error) {
      showToast('Falha ao remover template', 'error');
    }
  };

  const handlePreview = (template: RecurrenceTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleApply = (templateId: string) => {
    onApplyTemplate(templateId);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      frequency: 'weekly',
      days: [],
      startTime: '08:00',
      endTime: '09:00',
      therapistId: therapists[0]?.id || ''
    });
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }));
  };

  const DAYS = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gerenciar Templates de Horários
            </DialogTitle>
            <DialogDescription>
              Crie templates para agendamentos recorrentes e aplique com um clique
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Create Form */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-4">
              <h3 className="font-semibold text-slate-900">Criar Novo Template</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Template <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Pilates - Terças e Quintas 14h"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do template"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Frequência
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Terapeuta
                  </label>
                  <select
                    value={formData.therapistId}
                    onChange={(e) => setFormData(prev => ({ ...prev, therapistId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  >
                    {therapists.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Horário Início
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Horário Fim
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dias da Semana <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        formData.days.includes(day.value)
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateTemplate}
                disabled={isCreating}
                className="w-full bg-sky-500 hover:bg-sky-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? 'Criando...' : 'Criar Template'}
              </Button>
            </div>

            {/* Templates List */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Templates Existentes</h3>
              
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  <p className="mt-2">Carregando...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Nenhum template cadastrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map(template => {
                    const therapist = therapists.find(t => t.id === template.therapistId);
                    return (
                      <Card key={template.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-900">{template.title}</h4>
                              <Badge variant="secondary">{template.recurrenceRule.frequency}</Badge>
                            </div>
                            {template.description && (
                              <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{template.startTime} - {template.endTime}</span>
                              </div>
                              {therapist && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{therapist.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {(template.recurrenceRule.days || []).map(d => DAYS[d]?.label).join(', ')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(template)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApply(template.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Aplicar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {showPreview && selectedTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview do Template</DialogTitle>
              <DialogDescription>
                Visualize como este template será aplicado
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">{selectedTemplate.title}</h4>
                {selectedTemplate.description && (
                  <p className="text-sm text-slate-600 mb-3">{selectedTemplate.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Horário:</span> {selectedTemplate.startTime} - {selectedTemplate.endTime}
                  </div>
                  <div>
                    <span className="font-medium">Frequência:</span> {selectedTemplate.recurrenceRule.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Dias:</span> {(selectedTemplate.recurrenceRule.days || []).map(d => DAYS[d]?.label).join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Terapeuta:</span> {therapists.find(t => t.id === selectedTemplate.therapistId)?.name}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Este template criará agendamentos recorrentes nos dias e horários especificados.
                  Você poderá editar cada ocorrência individualmente após a criação.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                handleApply(selectedTemplate.id);
                setShowPreview(false);
              }}>
                Aplicar Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default RecurringTemplateManager;

