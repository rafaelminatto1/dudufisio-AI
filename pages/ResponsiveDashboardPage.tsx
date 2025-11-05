import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Activity, TrendingUp, DollarSign, Clock,
  ChevronUp, ChevronDown, AlertCircle, CheckCircle, XCircle,
  BarChart3, PieChart, LineChart, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from '@/components/charts/ChartsLazyOptimized';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente de Card de Métrica Responsivo
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'warning' | 'error' | 'success';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  onClick
}) => {
  const colorClasses = {
    primary: 'bg-fisio-primary-50 text-fisio-primary-700 border-fisio-primary-200',
    secondary: 'bg-fisio-secondary-50 text-fisio-secondary-700 border-fisio-secondary-200',
    warning: 'bg-fisio-warning-50 text-fisio-warning-700 border-fisio-warning-200',
    error: 'bg-fisio-error-50 text-fisio-error-700 border-fisio-error-200',
    success: 'bg-fisio-secondary-50 text-fisio-secondary-700 border-fisio-secondary-200',
  };

  const iconBgClasses = {
    primary: 'bg-fisio-primary-100',
    secondary: 'bg-fisio-secondary-100',
    warning: 'bg-fisio-warning-100',
    error: 'bg-fisio-error-100',
    success: 'bg-fisio-secondary-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border p-4 sm:p-6
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-fisio-neutral-600 mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-fisio-neutral-800">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-fisio-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <ChevronUp className="w-4 h-4 text-fisio-secondary-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-fisio-error-600" />
              )}
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-fisio-secondary-600' : 'text-fisio-error-600'
              }`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-fisio-neutral-500 ml-1">
                vs. mês anterior
              </span>
            </div>
          )}
        </div>
        <div className={`
          p-3 rounded-lg ${iconBgClasses[color]}
        `}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Lista de Atividades Recentes
interface ActivityItem {
  id: string;
  type: 'appointment' | 'patient' | 'payment' | 'exercise';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

const RecentActivityList: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const getIcon = (type: string, status?: string) => {
    if (status === 'error') return <XCircle className="w-5 h-5 text-fisio-error-500" />;
    if (status === 'warning') return <AlertCircle className="w-5 h-5 text-fisio-warning-500" />;
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-fisio-secondary-500" />;
    
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-fisio-primary-500" />;
      case 'patient':
        return <Users className="w-5 h-5 text-fisio-neutral-500" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-fisio-secondary-500" />;
      case 'exercise':
        return <Activity className="w-5 h-5 text-fisio-warning-500" />;
      default:
        return <Clock className="w-5 h-5 text-fisio-neutral-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 sm:p-6 border-b border-fisio-neutral-200">
        <h3 className="text-lg font-semibold text-fisio-neutral-800">
          Atividades Recentes
        </h3>
      </div>
      <div className="divide-y divide-fisio-neutral-100">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 hover:bg-fisio-neutral-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fisio-neutral-800 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-fisio-neutral-500 mt-1">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-fisio-neutral-400 whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="p-4 border-t border-fisio-neutral-100">
        <button className="text-sm text-fisio-primary-600 hover:text-fisio-primary-700 font-medium flex items-center">
          Ver todas as atividades
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

// Componente de Gráfico Responsivo
const ResponsiveChart: React.FC<{ 
  title: string;
  type: 'area' | 'bar' | 'pie';
  data: any[];
  height?: number;
}> = ({ title, type, data, height = 300 }) => {
  const COLORS = [
    '#007BFF', // Azul principal
    '#28A745', // Verde
    '#FFC107', // Amarelo
    '#DC3545', // Vermelho
    '#6C757D', // Cinza
  ];

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                stroke="#6C757D"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6C757D"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #E9ECEF',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#007BFF" 
                fill="#007BFF" 
                fillOpacity={0.2}
              />
              <Area 
                type="monotone" 
                dataKey="value2" 
                stroke="#28A745" 
                fill="#28A745" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                stroke="#6C757D"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6C757D"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #E9ECEF',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#007BFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RePieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-fisio-neutral-800 mb-4">
        {title}
      </h3>
      {renderChart()}
    </div>
  );
};

// Componente Principal do Dashboard Responsivo
export default function ResponsiveDashboardPage() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  // Dados mock para demonstração
  const metrics = [
    {
      title: 'Consultas Hoje',
      value: '12',
      subtitle: '3 confirmadas',
      icon: Calendar,
      trend: { value: 15, isPositive: true },
      color: 'primary' as const,
      onClick: () => navigate('/agenda')
    },
    {
      title: 'Pacientes Ativos',
      value: '248',
      subtitle: '12 novos este mês',
      icon: Users,
      trend: { value: 8, isPositive: true },
      color: 'secondary' as const,
      onClick: () => navigate('/patients')
    },
    {
      title: 'Sessões Concluídas',
      value: '89',
      subtitle: 'Esta semana',
      icon: Activity,
      trend: { value: 12, isPositive: true },
      color: 'success' as const,
      onClick: () => navigate('/acompanhamento')
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 15.420',
      subtitle: 'Projeção: R$ 18.000',
      icon: DollarSign,
      trend: { value: 5, isPositive: false },
      color: 'warning' as const,
      onClick: () => navigate('/financials')
    }
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Nova consulta agendada',
      description: 'João Silva - 14:00',
      time: '5 min',
      status: 'success'
    },
    {
      id: '2',
      type: 'patient',
      title: 'Novo paciente cadastrado',
      description: 'Maria Oliveira',
      time: '1h',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'Pedro Santos - R$ 150,00',
      time: '2h',
      status: 'success'
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Consulta cancelada',
      description: 'Ana Costa - 16:00',
      time: '3h',
      status: 'error'
    },
    {
      id: '5',
      type: 'exercise',
      title: 'Novo exercício adicionado',
      description: 'Fortalecimento lombar',
      time: '5h',
    }
  ];

  const chartData = {
    revenue: [
      { name: 'Jan', value: 12500, value2: 11000 },
      { name: 'Fev', value: 13800, value2: 12500 },
      { name: 'Mar', value: 14200, value2: 13000 },
      { name: 'Abr', value: 15100, value2: 14500 },
      { name: 'Mai', value: 14800, value2: 14200 },
      { name: 'Jun', value: 15420, value2: 15000 },
    ],
    sessions: [
      { name: 'Seg', value: 18 },
      { name: 'Ter', value: 22 },
      { name: 'Qua', value: 25 },
      { name: 'Qui', value: 20 },
      { name: 'Sex', value: 28 },
      { name: 'Sáb', value: 15 },
    ],
    distribution: [
      { name: 'Ortopedia', value: 35 },
      { name: 'Neurologia', value: 25 },
      { name: 'Respiratória', value: 20 },
      { name: 'Desportiva', value: 15 },
      { name: 'Outros', value: 5 },
    ]
  };

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fisio-primary-DEFAULT"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header do Dashboard */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fisio-neutral-800">
              Olá, {user?.name?.split(' ')[0] || 'Doutor'}! 👋
            </h1>
            <p className="text-fisio-neutral-600 mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-fisio-neutral-50 border border-fisio-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fisio-primary-500"
            >
              <option value="day">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Métricas - Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Gráficos - Layout Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveChart
          title="Receita e Sessões"
          type="area"
          data={chartData.revenue}
          height={250}
        />
        <ResponsiveChart
          title="Sessões por Dia"
          type="bar"
          data={chartData.sessions}
          height={250}
        />
      </div>

      {/* Atividades e Distribuição - Layout Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityList activities={recentActivities} />
        </div>
        <div className="lg:col-span-1">
          <ResponsiveChart
            title="Distribuição por Especialidade"
            type="pie"
            data={chartData.distribution}
            height={300}
          />
        </div>
      </div>

      {/* Cards de Ação Rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/agenda')}
          className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all text-center group"
        >
          <Calendar className="w-8 h-8 text-fisio-primary-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-fisio-neutral-700">Nova Consulta</p>
        </button>
        <button
          onClick={() => navigate('/patients/new')}
          className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all text-center group"
        >
          <Users className="w-8 h-8 text-fisio-secondary-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-fisio-neutral-700">Novo Paciente</p>
        </button>
        <button
          onClick={() => navigate('/exercises')}
          className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all text-center group"
        >
          <Activity className="w-8 h-8 text-fisio-warning-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-fisio-neutral-700">Exercícios</p>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all text-center group"
        >
          <BarChart3 className="w-8 h-8 text-fisio-error-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-fisio-neutral-700">Relatórios</p>
        </button>
      </div>
    </div>
  );
}
