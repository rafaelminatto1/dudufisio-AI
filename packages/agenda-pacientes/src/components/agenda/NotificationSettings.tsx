import React, { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, Mail, Send, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useToast } from '../../contexts/ToastContext';
import { EnrichedAppointment } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: EnrichedAppointment;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'reminder' | 'confirmation' | 'cancellation' | 'reschedule';
  channel: 'whatsapp' | 'sms' | 'email';
  message: string;
  enabled: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (appointment && templates.length > 0) {
      // Selecionar template de lembrete por padrão
      const reminderTemplate = templates.find(t => t.type === 'reminder' && t.enabled);
      if (reminderTemplate) {
        setSelectedTemplate(reminderTemplate);
        setChannel(reminderTemplate.channel);
        setCustomMessage(replacePlaceholders(reminderTemplate.message, appointment));
      }
    }
  }, [appointment, templates]);

  const loadTemplates = () => {
    const saved = localStorage.getItem('notification_templates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
        setTemplates(getDefaultTemplates());
      }
    } else {
      setTemplates(getDefaultTemplates());
    }
  };

  const getDefaultTemplates = (): MessageTemplate[] => [
    {
      id: '1',
      name: 'Lembrete de Consulta',
      type: 'reminder',
      channel: 'whatsapp',
      message: 'Olá {{patientName}}! Este é um lembrete da sua consulta de {{appointmentType}} com {{therapistName}} amanhã às {{appointmentTime}}.',
      enabled: true
    },
    {
      id: '2',
      name: 'Confirmação de Agendamento',
      type: 'confirmation',
      channel: 'whatsapp',
      message: 'Olá {{patientName}}! Seu agendamento de {{appointmentType}} com {{therapistName}} foi confirmado para {{appointmentDate}} às {{appointmentTime}}.',
      enabled: true
    },
    {
      id: '3',
      name: 'Cancelamento',
      type: 'cancellation',
      channel: 'whatsapp',
      message: 'Olá {{patientName}}! Infelizmente sua consulta de {{appointmentType}} com {{therapistName}} em {{appointmentDate}} foi cancelada. Entre em contato para reagendar.',
      enabled: true
    },
    {
      id: '4',
      name: 'Reagendamento',
      type: 'reschedule',
      channel: 'whatsapp',
      message: 'Olá {{patientName}}! Sua consulta de {{appointmentType}} com {{therapistName}} foi reagendada para {{appointmentDate}} às {{appointmentTime}}.',
      enabled: true
    }
  ];

  const replacePlaceholders = (message: string, appointment: EnrichedAppointment): string => {
    return message
      .replace(/\{\{patientName\}\}/g, appointment.patientName)
      .replace(/\{\{therapistName\}\}/g, appointment.therapistName)
      .replace(/\{\{appointmentType\}\}/g, appointment.type || 'Não definido')
      .replace(/\{\{appointmentDate\}\}/g, format(appointment.startTime, 'dd/MM/yyyy', { locale: ptBR }))
      .replace(/\{\{appointmentTime\}\}/g, format(appointment.startTime, 'HH:mm', { locale: ptBR }))
      .replace(/\{\{appointmentEndTime\}\}/g, format(appointment.endTime, 'HH:mm', { locale: ptBR }))
      .replace(/\{\{clinicName\}\}/g, 'DuduFisio-AI')
      .replace(/\{\{clinicPhone\}\}/g, '(XX) XXXX-XXXX');
  };

  const handleSend = async () => {
    if (!appointment) {
      showToast('Nenhum agendamento selecionado', 'error');
      return;
    }

    if (!customMessage.trim()) {
      showToast('Digite uma mensagem', 'error');
      return;
    }

    try {
      showToast(`Enviando mensagem via ${channel}...`, 'info');
      
      // Aqui você integraria com a API do WhatsApp/SMS
      // Por enquanto, apenas simular o envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar log de mensagem enviada
      const logEntry = {
        id: `log_${Date.now()}`,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        channel,
        message: customMessage,
        sentAt: new Date(),
        status: 'sent'
      };
      
      const logs = JSON.parse(localStorage.getItem('notification_logs') || '[]');
      logs.push(logEntry);
      localStorage.setItem('notification_logs', JSON.stringify(logs));
      
      showToast(`Mensagem enviada via ${channel}!`, 'success');
      onClose();
    } catch (error) {
      showToast('Erro ao enviar mensagem', 'error');
    }
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    
    const updatedTemplates = templates.map(t =>
      t.id === selectedTemplate.id ? { ...selectedTemplate, message: customMessage } : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('notification_templates', JSON.stringify(updatedTemplates));
    showToast('Template salvo!', 'success');
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) return;
    
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('notification_templates', JSON.stringify(updatedTemplates));
    showToast('Template removido!', 'success');
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'sms':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'email':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Enviar Notificação
          </DialogTitle>
          <DialogDescription>
            Envie lembretes e confirmações para o paciente via WhatsApp, SMS ou Email
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Informações do Agendamento */}
          {appointment && (
            <Card className="p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-900 mb-2">Agendamento</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">Paciente:</span>
                  <span className="ml-2 font-medium">{appointment.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Terapeuta:</span>
                  <span className="ml-2 font-medium">{appointment.therapistName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Data:</span>
                  <span className="ml-2 font-medium">
                    {format(appointment.startTime, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Horário:</span>
                  <span className="ml-2 font-medium">
                    {format(appointment.startTime, 'HH:mm', { locale: ptBR })} - {format(appointment.endTime, 'HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Seleção de Canal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Canal de Envio</label>
            <div className="flex gap-2">
              {['whatsapp', 'sms', 'email'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                    channel === ch
                      ? getChannelColor(ch)
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {getChannelIcon(ch)}
                  <span className="capitalize">{ch}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setChannel(template.channel);
                    if (appointment) {
                      setCustomMessage(replacePlaceholders(template.message, appointment));
                    }
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{template.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {template.channel}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{template.message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem Customizada */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mensagem
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a mensagem..."
            />
            <div className="mt-2 text-xs text-slate-600">
              <p>Variáveis disponíveis:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {['{{patientName}}', '{{therapistName}}', '{{appointmentType}}', '{{appointmentDate}}', '{{appointmentTime}}'].map((varName) => (
                  <code key={varName} className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {varName}
                  </code>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getChannelIcon(channel)}
                <span className="text-sm font-medium capitalize">{channel}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {customMessage || 'Digite uma mensagem para ver o preview...'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveTemplate}
              disabled={!selectedTemplate}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>
            {selectedTemplate && (
              <Button
                variant="outline"
                onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Template
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={!customMessage.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettings;

