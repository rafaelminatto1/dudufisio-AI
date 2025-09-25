import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit3, Trash2, Play, Pause, Eye, Save, X, Search,
  Clock, Filter, MessageSquare, Mail, Smartphone, Bell,
  Calendar, User, DollarSign, Activity, AlertCircle,
  CheckCircle, Settings, Zap
} from 'lucide-react';
import {
  AutomationRule, TriggerType, AutomationCondition, AutomationAction,
  CommunicationChannel, TemplateType
} from '../../types';

interface AutomationRulesManagerProps {
  className?: string;
}

interface RuleFormData {
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: TriggerType;
    conditions: AutomationCondition[];
  };
  actions: AutomationAction[];
  priority: number;
  metadata: Record<string, any>;
}

const triggerTypes: { value: TriggerType; label: string; description: string; icon: React.ComponentType<any> }[] = [
  {
    value: 'appointment_scheduled',
    label: 'Consulta Agendada',
    description: 'Dispara quando uma nova consulta é agendada',
    icon: Calendar
  },
  {
    value: 'appointment_reminder',
    label: 'Lembrete de Consulta',
    description: 'Dispara em intervalos antes da consulta',
    icon: Clock
  },
  {
    value: 'payment_overdue',
    label: 'Pagamento Atrasado',
    description: 'Dispara quando um pagamento está atrasado',
    icon: DollarSign
  },
  {
    value: 'treatment_completed',
    label: 'Tratamento Concluído',
    description: 'Dispara quando um tratamento é finalizado',
    icon: CheckCircle
  },
  {
    value: 'patient_registered',
    label: 'Paciente Cadastrado',
    description: 'Dispara quando um novo paciente se cadastra',
    icon: User
  },
  {
    value: 'custom_event',
    label: 'Evento Personalizado',
    description: 'Trigger customizado baseado em eventos específicos',
    icon: Zap
  }
];

const conditionOperators = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'contains', label: 'Contém' },
  { value: 'not_contains', label: 'Não contém' },
  { value: 'starts_with', label: 'Começa com' },
  { value: 'ends_with', label: 'Termina com' }
];

const channelIcons = {
  whatsapp: MessageSquare,
  sms: Smartphone,
  email: Mail,
  push: Bell
};

export const AutomationRulesManager: React.FC<AutomationRulesManagerProps> = ({
  className = ''
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const [formData, setFormData] = useState<RuleFormData>({
    name: '',
    description: '',
    isActive: true,
    trigger: {
      type: 'appointment_scheduled',
      conditions: []
    },
    actions: [],
    priority: 5,
    metadata: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesResponse, templatesResponse] = await Promise.all([
        fetch('/api/communication/automation/rules'),
        fetch('/api/communication/templates')
      ]);

      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setRules(rulesData);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrigger = selectedTrigger === 'all' || rule.trigger.type === selectedTrigger;
      const matchesStatus = selectedStatus === 'all' ||
                           (selectedStatus === 'active' && rule.isActive) ||
                           (selectedStatus === 'inactive' && !rule.isActive);

      return matchesSearch && matchesTrigger && matchesStatus;
    });
  }, [rules, searchTerm, selectedTrigger, selectedStatus]);

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        ...formData,
        id: editingRule?.id || `rule_${Date.now()}`,
        createdAt: editingRule?.createdAt || new Date(),
        updatedAt: new Date()
      };

      const response = await fetch(
        `/api/communication/automation/rules${editingRule ? `/${editingRule.id}` : ''}`,
        {
          method: editingRule ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ruleData)
        }
      );

      if (response.ok) {
        await loadData();
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      const response = await fetch(`/api/communication/automation/rules/${ruleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/communication/automation/rules/${ruleId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleEditRule = (rule: AutomationRule) => {
    setFormData({
      name: rule.name,
      description: rule.description,
      isActive: rule.isActive,
      trigger: { ...rule.trigger },
      actions: [...rule.actions],
      priority: rule.priority,
      metadata: { ...rule.metadata }
    });
    setEditingRule(rule);
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
      trigger: {
        type: 'appointment_scheduled',
        conditions: []
      },
      actions: [],
      priority: 5,
      metadata: {}
    });
  };

  const addCondition = () => {
    const newCondition: AutomationCondition = {
      field: '',
      operator: 'equals',
      value: '',
      type: 'string'
    };

    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        conditions: [...prev.trigger.conditions, newCondition]
      }
    }));
  };

  const updateCondition = (index: number, condition: AutomationCondition) => {
    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        conditions: prev.trigger.conditions.map((c, i) => i === index ? condition : c)
      }
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        conditions: prev.trigger.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const addAction = () => {
    const newAction: AutomationAction = {
      type: 'send_message',
      channel: 'whatsapp',
      templateId: '',
      delay: 0,
      config: {}
    };

    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const updateAction = (index: number, action: AutomationAction) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((a, i) => i === index ? action : a)
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando regras de automação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automação de Comunicação</h1>
          <p className="text-gray-600 mt-1">
            Configure regras automáticas para disparar mensagens baseadas em eventos
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Regra</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar regras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <select
          value={selectedTrigger}
          onChange={(e) => setSelectedTrigger(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todos os triggers</option>
          {triggerTypes.map(trigger => (
            <option key={trigger.value} value={trigger.value}>{trigger.label}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      {/* Rules List */}
      {!isCreating ? (
        <div className="space-y-4">
          {filteredRules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleEditRule}
              onDelete={handleDeleteRule}
              onToggle={handleToggleRule}
            />
          ))}

          {filteredRules.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma regra encontrada</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedTrigger !== 'all' || selectedStatus !== 'all'
                  ? 'Ajuste os filtros para encontrar regras'
                  : 'Crie sua primeira regra de automação'
                }
              </p>
              {!searchTerm && selectedTrigger === 'all' && selectedStatus === 'all' && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Criar Primeira Regra
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Rule Form */
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editingRule ? 'Editar Regra' : 'Nova Regra de Automação'}
            </h2>
            <button
              onClick={handleCancelEdit}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Regra
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Lembrete 24h antes da consulta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>1 - Muito Alta</option>
                  <option value={3}>3 - Alta</option>
                  <option value={5}>5 - Normal</option>
                  <option value={7}>7 - Baixa</option>
                  <option value={9}>9 - Muito Baixa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Descreva o que esta regra faz e quando deve ser executada"
              />
            </div>

            {/* Trigger Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trigger</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={formData.trigger.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger, type: e.target.value as TriggerType }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {triggerTypes.map(trigger => (
                      <option key={trigger.value} value={trigger.value}>{trigger.label}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    {triggerTypes.find(t => t.value === formData.trigger.type)?.description}
                  </p>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Condições (opcional)
                    </label>
                    <button
                      onClick={addCondition}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      + Adicionar Condição
                    </button>
                  </div>

                  {formData.trigger.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-3 mb-3 p-3 border rounded-lg">
                      <input
                        type="text"
                        value={condition.field}
                        onChange={(e) => updateCondition(index, { ...condition, field: e.target.value })}
                        placeholder="Campo"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      />

                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, { ...condition, operator: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      >
                        {conditionOperators.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, { ...condition, value: e.target.value })}
                        placeholder="Valor"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      />

                      <button
                        onClick={() => removeCondition(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ações</h3>
                <button
                  onClick={addAction}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + Adicionar Ação
                </button>
              </div>

              {formData.actions.map((action, index) => (
                <div key={index} className="p-4 border rounded-lg mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canal
                      </label>
                      <select
                        value={action.channel}
                        onChange={(e) => updateAction(index, { ...action, channel: e.target.value as CommunicationChannel })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="email">Email</option>
                        <option value="push">Push</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template
                      </label>
                      <select
                        value={action.templateId}
                        onChange={(e) => updateAction(index, { ...action, templateId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Selecione um template</option>
                        {templates
                          .filter(template => template.channels.includes(action.channel))
                          .map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay (minutos)
                      </label>
                      <input
                        type="number"
                        value={action.delay}
                        onChange={(e) => updateAction(index, { ...action, delay: Number(e.target.value) })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => removeAction(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {formData.actions.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Adicione pelo menos uma ação</p>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Regra ativa</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t">
              <button
                onClick={handleSaveRule}
                disabled={!formData.name || formData.actions.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Regra</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RuleCardProps {
  rule: AutomationRule;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (ruleId: string, isActive: boolean) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onEdit, onDelete, onToggle }) => {
  const triggerInfo = triggerTypes.find(t => t.value === rule.trigger.type);
  const TriggerIcon = triggerInfo?.icon || Settings;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <TriggerIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
              <p className="text-sm text-gray-600">{triggerInfo?.label}</p>
            </div>
            <div className="flex items-center space-x-2">
              {!rule.isActive && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inativa
                </span>
              )}
              <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                Prioridade {rule.priority}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">{rule.description}</p>

          {/* Actions Summary */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ações:</span>
              <div className="flex space-x-1">
                {rule.actions.map((action, index) => {
                  const Icon = channelIcons[action.channel];
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="capitalize">{action.channel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {rule.trigger.conditions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {rule.trigger.conditions.length} condição{rule.trigger.conditions.length > 1 ? 'ões' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Executada {rule.metadata?.executionCount || 0}x</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Última execução: {rule.metadata?.lastExecution || 'Nunca'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToggle(rule.id, !rule.isActive)}
            className={`p-2 rounded-lg ${
              rule.isActive
                ? 'text-orange-600 hover:bg-orange-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={rule.isActive ? 'Pausar regra' : 'Ativar regra'}
          >
            {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            onClick={() => onEdit(rule)}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(rule.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationRulesManager;