import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit3, Trash2, Copy, Eye, Save, X, Search,
  MessageSquare, Mail, Smartphone, Bell, Code, Type,
  Image, Link, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { MessageTemplate, TemplateType, CommunicationChannel } from '../../types';

interface TemplateManagerProps {
  className?: string;
}

interface TemplateFormData {
  name: string;
  type: TemplateType;
  channels: CommunicationChannel[];
  subject?: string;
  content: string;
  variables: string[];
  metadata: Record<string, any>;
  isActive: boolean;
}

const channelIcons = {
  whatsapp: MessageSquare,
  sms: Smartphone,
  email: Mail,
  push: Bell
};

const templateTypes: { value: TemplateType; label: string; description: string }[] = [
  { value: TemplateType.APPOINTMENT_REMINDER, label: 'Lembrete de Consulta', description: 'Notifica pacientes sobre consultas agendadas' },
  { value: TemplateType.APPOINTMENT_CONFIRMATION, label: 'Confirmação de Consulta', description: 'Confirma agendamento de nova consulta' },
  { value: TemplateType.TREATMENT_UPDATE, label: 'Atualização de Tratamento', description: 'Informa progresso do tratamento' },
  { value: TemplateType.PAYMENT_REMINDER, label: 'Lembrete de Pagamento', description: 'Notifica sobre pagamentos pendentes' },
  { value: TemplateType.WELCOME, label: 'Boas-vindas', description: 'Mensagem de boas-vindas para novos pacientes' },
  { value: TemplateType.MARKETING, label: 'Marketing', description: 'Campanhas promocionais e informativas' }
];

const availableVariables = [
  { name: 'patient.name', description: 'Nome do paciente' },
  { name: 'patient.firstName', description: 'Primeiro nome do paciente' },
  { name: 'patient.email', description: 'Email do paciente' },
  { name: 'patient.phone', description: 'Telefone do paciente' },
  { name: 'appointment.date', description: 'Data da consulta' },
  { name: 'appointment.time', description: 'Horário da consulta' },
  { name: 'appointment.therapist', description: 'Nome do fisioterapeuta' },
  { name: 'appointment.location', description: 'Local da consulta' },
  { name: 'clinic.name', description: 'Nome da clínica' },
  { name: 'clinic.phone', description: 'Telefone da clínica' },
  { name: 'clinic.address', description: 'Endereço da clínica' },
  { name: 'treatment.name', description: 'Nome do tratamento' },
  { name: 'treatment.progress', description: 'Progresso do tratamento' },
  { name: 'payment.amount', description: 'Valor do pagamento' },
  { name: 'payment.dueDate', description: 'Data de vencimento' }
];

export const TemplateManager: React.FC<TemplateManagerProps> = ({ className = '' }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    type: 'custom',
    channels: ['whatsapp'],
    subject: '',
    content: '',
    variables: [],
    metadata: {},
    isActive: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the TemplateEngine
      const response = await fetch('/api/communication/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || template.type === selectedType;
      const matchesChannel = selectedChannel === 'all' ||
                             template.channels.includes(selectedChannel);

      return matchesSearch && matchesType && matchesChannel;
    });
  }, [templates, searchTerm, selectedType, selectedChannel]);

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        ...formData,
        id: editingTemplate?.id || `template_${Date.now()}`,
        createdAt: editingTemplate?.createdAt || new Date(),
        updatedAt: new Date()
      };

      const response = await fetch(
        `/api/communication/templates${editingTemplate ? `/${editingTemplate.id}` : ''}`,
        {
          method: editingTemplate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        }
      );

      if (response.ok) {
        await loadTemplates();
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const response = await fetch(`/api/communication/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    setFormData({
      name: `${template.name} (Cópia)`,
      type: template.type,
      channels: [...template.channels],
      subject: template.subject,
      content: template.content,
      variables: [...template.variables],
      metadata: { ...template.metadata },
      isActive: false
    });
    setIsCreating(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setFormData({
      name: template.name,
      type: template.type,
      channels: [...template.channels],
      subject: template.subject,
      content: template.content,
      variables: [...template.variables],
      metadata: { ...template.metadata },
      isActive: template.isActive
    });
    setEditingTemplate(template);
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      type: 'custom',
      channels: ['whatsapp'],
      subject: '',
      content: '',
      variables: [],
      metadata: {},
      isActive: true
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;

      setFormData(prev => ({ ...prev, content: newText }));

      // Update cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4;
        textarea.focus();
      }, 0);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];

    return [...new Set(matches.map(match => match.slice(2, -2).trim()))];
  };

  useEffect(() => {
    const variables = extractVariables(formData.content);
    setFormData(prev => ({ ...prev, variables }));
  }, [formData.content]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Templates</h1>
          <p className="text-gray-600 mt-1">
            Crie e gerencie templates de mensagens para todos os canais de comunicação
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Template</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todos os tipos</option>
          {templateTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todos os canais</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="push">Push</option>
        </select>
      </div>

      {/* Templates Grid */}
      {!isCreating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
              onPreview={setPreviewTemplate}
            />
          ))}
        </div>
      ) : (
        /* Template Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Template
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Lembrete de Consulta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TemplateType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canais de Comunicação
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(channelIcons).map(([channel, Icon]) => (
                    <label key={channel} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel as CommunicationChannel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              channels: [...prev.channels, channel as CommunicationChannel]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              channels: prev.channels.filter(c => c !== channel)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject (for email) */}
              {formData.channels.includes('email') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto (Email)
                  </label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Assunto do email"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo da Mensagem
                </label>
                <textarea
                  id="template-content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite o conteúdo da mensagem. Use {{variavel}} para inserir variáveis dinâmicas."
                />
              </div>

              {/* Variables Used */}
              {formData.variables.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variáveis Utilizadas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map(variable => (
                      <span
                        key={variable}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-lg"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Status */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Template ativo</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Template</span>
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

          {/* Variables Sidebar */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Variáveis Disponíveis</h3>
            <div className="space-y-3">
              {availableVariables.map(variable => (
                <div
                  key={variable.name}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => insertVariable(variable.name)}
                >
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-purple-600" />
                    <span className="font-mono text-sm text-purple-800">{variable.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: MessageTemplate;
  onEdit: (template: MessageTemplate) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (template: MessageTemplate) => void;
  onPreview: (template: MessageTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview
}) => {
  const templateTypeInfo = templateTypes.find(t => t.value === template.type);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            {!template.isActive && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Inativo
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {templateTypeInfo?.label || template.type}
          </p>
        </div>
      </div>

      {/* Channels */}
      <div className="flex items-center space-x-2 mb-4">
        {template.channels.map(channel => {
          const Icon = channelIcons[channel];
          return (
            <div
              key={channel}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg"
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs capitalize">{channel}</span>
            </div>
          );
        })}
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-3">
          {template.content.length > 100
            ? `${template.content.substring(0, 100)}...`
            : template.content
          }
        </p>
      </div>

      {/* Variables */}
      {template.variables.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Variáveis: {template.variables.length}</p>
          <div className="flex flex-wrap gap-1">
            {template.variables.slice(0, 3).map(variable => (
              <span
                key={variable}
                className="px-1 py-0.5 bg-purple-100 text-purple-800 text-xs rounded"
              >
                {variable}
              </span>
            ))}
            {template.variables.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.variables.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPreview(template)}
            className="p-2 text-gray-600 hover:text-purple-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(template)}
            className="p-2 text-gray-600 hover:text-purple-600"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDuplicate(template)}
            className="p-2 text-gray-600 hover:text-purple-600"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => onDelete(template.id)}
          className="p-2 text-gray-600 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface TemplatePreviewModalProps {
  template: MessageTemplate;
  onClose: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ template, onClose }) => {
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize preview data with sample values
    const sampleData: Record<string, string> = {
      'patient.name': 'João Silva',
      'patient.firstName': 'João',
      'patient.email': 'joao@email.com',
      'patient.phone': '(11) 99999-9999',
      'appointment.date': '15/01/2025',
      'appointment.time': '14:00',
      'appointment.therapist': 'Dr. Maria Santos',
      'appointment.location': 'Sala 3',
      'clinic.name': 'FisioFlow Clínica',
      'clinic.phone': '(11) 3333-3333',
      'clinic.address': 'Rua das Flores, 123',
      'treatment.name': 'Fisioterapia para Lombalgia',
      'treatment.progress': '75%',
      'payment.amount': 'R$ 150,00',
      'payment.dueDate': '20/01/2025'
    };

    setPreviewData(sampleData);
  }, []);

  const renderPreview = (content: string): string => {
    let rendered = content;
    Object.entries(previewData).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return rendered;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Preview: {template.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Info */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {template.channels.map(channel => {
                const Icon = channelIcons[channel];
                return (
                  <div
                    key={channel}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm capitalize">{channel}</span>
                  </div>
                );
              })}
            </div>
            <span className="text-sm text-gray-500">
              {templateTypes.find(t => t.value === template.type)?.label}
            </span>
          </div>

          {/* Subject (if email) */}
          {template.subject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{renderPreview(template.subject)}</p>
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da Mensagem
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{renderPreview(template.content)}</p>
            </div>
          </div>

          {/* Variables */}
          {template.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variáveis de Exemplo
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.variables.map(variable => (
                  <div key={variable} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="font-mono text-sm text-purple-800">{variable}</span>
                    <span className="text-sm text-gray-600">{previewData[variable] || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Fechar Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;