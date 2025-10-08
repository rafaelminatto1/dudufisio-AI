/**
 * WhatsApp Automation Dashboard
 * Dashboard de gerenciamento de automações WhatsApp
 * DuduFisio-AI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  BarChart3,
  MessageSquare,
  Calendar,
  Bell,
  Play,
  Pause,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: 'keyword' | 'time_based' | 'event_based';
  trigger_value: string;
  action_type: 'send_message' | 'create_appointment' | 'notify_staff' | 'update_lead';
  action_data: any;
  is_active: boolean;
  priority: number;
  total_executions: number;
  last_executed_at: string | null;
  created_at: string;
}

interface AutomationDashboardProps {
  clinicId: string;
}

export const WhatsAppAutomationDashboard: React.FC<AutomationDashboardProps> = ({ clinicId }) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'keyword' as 'keyword' | 'time_based' | 'event_based',
    trigger_value: '',
    action_type: 'send_message' as 'send_message' | 'create_appointment' | 'notify_staff' | 'update_lead',
    action_data: { message: '' },
    priority: 0,
  });

  useEffect(() => {
    loadAutomations();
  }, [clinicId]);

  const loadAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_automations')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('priority', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_automations')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      await loadAutomations();
    } catch (error) {
      console.error('Erro ao atualizar automação:', error);
      alert('Erro ao atualizar automação');
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_automations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAutomations();
    } catch (error) {
      console.error('Erro ao excluir automação:', error);
      alert('Erro ao excluir automação');
    }
  };

  const saveAutomation = async () => {
    try {
      const dataToSave = {
        ...formData,
        clinic_id: clinicId,
        is_active: true,
      };

      if (editingAutomation) {
        // Atualizar
        const { error } = await supabase
          .from('whatsapp_automations')
          .update(dataToSave)
          .eq('id', editingAutomation.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('whatsapp_automations')
          .insert([dataToSave]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingAutomation(null);
      resetForm();
      await loadAutomations();
    } catch (error) {
      console.error('Erro ao salvar automação:', error);
      alert('Erro ao salvar automação');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'keyword',
      trigger_value: '',
      action_type: 'send_message',
      action_data: { message: '' },
      priority: 0,
    });
  };

  const editAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description || '',
      trigger_type: automation.trigger_type,
      trigger_value: automation.trigger_value,
      action_type: automation.action_type,
      action_data: automation.action_data,
      priority: automation.priority,
    });
    setIsDialogOpen(true);
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return <MessageSquare className="h-4 w-4" />;
      case 'time_based':
        return <Calendar className="h-4 w-4" />;
      case 'event_based':
        return <Bell className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'keyword':
        return 'Palavra-chave';
      case 'time_based':
        return 'Horário';
      case 'event_based':
        return 'Evento';
      default:
        return type;
    }
  };

  const stats = {
    total: automations.length,
    active: automations.filter(a => a.is_active).length,
    totalExecutions: automations.reduce((sum, a) => sum + a.total_executions, 0),
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Automações</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">automações configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">automações ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">execuções totais</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Automações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automações WhatsApp</CardTitle>
              <CardDescription>
                Configure automações para responder automaticamente
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingAutomation(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Automação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAutomation ? 'Editar Automação' : 'Nova Automação'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure uma nova automação para WhatsApp
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Mensagem de Boas-Vindas"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o que esta automação faz"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tipo de Gatilho</label>
                      <select
                        value={formData.trigger_type}
                        onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="keyword">Palavra-chave</option>
                        <option value="time_based">Horário</option>
                        <option value="event_based">Evento</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Valor do Gatilho</label>
                      <Input
                        value={formData.trigger_value}
                        onChange={(e) => setFormData({ ...formData, trigger_value: e.target.value })}
                        placeholder={
                          formData.trigger_type === 'keyword' ? 'Ex: oi|olá|ola' :
                          formData.trigger_type === 'time_based' ? 'Ex: 09:00' :
                          'Ex: appointment_confirmed'
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipo de Ação</label>
                    <select
                      value={formData.action_type}
                      onChange={(e) => setFormData({ ...formData, action_type: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="send_message">Enviar Mensagem</option>
                      <option value="create_appointment">Criar Agendamento</option>
                      <option value="notify_staff">Notificar Equipe</option>
                      <option value="update_lead">Atualizar Lead</option>
                    </select>
                  </div>

                  {formData.action_type === 'send_message' && (
                    <div>
                      <label className="text-sm font-medium">Mensagem</label>
                      <textarea
                        value={formData.action_data.message}
                        onChange={(e) => setFormData({
                          ...formData,
                          action_data: { message: e.target.value }
                        })}
                        className="w-full min-h-[150px] p-3 border rounded-md"
                        placeholder="Digite a mensagem que será enviada automaticamente..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use *texto* para negrito, _texto_ para itálico
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Prioridade</label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Automações com maior prioridade são executadas primeiro
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={saveAutomation}>
                      Salvar Automação
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando automações...
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma automação configurada
            </div>
          ) : (
            <div className="space-y-4">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{automation.name}</h3>
                        <Badge variant={automation.is_active ? 'default' : 'secondary'}>
                          {automation.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTriggerIcon(automation.trigger_type)}
                          {getTriggerLabel(automation.trigger_type)}
                        </Badge>
                      </div>
                      
                      {automation.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {automation.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Gatilho: {automation.trigger_value}</span>
                        <span>•</span>
                        <span>{automation.total_executions} execuções</span>
                        {automation.last_executed_at && (
                          <>
                            <span>•</span>
                            <span>
                              Última: {new Date(automation.last_executed_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => toggleAutomation(automation.id, automation.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editAutomation(automation)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAutomation(automation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

