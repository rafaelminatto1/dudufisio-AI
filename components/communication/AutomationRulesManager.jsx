import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit3, Trash2, Play, Pause, Save, X, Search, Clock, Filter, MessageSquare, Mail, Smartphone, Bell, Calendar, User, DollarSign, Activity, CheckCircle, Settings, Zap } from 'lucide-react';
import { TriggerType, CommunicationChannel } from '../../types';
const triggerTypes = [
    {
        value: TriggerType.APPOINTMENT_CREATED,
        label: 'Consulta Agendada',
        description: 'Dispara quando uma nova consulta é agendada',
        icon: Calendar
    },
    {
        value: TriggerType.APPOINTMENT_REMINDER,
        label: 'Lembrete de Consulta',
        description: 'Dispara em intervalos antes da consulta',
        icon: Clock
    },
    {
        value: TriggerType.PAYMENT_DUE,
        label: 'Pagamento Atrasado',
        description: 'Dispara quando um pagamento está atrasado',
        icon: DollarSign
    },
    {
        value: TriggerType.TREATMENT_COMPLETED,
        label: 'Tratamento Concluído',
        description: 'Dispara quando um tratamento é finalizado',
        icon: CheckCircle
    },
    {
        value: TriggerType.PATIENT_REGISTERED,
        label: 'Paciente Cadastrado',
        description: 'Dispara quando um novo paciente se cadastra',
        icon: User
    },
    {
        value: TriggerType.FOLLOW_UP_DUE,
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
    [CommunicationChannel.WhatsApp]: MessageSquare,
    [CommunicationChannel.SMS]: Smartphone,
    [CommunicationChannel.Email]: Mail,
    [CommunicationChannel.Push]: Bell
};
export const AutomationRulesManager = ({ className = '' }) => {
    const [rules, setRules] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrigger, setSelectedTrigger] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isCreating, setIsCreating] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
        priority: 5,
        actions: []
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
        }
        catch (error) {
            console.error('Error loading data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredRules = useMemo(() => {
        return rules.filter(rule => {
            const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (rule.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTrigger = selectedTrigger === 'all' ||
                (rule.trigger?.type || '').includes(selectedTrigger);
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
            const response = await fetch(`/api/communication/automation/rules${editingRule ? `/${editingRule.id}` : ''}`, {
                method: editingRule ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleData)
            });
            if (response.ok) {
                await loadData();
                handleCancelEdit();
            }
        }
        catch (error) {
            console.error('Error saving rule:', error);
        }
    };
    const handleDeleteRule = async (ruleId) => {
        if (!confirm('Tem certeza que deseja excluir esta regra?'))
            return;
        try {
            const response = await fetch(`/api/communication/automation/rules/${ruleId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadData();
            }
        }
        catch (error) {
            console.error('Error deleting rule:', error);
        }
    };
    const handleToggleRule = async (ruleId, isActive) => {
        try {
            const response = await fetch(`/api/communication/automation/rules/${ruleId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive })
            });
            if (response.ok) {
                await loadData();
            }
        }
        catch (error) {
            console.error('Error toggling rule:', error);
        }
    };
    const handleEditRule = (rule) => {
        setFormData({
            name: rule.name,
            description: rule.description || '',
            isActive: rule.isActive,
            priority: rule.priority || 5,
            actions: [...rule.actions]
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
            priority: 5,
            actions: []
        });
    };
    const addCondition = () => {
        // Simplified - conditions not implemented in current form structure
    };
    const updateCondition = (index, condition) => {
        // Simplified - conditions not implemented in current form structure
    };
    const removeCondition = (index) => {
        // Simplified - conditions not implemented in current form structure
    };
    const addAction = () => {
        const newAction = {
            type: 'send_message',
            parameters: {
                channel: CommunicationChannel.WhatsApp,
                templateId: '',
                delay: 0
            }
        };
        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, newAction]
        }));
    };
    const updateAction = (index, action) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.map((a, i) => i === index ? action : a)
        }));
    };
    const removeAction = (index) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };
    if (loading) {
        return (<div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando regras de automação...</p>
        </div>
      </div>);
    }
    return (<div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automação de Comunicação</h1>
          <p className="text-gray-600 mt-1">
            Configure regras automáticas para disparar mensagens baseadas em eventos
          </p>
        </div>

        <button onClick={() => setIsCreating(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="h-4 w-4"/>
          <span>Nova Regra</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Buscar regras..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"/>
          </div>
        </div>

        <select value={selectedTrigger} onChange={(e) => setSelectedTrigger(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          <option value="all">Todos os triggers</option>
          {triggerTypes.map(trigger => (<option key={trigger.value} value={trigger.value}>{trigger.label}</option>))}
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      {/* Rules List */}
      {!isCreating ? (<div className="space-y-4">
          {filteredRules.map(rule => (<RuleCard key={rule.id} rule={rule} onEdit={handleEditRule} onDelete={handleDeleteRule} onToggle={handleToggleRule}/>))}

          {filteredRules.length === 0 && (<div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma regra encontrada</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedTrigger !== 'all' || selectedStatus !== 'all'
                    ? 'Ajuste os filtros para encontrar regras'
                    : 'Crie sua primeira regra de automação'}
              </p>
              {!searchTerm && selectedTrigger === 'all' && selectedStatus === 'all' && (<button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Criar Primeira Regra
                </button>)}
            </div>)}
        </div>) : (
        /* Rule Form */
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editingRule ? 'Editar Regra' : 'Nova Regra de Automação'}
            </h2>
            <button onClick={handleCancelEdit} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5"/>
            </button>
          </div>

          <div className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Regra
                </label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Ex: Lembrete 24h antes da consulta"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
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
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Descreva o que esta regra faz e quando deve ser executada"/>
            </div>

            {/* Trigger Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trigger</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select value={TriggerType.APPOINTMENT_CREATED} onChange={(e) => {
                // Trigger type selection - simplified for now
            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    {triggerTypes.map(trigger => (<option key={trigger.value} value={trigger.value}>{trigger.label}</option>))}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    {triggerTypes.find(t => t.value === TriggerType.APPOINTMENT_CREATED)?.description}
                  </p>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Condições (opcional)
                    </label>
                    <button onClick={addCondition} className="text-sm text-purple-600 hover:text-purple-700">
                      + Adicionar Condição
                    </button>
                  </div>

                  {/* Conditions would be rendered here when implemented */}
                </div>
              </div>
            </div>

            {/* Actions Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ações</h3>
                <button onClick={addAction} className="text-sm text-purple-600 hover:text-purple-700">
                  + Adicionar Ação
                </button>
              </div>

              {formData.actions.map((action, index) => {
                const channel = action.parameters?.channel || CommunicationChannel.WhatsApp;
                const templateId = action.parameters?.templateId || '';
                const delay = action.parameters?.delay || 0;
                return (<div key={index} className="p-4 border rounded-lg mb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Canal
                        </label>
                        <select value={channel} onChange={(e) => updateAction(index, {
                        ...action,
                        parameters: { ...action.parameters, channel: e.target.value }
                    })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                          <option value={CommunicationChannel.WhatsApp}>WhatsApp</option>
                          <option value={CommunicationChannel.SMS}>SMS</option>
                          <option value={CommunicationChannel.Email}>Email</option>
                          <option value={CommunicationChannel.Push}>Push</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template
                        </label>
                        <select value={templateId} onChange={(e) => updateAction(index, {
                        ...action,
                        parameters: { ...action.parameters, templateId: e.target.value }
                    })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                          <option value="">Selecione um template</option>
                          {templates
                        .filter(template => (template.channels || []).includes(channel))
                        .map(template => (<option key={template.id} value={template.id}>
                                {template.name}
                              </option>))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delay (minutos)
                        </label>
                        <input type="number" value={delay} onChange={(e) => updateAction(index, {
                        ...action,
                        parameters: { ...action.parameters, delay: Number(e.target.value) }
                    })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"/>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => removeAction(index)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    </div>
                  </div>);
            })}

              {formData.actions.length === 0 && (<div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2"/>
                  <p className="text-gray-600">Adicione pelo menos uma ação</p>
                </div>)}
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"/>
                <span className="text-sm font-medium text-gray-700">Regra ativa</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t">
              <button onClick={handleSaveRule} disabled={!formData.name || formData.actions.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="h-4 w-4"/>
                <span>Salvar Regra</span>
              </button>
              <button onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
const RuleCard = ({ rule, onEdit, onDelete, onToggle }) => {
    const triggerType = rule.trigger?.type || '';
    const triggerInfo = triggerTypes.find(t => t.value.toString().includes(triggerType));
    const TriggerIcon = triggerInfo?.icon || Settings;
    const conditions = rule.conditions || [];
    return (<div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <TriggerIcon className="h-5 w-5"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
              <p className="text-sm text-gray-600">{triggerInfo?.label || 'Trigger Personalizado'}</p>
            </div>
            <div className="flex items-center space-x-2">
              {!rule.isActive && (<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inativa
                </span>)}
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">{rule.description || 'Sem descrição'}</p>

          {/* Actions Summary */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ações:</span>
              <div className="flex space-x-1">
                {rule.actions.map((action, index) => {
            const channel = action.parameters?.channel || CommunicationChannel.WhatsApp;
            const Icon = channelIcons[channel] || MessageSquare;
            return (<div key={index} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
                      <Icon className="h-3 w-3"/>
                      <span className="capitalize">{channel}</span>
                    </div>);
        })}
              </div>
            </div>

            {conditions.length > 0 && (<div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400"/>
                <span className="text-sm text-gray-600">
                  {conditions.length} condição{conditions.length > 1 ? 'ões' : ''}
                </span>
              </div>)}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4"/>
              <span>Criada em {new Date(rule.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button onClick={() => onToggle(rule.id, !rule.isActive)} className={`p-2 rounded-lg ${rule.isActive
            ? 'text-orange-600 hover:bg-orange-50'
            : 'text-green-600 hover:bg-green-50'}`} title={rule.isActive ? 'Pausar regra' : 'Ativar regra'}>
            {rule.isActive ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
          </button>

          <button onClick={() => onEdit(rule)} className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
            <Edit3 className="h-4 w-4"/>
          </button>

          <button onClick={() => onDelete(rule.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </div>);
};
export default AutomationRulesManager;
