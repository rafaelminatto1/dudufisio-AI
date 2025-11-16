import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, AlertCircle, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScheduleBlock, ScheduleBlockType, Therapist } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { blockService } from '../../services/scheduling/blockService';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface ScheduleBlocksManagerProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: Therapist[];
  onUpdate: () => void;
}

const BLOCK_TYPES: { value: ScheduleBlockType; label: string; color: string }[] = [
  { value: 'ferias', label: 'Férias', color: 'bg-blue-100 text-blue-700' },
  { value: 'almoco', label: 'Almoço', color: 'bg-orange-100 text-orange-700' },
  { value: 'ausencia', label: 'Ausência', color: 'bg-red-100 text-red-700' },
  { value: 'feriado', label: 'Feriado', color: 'bg-purple-100 text-purple-700' },
  { value: 'treinamento', label: 'Treinamento', color: 'bg-green-100 text-green-700' },
  { value: 'outro', label: 'Outro', color: 'bg-slate-100 text-slate-700' }
];

const ScheduleBlocksManager: React.FC<ScheduleBlocksManagerProps> = ({
  isOpen,
  onClose,
  therapists,
  onUpdate
}) => {
  const { showToast } = useToast();
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    therapistId: therapists[0]?.id || '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '18:00',
    blockType: 'ausencia' as ScheduleBlockType,
    reason: '',
    isRecurring: false,
    recurrenceFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurrenceDays: [] as number[],
    recurrenceEndDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadBlocks();
    }
  }, [isOpen]);

  const loadBlocks = async () => {
    setIsLoading(true);
    try {
      const data = await blockService.listBlocks();
      setBlocks(data);
    } catch (error) {
      console.error('Erro ao carregar bloqueios:', error);
      showToast('Falha ao carregar bloqueios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBlock = async () => {
    if (!formData.therapistId) {
      showToast('Selecione um terapeuta', 'error');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      showToast('Preencha as datas de início e fim', 'error');
      return;
    }

    try {
      setIsCreating(true);

      const startTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endTime <= startTime) {
        showToast('Horário de término deve ser posterior ao início', 'error');
        return;
      }

      const blockInput = {
        therapistId: formData.therapistId,
        startTime,
        endTime,
        reason: formData.reason || undefined,
        blockType: formData.blockType,
        recurrenceRule: formData.isRecurring ? {
          frequency: formData.recurrenceFrequency,
          days: formData.recurrenceDays,
          until: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : undefined
        } : undefined
      };

      await blockService.createBlock(blockInput);
      showToast('Bloqueio criado com sucesso!', 'success');
      onUpdate();
      loadBlocks();
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Falha ao criar bloqueio', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este bloqueio?')) return;

    try {
      await blockService.deleteBlock(id);
      showToast('Bloqueio removido com sucesso!', 'success');
      onUpdate();
      loadBlocks();
    } catch (error) {
      showToast('Falha ao remover bloqueio', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      therapistId: therapists[0]?.id || '',
      startDate: '',
      startTime: '08:00',
      endDate: '',
      endTime: '18:00',
      blockType: 'ausencia',
      reason: '',
      isRecurring: false,
      recurrenceFrequency: 'weekly',
      recurrenceDays: [],
      recurrenceEndDate: ''
    });
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  const getBlockTypeLabel = (type: ScheduleBlockType) => {
    return BLOCK_TYPES.find(t => t.value === type)?.label || type;
  };

  const getBlockTypeColor = (type: ScheduleBlockType) => {
    return BLOCK_TYPES.find(t => t.value === type)?.color || 'bg-slate-100 text-slate-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gerenciar Bloqueios de Agenda
          </DialogTitle>
          <DialogDescription>
            Configure bloqueios para férias, almoço, ausências e outros eventos
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Create Form */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-slate-900">Criar Novo Bloqueio</h3>

            {/* Therapist */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Terapeuta <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.therapistId}
                onChange={(e) => setFormData(prev => ({ ...prev, therapistId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">Selecione um terapeuta</option>
                {therapists.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Dates and Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Início <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hora Início <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Fim <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hora Fim <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            {/* Block Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Bloqueio <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.blockType}
                onChange={(e) => setFormData(prev => ({ ...prev, blockType: e.target.value as ScheduleBlockType }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              >
                {BLOCK_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motivo
              </label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={2}
                placeholder="Descreva o motivo do bloqueio..."
                className="resize-none"
              />
            </div>

            {/* Recurring */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-slate-700">Bloqueio Recorrente</span>
              </label>

              {formData.isRecurring && (
                <div className="mt-3 space-y-3 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Frequência
                    </label>
                    <select
                      value={formData.recurrenceFrequency}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        recurrenceFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>

                  {formData.recurrenceFrequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Dias da Semana
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
                              formData.recurrenceDays.includes(day.value)
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data de Término da Recorrência
                    </label>
                    <Input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateBlock}
              disabled={isCreating}
              className="w-full bg-sky-500 hover:bg-sky-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Criando...' : 'Criar Bloqueio'}
            </Button>
          </div>

          {/* Existing Blocks */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Bloqueios Existentes</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                <p className="mt-2">Carregando...</p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhum bloqueio cadastrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map(block => {
                  const therapist = therapists.find(t => t.id === block.therapistId);
                  return (
                    <div
                      key={block.id}
                      className="p-4 bg-white border border-slate-200 rounded-lg hover:border-sky-300 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getBlockTypeColor(block.blockType)}>
                              {getBlockTypeLabel(block.blockType)}
                            </Badge>
                            <span className="font-semibold text-slate-900">
                              {therapist?.name || 'Terapeuta não encontrado'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {format(block.startTime, "dd/MM/yyyy 'de' HH:mm", { locale: ptBR })}
                                {' até '}
                                {format(block.endTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            
                            {block.reason && (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                                <span className="text-xs italic">{block.reason}</span>
                              </div>
                            )}

                            {block.recurrenceRule && (
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="w-3 h-3" />
                                <span>Recorrente: {block.recurrenceRule.frequency}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleBlocksManager;

