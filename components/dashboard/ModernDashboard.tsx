import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { GradientCard } from '../ui/GradientCard';
import { StatisticCard } from '../ui/StatisticCard';

interface ModernDashboardProps {
  user?: {
    name: string;
    role: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const ModernDashboard: React.FC<ModernDashboardProps> = ({ user }) => {
  const stats = [
    {
      title: 'Total de Pacientes',
      value: '248',
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Consultas Hoje',
      value: '12',
      change: '+3',
      trend: 'up' as const,
      icon: Calendar,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Taxa de Conclusão',
      value: '94%',
      change: '+5%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45.2k',
      change: '+18%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const quickActions = [
    {
      title: 'Novo Paciente',
      icon: Users,
      href: '/patients/new',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      description: 'Cadastrar novo paciente'
    },
    {
      title: 'Agendar Consulta',
      icon: Calendar,
      href: '/agenda',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      description: 'Criar novo agendamento'
    },
    {
      title: 'Ver Exercícios',
      icon: Activity,
      href: '/exercises',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      description: 'Biblioteca de exercícios'
    },
    {
      title: 'Relatórios',
      icon: TrendingUp,
      href: '/reports',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      description: 'Gerar relatórios'
    }
  ];

  const recentActivity = [
    {
      patient: 'Maria Silva',
      action: 'Consulta realizada',
      time: 'Há 30 min',
      type: 'success'
    },
    {
      patient: 'João Santos',
      action: 'Agendamento confirmado',
      time: 'Há 1 hora',
      type: 'info'
    },
    {
      patient: 'Ana Costa',
      action: 'Aguardando confirmação',
      time: 'Há 2 horas',
      type: 'warning'
    }
  ];

  return (
    <motion.div
      className="space-y-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10">
            <motion.h1
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Bem-vindo de volta, {user?.name || 'Profissional'}! 👋
            </motion.h1>
            <motion.p
              className="text-white/90 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Aqui está um resumo do seu dia
            </motion.p>

            <motion.div
              className="mt-6 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center space-x-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">12 consultas agendadas</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <StatisticCard {...stat} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.title}
                href={action.href}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10 space-y-3">
                  <action.icon className="w-8 h-8" />
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                  <p className="text-sm text-white/80">{action.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity & Upcoming */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GradientCard
          title="Atividade Recente"
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
        >
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 rounded-lg bg-slate-50 p-4 transition-all hover:bg-slate-100"
              >
                <div className={`rounded-full p-2 ${
                  activity.type === 'success' ? 'bg-green-100 text-green-600' :
                  activity.type === 'info' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {activity.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                   activity.type === 'info' ? <Calendar className="w-4 h-4" /> :
                   <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.patient}</p>
                  <p className="text-sm text-slate-600">{activity.action}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </GradientCard>

        {/* Upcoming Appointments */}
        <GradientCard
          title="Próximas Consultas"
          icon={Calendar}
          gradient="from-purple-500 to-pink-500"
        >
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 rounded-lg bg-slate-50 p-4 transition-all hover:bg-slate-100"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  {`${9 + index}:00`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">Paciente {index + 1}</p>
                  <p className="text-xs text-slate-600">Fisioterapia - Sessão {index + 1}</p>
                </div>
                <button className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 transition-colors">
                  Ver detalhes
                </button>
              </motion.div>
            ))}
          </div>
        </GradientCard>
      </motion.div>
    </motion.div>
  );
};

export default ModernDashboard;
