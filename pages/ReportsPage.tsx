// pages/ReportsPage.tsx
import React, { useState } from 'react';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Calendar,
  Settings,
  Download,
  Filter
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
          <p className="text-gray-600">Análise completa de performance e métricas do sistema</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
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
        <TabsContent value="dashboard" className="mt-6">
          <ReportsDashboard />
        </TabsContent>

        {/* Consumption Tab */}
        <TabsContent value="consumption" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Relatórios de Consumo de Insumos
            </h2>
            <p className="text-gray-600 mb-6">
              Análise detalhada do consumo de insumos por período, categoria e fornecedor.
            </p>
            
            {/* Placeholder para relatórios de consumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Consumo por Período</h3>
                <p className="text-sm text-gray-600">Relatório de consumo diário, semanal e mensal</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Consumo por Categoria</h3>
                <p className="text-sm text-gray-600">Análise de consumo por categoria de insumo</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Consumo por Fornecedor</h3>
                <p className="text-sm text-gray-600">Performance de consumo por fornecedor</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Relatórios de Custos
            </h2>
            <p className="text-gray-600 mb-6">
              Análise de custos por procedimento, paciente e terapeuta.
            </p>
            
            {/* Placeholder para relatórios de custos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Custos por Procedimento</h3>
                <p className="text-sm text-gray-600">Análise de custos por tipo de procedimento</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Custos por Paciente</h3>
                <p className="text-sm text-gray-600">Custos totais por paciente</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Custos por Terapeuta</h3>
                <p className="text-sm text-gray-600">Performance de custos por terapeuta</p>
                <Button size="sm" className="mt-3 w-full">Gerar Relatório</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações de Relatórios
            </h2>
            <p className="text-gray-600 mb-6">
              Configure relatórios agendados e preferências de exportação.
            </p>
            
            {/* Placeholder para configurações */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Relatórios Agendados</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure relatórios que são gerados automaticamente
                </p>
                <Button size="sm">Gerenciar Agendamentos</Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Preferências de Exportação</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure formatos e opções de exportação
                </p>
                <Button size="sm">Configurar Exportação</Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Histórico de Relatórios</h3>
                <p className="text-sm text-gray-600 mb-4">
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