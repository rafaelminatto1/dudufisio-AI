/**
 * 🎯 Unified CRM Page - CRM + WhatsApp Integration
 * Main page with tabs for Inbox, Pipeline, Analytics, and Automations
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MessageSquare, Trello, BarChart3, Zap, Phone, Mail, Users, TrendingUp } from 'lucide-react';
import UnifiedInbox from '../components/crm/UnifiedInbox';
import LeadsKanban from '../components/crm/LeadsKanban';
import CRMAnalytics from '../components/crm/CRMAnalytics';

export default function UnifiedCRMPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [unreadCount, setUnreadCount] = useState(3); // TODO: Get from real data

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              CRM & WhatsApp
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie leads, conversas e conversões em um só lugar
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Leads Ativos</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taxa Conversão</p>
                    <p className="text-2xl font-bold">18%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mensagens Hoje</p>
                    <p className="text-2xl font-bold">47</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white shadow-sm">
          <TabsTrigger
            value="inbox"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="pipeline"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Trello className="w-4 h-4" />
            <span>Pipeline</span>
          </TabsTrigger>

          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>

          <TabsTrigger
            value="automations"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Zap className="w-4 h-4" />
            <span>Automações</span>
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab - WhatsApp Chat Interface */}
        <TabsContent value="inbox" className="mt-6">
          <UnifiedInbox />
        </TabsContent>

        {/* Pipeline Tab - Kanban Board */}
        <TabsContent value="pipeline" className="mt-6">
          <LeadsKanban />
        </TabsContent>

        {/* Analytics Tab - Dashboards */}
        <TabsContent value="analytics" className="mt-6">
          <CRMAnalytics />
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Automações de Follow-up
              </CardTitle>
              <CardDescription>
                Configure regras automáticas para follow-up de leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Automation Rules */}
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Lead novo sem resposta há 24h</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Envia mensagem de follow-up automática
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        Ativa
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Lead qualificado há 3 dias</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Envia proposta de agendamento
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        Ativa
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-gray-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-400">Lead inativo há 7 dias</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Marca como "cold" e envia pesquisa de interesse
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-gray-50 text-gray-500">
                        Inativa
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full mt-4">
                  <Zap className="w-4 h-4 mr-2" />
                  Criar Nova Automação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
