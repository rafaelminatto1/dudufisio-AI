// pages/ReportsPage.tsx
import React, { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BarChart3, 
  FileText, 
  Calendar,
  Settings,
  Download,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  RefreshCw
} from 'lucide-react';

// Componente de loading para evitar timeout
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-xl">
    <RefreshCw className="h-6 w-6 animate-spin text-fisio-primary-DEFAULT" />
    <span className="ml-sm text-fisio-neutral-600">Carregando dados...</span>
  </div>
);

// Dashboard simplificado sem hooks problemáticos
const SimpleReportsDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = () => {
    setIsLoading(true);
    // Simular carregamento
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-xl">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <Card className="border-neutral-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-text">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-fisio-primary-DEFAULT" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-text">R$ 45.231,89</div>
            <p className="text-xs text-fisio-neutral-500">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-text">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-fisio-secondary-DEFAULT" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-text">+2350</div>
            <p className="text-xs text-fisio-neutral-500">
              +180.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-text">Sessões Realizadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-fisio-warning-DEFAULT" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-text">+12,234</div>
            <p className="text-xs text-fisio-neutral-500">
              +19% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insumos Utilizados</CardTitle>
            <Package className="h-4 w-4 text-neutral-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-neutral-textSecondary">
              +201 desde a última hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Rápidos</CardTitle>
          <CardDescription>
            Gere relatórios instantâneos dos principais indicadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <Button 
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-sm animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-sm" />
              )}
              Relatório de Performance
            </Button>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-sm" />
              Análise de Tendências
            </Button>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Users className="h-4 w-4 mr-sm" />
              Relatório de Pacientes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-lg space-y-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text">Relatórios e Analytics</h1>
          <p className="text-neutral-textSecondary">Análise completa de performance e métricas do sistema</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-sm" />
            Filtros
          </Button>
          
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-sm" />
            Agendar
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-sm" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          
          <TabsTrigger value="consumption" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Consumo</span>
          </TabsTrigger>
          
          <TabsTrigger value="costs" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Custos</span>
          </TabsTrigger>
          
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-xl">
          <Suspense fallback={<LoadingSpinner />}>
            <SimpleReportsDashboard />
          </Suspense>
        </TabsContent>

        {/* Consumption Tab */}
        <TabsContent value="consumption" className="mt-xl">
          <div className="bg-white rounded-lg border p-lg">
            <h2 className="text-xl font-semibold text-neutral-text mb-md">
              Relatórios de Consumo de Insumos
            </h2>
            <p className="text-neutral-textSecondary mb-xl">
              Análise detalhada do consumo de insumos por período, categoria e fornecedor.
            </p>
            
            {/* Placeholder para relatórios de consumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Consumo por Período</h3>
                <p className="text-sm text-neutral-textSecondary">Relatório de consumo diário, semanal e mensal</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Consumo por Categoria</h3>
                <p className="text-sm text-neutral-textSecondary">Análise de consumo por categoria de insumo</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Consumo por Fornecedor</h3>
                <p className="text-sm text-neutral-textSecondary">Performance de consumo por fornecedor</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="mt-xl">
          <div className="bg-white rounded-lg border p-lg">
            <h2 className="text-xl font-semibold text-neutral-text mb-md">
              Relatórios de Custos
            </h2>
            <p className="text-neutral-textSecondary mb-xl">
              Análise de custos por procedimento, paciente e terapeuta.
            </p>
            
            {/* Placeholder para relatórios de custos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Custos por Procedimento</h3>
                <p className="text-sm text-neutral-textSecondary">Análise de custos por tipo de procedimento</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Custos por Paciente</h3>
                <p className="text-sm text-neutral-textSecondary">Custos totais por paciente</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Custos por Terapeuta</h3>
                <p className="text-sm text-neutral-textSecondary">Performance de custos por terapeuta</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-xl">
          <div className="bg-white rounded-lg border p-lg">
            <h2 className="text-xl font-semibold text-neutral-text mb-md">
              Configurações de Relatórios
            </h2>
            <p className="text-neutral-textSecondary mb-xl">
              Configure relatórios agendados e preferências de exportação.
            </p>
            
            {/* Placeholder para configurações */}
            <div className="space-y-xl">
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Relatórios Agendados</h3>
                <p className="text-sm text-neutral-textSecondary mb-md">
                  Configure relatórios que são gerados automaticamente
                </p>
                <Button size="sm">Gerenciar Agendamentos</Button>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Preferências de Exportação</h3>
                <p className="text-sm text-neutral-textSecondary mb-md">
                  Configure formatos e opções de exportação
                </p>
                <Button size="sm">Configurar Exportação</Button>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-md">
                <h3 className="font-medium text-neutral-text mb-sm">Histórico de Relatórios</h3>
                <p className="text-sm text-neutral-textSecondary mb-md">
                  Visualize e gerencie relatórios gerados anteriormente
                </p>
                <Button size="sm">Ver Histórico</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;