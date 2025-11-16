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
import AutomationManager from '../components/crm/AutomationManager';

export default function UnifiedCRMPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [unreadCount, setUnreadCount] = useState(3); // TODO: Get from real data

  return (
    <div className="min-h-screen bg-neutral-bgAlt p-lg">
      {/* Header */}
      <div className="mb-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              CRM & WhatsApp
            </h1>
            <p className="text-neutral-textSecondary mt-xs">
              Gerencie leads, conversas e conversões em um só lugar
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-md">
            <Card className="shadow-cardHover hover:shadow-cardActive transition-all">
              <CardContent className="p-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center border-2 border-primary">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-textSecondary">Leads Ativos</p>
                    <p className="text-2xl font-bold text-neutral-text">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-cardHover hover:shadow-cardActive transition-all">
              <CardContent className="p-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center border-2 border-success">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-textSecondary">Taxa Conversão</p>
                    <p className="text-2xl font-bold text-neutral-text">18%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-cardHover hover:shadow-cardActive transition-all">
              <CardContent className="p-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-purple-200">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-textSecondary">Mensagens Hoje</p>
                    <p className="text-2xl font-bold text-neutral-text">47</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white shadow-card">
          <TabsTrigger
            value="inbox"
            className="flex items-center gap-sm py-3 data-[state=active]:bg-primary-light data-[state=active]:text-primary"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="pipeline"
            className="flex items-center gap-sm py-3 data-[state=active]:bg-primary-light data-[state=active]:text-primary"
          >
            <Trello className="w-4 h-4" />
            <span>Pipeline</span>
          </TabsTrigger>

          <TabsTrigger
            value="analytics"
            className="flex items-center gap-sm py-3 data-[state=active]:bg-primary-light data-[state=active]:text-primary"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>

          <TabsTrigger
            value="automations"
            className="flex items-center gap-sm py-3 data-[state=active]:bg-primary-light data-[state=active]:text-primary"
          >
            <Zap className="w-4 h-4" />
            <span>Automações</span>
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab - WhatsApp Chat Interface */}
        <TabsContent value="inbox" className="mt-xl">
          <UnifiedInbox />
        </TabsContent>

        {/* Pipeline Tab - Kanban Board */}
        <TabsContent value="pipeline" className="mt-xl">
          <LeadsKanban />
        </TabsContent>

        {/* Analytics Tab - Dashboards */}
        <TabsContent value="analytics" className="mt-xl">
          <CRMAnalytics />
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="mt-xl">
          <AutomationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
