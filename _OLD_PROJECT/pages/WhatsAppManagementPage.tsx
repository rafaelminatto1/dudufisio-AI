/**
 * WhatsApp Management Page
 * Página completa de gerenciamento WhatsApp
 * DuduFisio-AI
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Zap,
  Settings,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppMessagesPanel } from '@/components/whatsapp/WhatsAppMessagesPanel';
import { WhatsAppAutomationDashboard } from '@/components/whatsapp/WhatsAppAutomationDashboard';
import { WhatsAppConfigStatus } from '@/components/whatsapp/WhatsAppConfigStatus';

export const WhatsAppManagementPage: React.FC = () => {
  const [clinicId, setClinicId] = useState('1'); // TODO: Get from context/auth
  
  // Verificar configuração
  const isConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  return (
    <div className="container mx-auto p-lg space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Business</h1>
          <p className="text-neutral-textSecondary">
            Gerencie mensagens, automações e configurações do WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-sm">
          {isConfigured ? (
            <Badge className="bg-success-light text-success">
              <CheckCircle2 className="h-3 w-3 mr-xs" />
              Configurado
            </Badge>
          ) : (
            <Badge className="bg-error-light text-error">
              <XCircle className="h-3 w-3 mr-xs" />
              Não Configurado
            </Badge>
          )}
        </div>
      </div>

      {/* Status Card */}
      {!isConfigured && (
        <Card className="border-yellow-200 bg-warning-light">
          <CardHeader>
            <div className="flex items-center gap-sm">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle className="text-yellow-900">Configuração Necessária</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              Configure as credenciais do WhatsApp Business API para começar a usar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default">
              Configurar Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-md md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-neutral-textSecondary">
              +20% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <BarChart3 className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-neutral-textSecondary">
              Tempo médio: 2.5 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automações Ativas</CardTitle>
            <Zap className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-neutral-textSecondary">
              8 executadas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-neutral-textSecondary">
              Via WhatsApp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-sm" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="automations">
            <Zap className="h-4 w-4 mr-sm" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-sm" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-sm" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-md">
          <WhatsAppMessagesPanel clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="automations" className="space-y-md">
          <WhatsAppAutomationDashboard clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-md">
          <Card>
            <CardHeader>
              <CardTitle>Analytics WhatsApp</CardTitle>
              <CardDescription>
                Métricas e estatísticas de uso do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-xl">
                {/* Placeholder para gráficos */}
                <div className="grid gap-md md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Mensagens por Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center text-neutral-textSecondary">
                        Gráfico em desenvolvimento
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Taxa de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center text-neutral-textSecondary">
                        Gráfico em desenvolvimento
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas detalhadas */}
                <div className="grid gap-md md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Horários de Pico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-sm">
                        <div className="flex justify-between">
                          <span className="text-sm">09:00 - 12:00</span>
                          <span className="text-sm font-bold">42%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">14:00 - 18:00</span>
                          <span className="text-sm font-bold">38%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">19:00 - 21:00</span>
                          <span className="text-sm font-bold">20%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tipos de Mensagem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-sm">
                        <div className="flex justify-between">
                          <span className="text-sm">Texto</span>
                          <span className="text-sm font-bold">85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Templates</span>
                          <span className="text-sm font-bold">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Mídia</span>
                          <span className="text-sm font-bold">5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Top Automações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-sm">
                        <div className="flex justify-between">
                          <span className="text-sm">Boas-vindas</span>
                          <span className="text-sm font-bold">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Horário</span>
                          <span className="text-sm font-bold">89</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Localização</span>
                          <span className="text-sm font-bold">67</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-md">
          <WhatsAppConfigStatus />
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configure o comportamento do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-xl">
              <div className="space-y-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Respostas Automáticas</h3>
                    <p className="text-sm text-neutral-textSecondary">
                      Enviar respostas automáticas quando a mensagem não for reconhecida
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Horário de Atendimento</h3>
                    <p className="text-sm text-neutral-textSecondary">
                      Definir horários em que o sistema deve responder automaticamente
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações</h3>
                    <p className="text-sm text-neutral-textSecondary">
                      Configurar notificações para a equipe quando receber mensagens
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Templates</h3>
                    <p className="text-sm text-neutral-textSecondary">
                      Gerenciar templates aprovados pelo WhatsApp Business
                    </p>
                  </div>
                  <Button variant="outline">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppManagementPage;

