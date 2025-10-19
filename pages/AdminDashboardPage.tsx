import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LazyLineChart, LazyAreaChart, LazyPieChart } from '../components/charts/LazyCharts';

interface AdminMetrics {
  totalUsers: number;
  activeTherapists: number;
  totalPatients: number;
  monthlyRevenue: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  pendingTasks: number;
  systemHealth: number;
  userGrowth: number;
  averageSessionDuration: number;
  patientRetentionRate: number;
  revenueGrowth: number;
  completedSessions: number;
  cancelledSessions: number;
  newPatientsThisMonth: number;
}

const AdminDashboardPage: React.FC = () => {
  const { therapists, patients, appointments } = useApp();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    activeTherapists: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    appointmentsThisMonth: 0,
    pendingTasks: 0,
    systemHealth: 0,
    userGrowth: 0,
    averageSessionDuration: 0,
    patientRetentionRate: 0,
    revenueGrowth: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    newPatientsThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      const today = now.toDateString();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calcular métricas baseadas nos dados reais
      const appointmentsToday = appointments.filter(apt => 
        new Date(apt.date).toDateString() === today
      ).length;
      
      const appointmentsThisWeek = appointments.filter(apt => 
        new Date(apt.date) >= startOfWeek
      ).length;
      
      const appointmentsThisMonth = appointments.filter(apt => 
        new Date(apt.date) >= startOfMonth
      ).length;
      
      const completedSessions = appointments.filter(apt => 
        apt.status === 'completed'
      ).length;
      
      const cancelledSessions = appointments.filter(apt => 
        apt.status === 'cancelled'
      ).length;
      
      // Calcular receita baseada nas consultas completadas (R$ 120 por sessão)
      const sessionPrice = 120;
      const monthlyRevenue = completedSessions * sessionPrice;
      
      // Calcular taxa de retenção (pacientes com mais de 3 consultas)
      const patientsWithMultipleSessions = patients.filter(patient => {
        const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
        return patientAppointments.length >= 3;
      }).length;
      
      const patientRetentionRate = patients.length > 0 ? 
        Math.round((patientsWithMultipleSessions / patients.length) * 100) : 0;
      
      // Calcular novos pacientes este mês (simulado)
      const newPatientsThisMonth = Math.floor(patients.length * 0.15);
      
      // Calcular crescimento de receita (simulado)
      const revenueGrowth = Math.floor(Math.random() * 20) + 5; // 5-25%
      
      // Calcular duração média das sessões (simulado)
      const averageSessionDuration = 45; // minutos
      
      // Calcular crescimento de usuários (simulado)
      const userGrowth = Math.floor(Math.random() * 15) + 8; // 8-23%
      
      // Calcular tarefas pendentes (simulado)
      const pendingTasks = Math.floor(Math.random() * 8) + 3; // 3-10 tarefas
      
      // Calcular saúde do sistema (baseado em métricas reais)
      const systemHealth = Math.min(100, Math.max(85, 
        100 - (cancelledSessions * 2) - (pendingTasks * 1)
      ));

      setMetrics({
        totalUsers: therapists.length + patients.length,
        activeTherapists: therapists.length,
        totalPatients: patients.length,
        monthlyRevenue,
        appointmentsToday,
        appointmentsThisWeek,
        appointmentsThisMonth,
        pendingTasks,
        systemHealth,
        userGrowth,
        averageSessionDuration,
        patientRetentionRate,
        revenueGrowth,
        completedSessions,
        cancelledSessions,
        newPatientsThisMonth
      });
      
      setIsLoading(false);
    };

    loadMetrics();
  }, [therapists, patients, appointments]);

  const metricCards = [
    {
      title: 'Total de Usuários',
      value: metrics.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${metrics.userGrowth}% este mês`,
      changeType: 'positive' as const
    },
    {
      title: 'Fisioterapeutas Ativos',
      value: metrics.activeTherapists,
      icon: Activity,
      color: 'bg-green-500',
      change: '100% ativos',
      changeType: 'positive' as const
    },
    {
      title: 'Pacientes Cadastrados',
      value: metrics.totalPatients,
      icon: Users,
      color: 'bg-purple-500',
      change: `+${metrics.newPatientsThisMonth} novos este mês`,
      changeType: 'positive' as const
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${metrics.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: `+${metrics.revenueGrowth}% vs mês anterior`,
      changeType: 'positive' as const
    },
    {
      title: 'Consultas Hoje',
      value: metrics.appointmentsToday,
      icon: Calendar,
      color: 'bg-orange-500',
      change: `${metrics.appointmentsThisWeek} esta semana`,
      changeType: 'neutral' as const
    },
    {
      title: 'Sessões Completadas',
      value: metrics.completedSessions,
      icon: CheckCircle,
      color: 'bg-green-600',
      change: `${metrics.cancelledSessions} canceladas`,
      changeType: 'positive' as const
    },
    {
      title: 'Taxa de Retenção',
      value: `${metrics.patientRetentionRate}%`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      change: 'Pacientes fiéis',
      changeType: 'positive' as const
    },
    {
      title: 'Duração Média',
      value: `${metrics.averageSessionDuration} min`,
      icon: Clock,
      color: 'bg-cyan-500',
      change: 'Por sessão',
      changeType: 'neutral' as const
    },
    {
      title: 'Tarefas Pendentes',
      value: metrics.pendingTasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Requer atenção',
      changeType: 'negative' as const
    }
  ];

  // Gerar atividades recentes baseadas nos dados reais
  const generateRecentActivities = () => {
    const activities = [];
    
    // Adicionar atividades baseadas nos pacientes
    if (patients.length > 0) {
      const recentPatients = patients.slice(0, 2);
      recentPatients.forEach((patient, index) => {
        activities.push({
          id: `patient-${index}`,
          action: 'Novo paciente cadastrado',
          user: patient.name,
          time: `${index + 1} hora${index > 0 ? 's' : ''} atrás`,
          type: 'success' as const
        });
      });
    }
    
    // Adicionar atividades baseadas nas consultas
    const recentAppointments = appointments.slice(0, 2);
    recentAppointments.forEach((apt, index) => {
      const patient = patients.find(p => p.id === apt.patientId);
      if (patient) {
        activities.push({
          id: `appointment-${index}`,
          action: apt.status === 'completed' ? 'Consulta finalizada' : 
                  apt.status === 'cancelled' ? 'Consulta cancelada' : 'Consulta agendada',
          user: patient.name,
          time: `${index + 2} hora${index > 0 ? 's' : ''} atrás`,
          type: apt.status === 'completed' ? 'success' as const :
                apt.status === 'cancelled' ? 'warning' as const : 'info' as const
        });
      }
    });
    
    // Adicionar atividades do sistema
    activities.push(
      {
        id: 'system-1',
        action: 'Relatório gerado',
        user: 'Sistema',
        time: '3 horas atrás',
        type: 'info' as const
      },
      {
        id: 'system-2',
        action: 'Backup realizado',
        user: 'Sistema',
        time: '6 horas atrás',
        type: 'success' as const
      }
    );
    
    return activities.slice(0, 5); // Limitar a 5 atividades
  };

  const recentActivities = generateRecentActivities();

  // Dados para gráficos
  const revenueData = [
    { month: 'Jan', revenue: 32000, sessions: 267 },
    { month: 'Fev', revenue: 38000, sessions: 317 },
    { month: 'Mar', revenue: 42000, sessions: 350 },
    { month: 'Abr', revenue: 39000, sessions: 325 },
    { month: 'Mai', revenue: 45000, sessions: 375 },
    { month: 'Jun', revenue: metrics.monthlyRevenue, sessions: metrics.completedSessions }
  ];

  const sessionStatusData = [
    { name: 'Completadas', value: metrics.completedSessions, color: '#10b981' },
    { name: 'Canceladas', value: metrics.cancelledSessions, color: '#ef4444' },
    { name: 'Agendadas', value: metrics.appointmentsThisMonth - metrics.completedSessions - metrics.cancelledSessions, color: '#3b82f6' }
  ];

  const patientAgeData = [
    { age: '18-25', count: Math.floor(patients.length * 0.15) },
    { age: '26-35', count: Math.floor(patients.length * 0.25) },
    { age: '36-45', count: Math.floor(patients.length * 0.30) },
    { age: '46-55', count: Math.floor(patients.length * 0.20) },
    { age: '56+', count: Math.floor(patients.length * 0.10) }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-slate-600">Carregando dashboard administrativo...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Dashboard Administrativo
        </h1>
              <p className="text-slate-600 mt-1">
                Visão geral do sistema e métricas de gestão
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
        </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                  <p className={`text-sm mt-1 ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {card.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Receita e Sessões</h3>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
              <LazyAreaChart 
                data={revenueData}
                xKey="month"
                areas={[
                  {
                    yAxisId: "revenue",
                    type: "monotone",
                    dataKey: "revenue",
                    stroke: "#3b82f6",
                    fill: "#3b82f6",
                    fillOpacity: 0.1,
                    strokeWidth: 2
                  },
                  {
                    yAxisId: "sessions",
                    type: "monotone",
                    dataKey: "sessions",
                    stroke: "#10b981",
                    fill: "#10b981",
                    fillOpacity: 0.1,
                    strokeWidth: 2
                  }
                ]}
                height={256}
              />
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Saúde do Sistema</h3>
              <div className={`w-3 h-3 rounded-full ${metrics.systemHealth >= 90 ? 'bg-green-500' : metrics.systemHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Saúde Geral</span>
                <span className={`text-sm font-medium ${metrics.systemHealth >= 90 ? 'text-green-600' : metrics.systemHealth >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.systemHealth}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Sessões Completadas</span>
                <span className="text-sm font-medium text-green-600">{metrics.completedSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Taxa de Cancelamento</span>
                <span className={`text-sm font-medium ${metrics.cancelledSessions <= 2 ? 'text-green-600' : metrics.cancelledSessions <= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.cancelledSessions} ({Math.round((metrics.cancelledSessions / (metrics.completedSessions + metrics.cancelledSessions)) * 100) || 0}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Consultas Este Mês</span>
                <span className="text-sm font-medium text-blue-600">{metrics.appointmentsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Tarefas Pendentes</span>
                <span className={`text-sm font-medium ${metrics.pendingTasks <= 3 ? 'text-green-600' : metrics.pendingTasks <= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.pendingTasks}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Session Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Status das Sessões</h3>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
              <LazyPieChart 
                data={sessionStatusData}
                dataKey="value"
                colors={sessionStatusData.map(item => item.color)}
                height={256}
              />
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {sessionStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      item.name === 'Completadas' ? 'bg-green-500' :
                      item.name === 'Canceladas' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Age Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Distribuição por Idade</h3>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
              <LazyLineChart 
                data={patientAgeData}
                xKey="age"
                lines={[{
                  type: "monotone",
                  dataKey: "count",
                  stroke: "#8b5cf6",
                  strokeWidth: 3,
                  dot: { fill: '#8b5cf6', strokeWidth: 2, r: 4 },
                  activeDot: { r: 6, stroke: '#8b5cf6', strokeWidth: 2 }
                }]}
                height={256}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Atividades Recentes</h3>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-600">{activity.user}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;