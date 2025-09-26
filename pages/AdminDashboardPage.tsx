import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PageHeader from '../components/PageHeader';
import FinancialMetricsCards from '../components/admin-dashboard/FinancialMetricsCards';
import OperationalMetricsCards from '../components/admin-dashboard/OperationalMetricsCards';
import AdminAlerts, { AdminAlert } from '../components/admin-dashboard/AdminAlerts';
import RevenueEvolutionChart from '../components/admin-dashboard/RevenueEvolutionChart';
import ProfessionalProductivityChart from '../components/admin-dashboard/ProfessionalProductivityChart';
import PatientDistributionChart from '../components/admin-dashboard/PatientDistributionChart';
import DashboardFilters, { FilterOptions } from '../components/admin-dashboard/DashboardFilters';
import {
  DollarSign,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Tipos de dados
interface FinancialMetrics {
  monthlyRevenue: number;
  averageTicket: number;
  occupancyRate: number;
  partnerCommissions: number;
  revenueGrowth: number;
  ticketGrowth: number;
}

interface OperationalMetrics {
  activePatients: number;
  inactivePatients: number;
  abandonmentRate: number;
  averageSessionsUntilDischarge: number;
  professionalProductivity: Array<{
    name: string;
    sessions: number;
    revenue: number;
  }>;
}

// Removido - agora usando AdminAlert do componente

const AdminDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    period: '30',
    professional: 'all',
    paymentType: 'particular',
    status: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Dados mockados para demonstração
  const [financialData, setFinancialData] = useState<FinancialMetrics>({
    monthlyRevenue: 45680.50,
    averageTicket: 185.30,
    occupancyRate: 78.5,
    partnerCommissions: 6850.75,
    revenueGrowth: 12.5,
    ticketGrowth: 8.2
  });

  const [operationalData, setOperationalData] = useState<OperationalMetrics>({
    activePatients: 156,
    inactivePatients: 23,
    abandonmentRate: 12.8,
    averageSessionsUntilDischarge: 8.5,
    professionalProductivity: [
      { name: 'Dr. Ana Silva', sessions: 45, revenue: 8325.00 },
      { name: 'Dr. Carlos Mendes', sessions: 38, revenue: 7030.00 },
      { name: 'Dra. Maria Santos', sessions: 42, revenue: 7770.00 },
      { name: 'Dr. João Oliveira', sessions: 35, revenue: 6475.00 }
    ]
  });

  const [alerts, setAlerts] = useState<AdminAlert[]>([
    {
      id: '1',
      type: 'payment',
      title: 'Pagamentos Pendentes',
      description: '8 pacientes com pagamentos em atraso',
      severity: 'high',
      count: 8
    },
    {
      id: '2',
      type: 'material',
      title: 'Materiais Próximos ao Vencimento',
      description: '5 itens vencem nos próximos 7 dias',
      severity: 'medium',
      count: 5
    },
    {
      id: '3',
      type: 'document',
      title: 'Documentos Vencidos',
      description: '3 documentos precisam ser renovados',
      severity: 'medium',
      count: 3
    },
    {
      id: '4',
      type: 'goal',
      title: 'Metas Não Atingidas',
      description: 'Meta de faturamento mensal em 85%',
      severity: 'low'
    }
  ]);

  // Dados para gráficos
  const revenueChartData = [
    { month: 'Jan', revenue: 38500, goal: 45000 },
    { month: 'Fev', revenue: 42300, goal: 45000 },
    { month: 'Mar', revenue: 39800, goal: 45000 },
    { month: 'Abr', revenue: 45680, goal: 45000 },
    { month: 'Mai', revenue: 48200, goal: 45000 },
    { month: 'Jun', revenue: 51300, goal: 45000 }
  ];

  const patientDistributionData = [
    { name: 'Ativos', value: 156, color: '#10b981' },
    { name: 'Inativos', value: 23, color: '#ef4444' },
    { name: 'Em Avaliação', value: 12, color: '#f59e0b' }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    // Implementar exportação de dados
    console.log('Exportando dados...', filters);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simular refresh dos dados
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleViewAlertDetails = (alertId: string) => {
    console.log('Visualizar detalhes do alerta:', alertId);
  };

  const handleMarkAlertResolved = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  // Funções removidas - agora estão nos componentes específicos

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Administrativo"
        subtitle="Métricas financeiras, operacionais e alertas da clínica"
      />

      {/* Filtros */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Alertas Administrativos */}
      <AdminAlerts
        alerts={alerts}
        onViewDetails={handleViewAlertDetails}
        onMarkResolved={handleMarkAlertResolved}
        isLoading={isLoading}
      />

      {/* Tabs para organizar métricas */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Operacional
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        {/* Métricas Financeiras */}
        <TabsContent value="financial" className="space-y-6">
          <FinancialMetricsCards data={financialData} isLoading={isLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <RevenueEvolutionChart data={revenueChartData} isLoading={isLoading} />
          </div>
        </TabsContent>

        {/* Métricas Operacionais */}
        <TabsContent value="operational" className="space-y-6">
          <OperationalMetricsCards data={operationalData} isLoading={isLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientDistributionChart data={patientDistributionData} isLoading={isLoading} />
            <ProfessionalProductivityChart data={operationalData.professionalProductivity} isLoading={isLoading} />
          </div>
        </TabsContent>

        {/* Análises Avançadas */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise de Tendências</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Crescimento Sustentável</p>
                    <p className="text-sm text-green-600">Faturamento crescendo consistentemente</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-800">Atenção: Taxa de Abandono</p>
                    <p className="text-sm text-yellow-600">12.8% acima da meta de 10%</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">Produtividade Alta</p>
                    <p className="text-sm text-blue-600">Equipe performando acima da média</p>
                  </div>
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximas Ações Recomendadas</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Cobrar Pagamentos Pendentes</p>
                    <p className="text-xs text-gray-600">8 pacientes com atraso superior a 15 dias</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Revisar Estoque</p>
                    <p className="text-xs text-gray-600">5 itens próximos ao vencimento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Campanha de Retenção</p>
                    <p className="text-xs text-gray-600">Focar nos pacientes inativos recentes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;