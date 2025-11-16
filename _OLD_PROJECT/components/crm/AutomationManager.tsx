/**
 * 🤖 Automation Manager - Gerenciamento de Automações CRM
 * Interface completa para criar, editar e monitorar regras de automação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  BarChart3
} from 'lucide-react';
import { automationService } from '../../services/crm/automationService';
import type { AutomationRule } from '../../services/crm/automationService';

export default function AutomationManager() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, statsData] = await Promise.all([
        automationService.listRules(),
        automationService.getAutomationStatistics()
      ]);
      setRules(rulesData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await automationService.toggleRule(ruleId, isActive);
      await loadData();
    } catch (error) {
      console.error('Erro ao alternar regra:', error);
    }
  };

  const handleProcessRules = async () => {
    try {
      setProcessing(true);
      const result = await automationService.processAutomationRules();
      alert(`Processado!\n${result.processed_rules} regras\n${result.total_executions} execuções criadas`);
      await loadData();
    } catch (error) {
      console.error('Erro ao processar regras:', error);
      alert('Erro ao processar regras');
    } finally {
      setProcessing(false);
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'no_response_24h': 'Sem resposta 24h',
      'qualified_3days': 'Qualificado 3 dias',
      'inactive_7days': 'Inativo 7 dias',
      'new_lead': 'Novo lead',
      'stage_change': 'Mudança de estágio'
    };
    return labels[type] || type;
  };

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'send_message': 'Enviar mensagem',
      'update_status': 'Atualizar status',
      'schedule_followup': 'Agendar follow-up',
      'create_task': 'Criar tarefa',
      'send_notification': 'Enviar notificação'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-700 border-red-300';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando automações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automações</h2>
          <p className="text-gray-600">Gerencie regras automáticas de follow-up</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleProcessRules}
            disabled={processing}
            variant="outline"
          >
            <Play className="w-4 h-4 mr-2" />
            {processing ? 'Processando...' : 'Processar Regras'}
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Regras Ativas</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
        </TabsList>

        {/* Tab: Regras */}
        <TabsContent value="rules" className="space-y-4 mt-6">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhuma regra de automação configurada</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Regra
                </Button>
              </CardContent>
            </Card>
          ) : (
            rules.map((rule) => {
              const stats = statistics.find(s => s.rule_id === rule.id);

              return (
                <Card key={rule.id} className={rule.is_active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <Badge variant="outline" className={getPriorityColor(rule.priority)}>
                            Prioridade {rule.priority}
                          </Badge>
                          {rule.is_active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-500">
                              <Pause className="w-3 h-3 mr-1" />
                              Pausada
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Gatilho</p>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            {getTriggerTypeLabel(rule.trigger_type)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ação</p>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {getActionTypeLabel(rule.action_type)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Delay</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">
                            {rule.delay_minutes}min
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Execuções</p>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            {stats?.total_executions || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas da regra */}
                    {stats && stats.total_executions > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{stats.successful_executions} sucesso</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span>{stats.failed_executions} falhas</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span>{stats.pending_executions} pendentes</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Taxa: {stats.success_rate}%
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Deletar
                      </Button>
                      {rule.last_executed_at && (
                        <span className="text-xs text-gray-500 ml-auto">
                          Última execução: {new Date(rule.last_executed_at).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Tab: Statistics */}
        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Regras</CardDescription>
                <CardTitle className="text-3xl">{rules.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {rules.filter(r => r.is_active).length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Execuções (Total)</CardDescription>
                <CardTitle className="text-3xl">
                  {statistics.reduce((sum, s) => sum + (s.total_executions || 0), 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  {statistics.reduce((sum, s) => sum + (s.successful_executions || 0), 0)} com sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Taxa Média de Sucesso</CardDescription>
                <CardTitle className="text-3xl">
                  {statistics.length > 0
                    ? (statistics.reduce((sum, s) => sum + (parseFloat(s.success_rate) || 0), 0) / statistics.length).toFixed(1)
                    : 0}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Performance geral</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Detalhada por Regra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Regra</th>
                      <th className="text-right py-3 px-4">Total</th>
                      <th className="text-right py-3 px-4">Sucesso</th>
                      <th className="text-right py-3 px-4">Falhas</th>
                      <th className="text-right py-3 px-4">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.map((stat) => (
                      <tr key={stat.rule_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{stat.rule_name}</p>
                            <p className="text-sm text-gray-500">{getTriggerTypeLabel(stat.trigger_type)}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">{stat.total_executions}</td>
                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                          {stat.successful_executions}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600">
                          {stat.failed_executions}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              parseFloat(stat.success_rate) >= 80
                                ? 'bg-green-50 text-green-700 border-green-300'
                                : parseFloat(stat.success_rate) >= 50
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                : 'bg-red-50 text-red-700 border-red-300'
                            }
                          >
                            {stat.success_rate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Follow-ups */}
        <TabsContent value="followups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Follow-ups Agendados</CardTitle>
              <CardDescription>Próximos follow-ups automáticos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
