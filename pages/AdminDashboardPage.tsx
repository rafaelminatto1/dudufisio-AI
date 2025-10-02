import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DollarSign,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

// Dados mock para demonstração
const mockFinancialData = {
  monthlyRevenue: 125000,
  averageTicket: 150,
  occupancyRate: 85,
  partnerCommissions: 25000,
    revenueGrowth: 12.5,
  ticketGrowth: 8.3
};

const mockOperationalData = {
  activePatients: 450,
  inactivePatients: 50,
  abandonmentRate: 5.2,
  averageSessionsUntilDischarge: 12
};

const mockAlerts = [
    {
      id: '1',
    type: 'warning' as const,
    title: 'Taxa de Abandono Alta',
    message: 'A taxa de abandono está 2% acima da meta',
    timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
    type: 'info' as const,
    title: 'Novo Relatório Disponível',
    message: 'Relatório mensal de performance está pronto',
    timestamp: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
    type: 'success' as const,
    title: 'Meta de Receita Atingida',
    message: 'Meta mensal de receita foi superada em 15%',
    timestamp: '2024-01-14T16:45:00Z'
  }
];

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-xl text-slate-600">
              Visão geral da performance e operações da clínica
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Alertas */}
        <div className="mb-6 space-y-3">
          {mockAlerts.map(alert => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              alert.type === 'error' ? 'border-red-500 bg-red-50' :
              alert.type === 'success' ? 'border-green-500 bg-green-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 mr-3 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financeiro</span>
          </TabsTrigger>
            <TabsTrigger value="operational" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Operacional</span>
          </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

          {/* Tab Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
        {/* Métricas Financeiras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    +{formatPercentage(mockFinancialData.revenueGrowth)} vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.averageTicket)}</div>
                  <p className="text-xs text-muted-foreground">
                    +{formatPercentage(mockFinancialData.ticketGrowth)} vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockFinancialData.occupancyRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: 80%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comissões Parceiros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.partnerCommissions)}</div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                  </p>
                </CardContent>
              </Card>
          </div>

        {/* Métricas Operacionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOperationalData.activePatients}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((mockOperationalData.activePatients / (mockOperationalData.activePatients + mockOperationalData.inactivePatients)) * 100)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Abandono</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockOperationalData.abandonmentRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: &lt; 5%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessões até Alta</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOperationalData.averageSessionsUntilDischarge}</div>
                  <p className="text-xs text-muted-foreground">
                    Sessões em média
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Inativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOperationalData.inactivePatients}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 dias
                  </p>
                </CardContent>
              </Card>
          </div>
        </TabsContent>

          {/* Tab Financeiro */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    +{formatPercentage(mockFinancialData.revenueGrowth)} vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.averageTicket)}</div>
                  <p className="text-xs text-muted-foreground">
                    +{formatPercentage(mockFinancialData.ticketGrowth)} vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockFinancialData.occupancyRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: 80%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comissões Parceiros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.partnerCommissions)}</div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                  </p>
                </CardContent>
              </Card>
                  </div>

            <Card>
              <CardHeader>
                <CardTitle>Evolução da Receita</CardTitle>
                <CardDescription>Receita mensal dos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Gráfico de evolução da receita</p>
                    <p className="text-sm">Dados serão carregados em breve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Operacional */}
          <TabsContent value="operational" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOperationalData.activePatients}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((mockOperationalData.activePatients / (mockOperationalData.activePatients + mockOperationalData.inactivePatients)) * 100)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Abandono</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockOperationalData.abandonmentRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: &lt; 5%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessões até Alta</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOperationalData.averageSessionsUntilDischarge}</div>
                  <p className="text-xs text-muted-foreground">
                    Sessões em média
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Inativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOperationalData.inactivePatients}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Produtividade dos Profissionais</CardTitle>
                <CardDescription>Número de sessões por profissional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Gráfico de produtividade</p>
                    <p className="text-sm">Dados serão carregados em breve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Pacientes</CardTitle>
                  <CardDescription>Por faixa etária e gênero</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>Gráfico de distribuição</p>
                      <p className="text-sm">Dados serão carregados em breve</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance dos Profissionais</CardTitle>
                  <CardDescription>Receita gerada por profissional</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>Gráfico de performance</p>
                      <p className="text-sm">Dados serão carregados em breve</p>
                </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;