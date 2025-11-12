import React from 'react';
import Section from '../components/layout/Section';
import { H1, H2, H3, Body, Small, Caption } from '../components/ui/Typography';
import Button from '../components/ui/button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import StatsCard from '../components/ui/StatsCard';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Filter,
} from 'lucide-react';

/**
 * Dashboard Example - Monday.com Inspired
 *
 * Exemplo de dashboard moderno com estatísticas e visualizações
 */
export default function DashboardExample() {
  // Mock data para appointments
  const upcomingAppointments = [
    {
      patient: 'João Silva',
      time: '09:00',
      type: 'Consulta Inicial',
      status: 'confirmed',
    },
    {
      patient: 'Maria Santos',
      time: '10:30',
      type: 'Retorno',
      status: 'confirmed',
    },
    {
      patient: 'Pedro Costa',
      time: '14:00',
      type: 'Avaliação',
      status: 'pending',
    },
    {
      patient: 'Ana Oliveira',
      time: '15:30',
      type: 'Sessão',
      status: 'confirmed',
    },
  ];

  // Mock data para recent activity
  const recentActivity = [
    {
      action: 'Nova consulta agendada',
      patient: 'Carlos Ferreira',
      time: 'há 5 minutos',
    },
    {
      action: 'Pagamento recebido',
      patient: 'Juliana Lima',
      time: 'há 15 minutos',
    },
    {
      action: 'Prontuário atualizado',
      patient: 'Roberto Alves',
      time: 'há 1 hora',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <Section variant="white" paddingY="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
          <div>
            <H1 className="text-h2">Dashboard</H1>
            <Small>Bem-vindo de volta! Aqui está um resumo do seu dia.</Small>
          </div>
          <div className="flex gap-md">
            <Button variant="outline" icon={<Filter size={18} />} iconPosition="left">
              Filtros
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} iconPosition="left">
              Nova Consulta
            </Button>
          </div>
        </div>
      </Section>

      {/* Stats Cards */}
      <Section variant="gray" paddingY="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <StatsCard
            title="Faturamento Hoje"
            value="R$ 2.450,00"
            icon={DollarSign}
            variant="primary"
            comparison="↑ 12% vs ontem"
            comparisonType="positive"
            caption="6 consultas realizadas"
          />
          <StatsCard
            title="Consultas Agendadas"
            value="14"
            icon={Calendar}
            variant="secondary"
            comparison="4 hoje, 10 amanhã"
            comparisonType="neutral"
            caption="85% de ocupação"
          />
          <StatsCard
            title="Pacientes Ativos"
            value="248"
            icon={Users}
            variant="info"
            comparison="↑ 18 este mês"
            comparisonType="positive"
            caption="92% de retenção"
          />
          <StatsCard
            title="Taxa de Comparecimento"
            value="94%"
            icon={TrendingUp}
            variant="success"
            comparison="↑ 3% vs semana passada"
            comparisonType="positive"
            caption="Excelente desempenho"
          />
        </div>
      </Section>

      {/* Main Content */}
      <Section variant="gray" paddingY="lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Agenda de Hoje</CardTitle>
                    <CardDescription>Terça-feira, 11 de Janeiro de 2025</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>
                    Ver Todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-md">
                {upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg hover:bg-neutral-bgDark transition-colors duration-200"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                        <Clock className="text-primary" size={20} />
                      </div>
                      <div>
                        <H3 className="text-base">{appointment.patient}</H3>
                        <Small className="text-neutral-textTertiary">
                          {appointment.time} • {appointment.type}
                        </Small>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      {appointment.status === 'confirmed' ? (
                        <div className="flex items-center gap-xs px-md py-xs bg-success-light rounded-full">
                          <CheckCircle2 className="text-success" size={14} />
                          <Small className="text-success">Confirmado</Small>
                        </div>
                      ) : (
                        <div className="flex items-center gap-xs px-md py-xs bg-warning-light rounded-full">
                          <AlertCircle className="text-warning" size={14} />
                          <Small className="text-warning">Pendente</Small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-lg">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Plus size={18} />}
                  iconPosition="left"
                >
                  Nova Consulta
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Users size={18} />}
                  iconPosition="left"
                >
                  Cadastrar Paciente
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<DollarSign size={18} />}
                  iconPosition="left"
                >
                  Lançar Receita
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Calendar size={18} />}
                  iconPosition="left"
                >
                  Ver Agenda Completa
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas atualizações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="space-y-xs">
                    <Body className="text-sm font-medium">{activity.action}</Body>
                    <div className="flex items-center gap-sm">
                      <Small className="text-neutral-textSecondary">{activity.patient}</Small>
                      <span className="text-neutral-textTertiary">•</span>
                      <Caption>{activity.time}</Caption>
                    </div>
                    {index < recentActivity.length - 1 && (
                      <div className="h-px bg-neutral-border mt-md" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Weekly Overview */}
      <Section variant="gray" paddingY="lg">
        <Card>
          <CardHeader>
            <CardTitle>Visão Semanal</CardTitle>
            <CardDescription>Resumo dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
              <div className="text-center space-y-sm">
                <Caption>Consultas</Caption>
                <H2 className="text-primary">42</H2>
                <Small className="text-success">↑ 8 vs semana anterior</Small>
              </div>
              <div className="text-center space-y-sm">
                <Caption>Faturamento</Caption>
                <H2 className="text-secondary">R$ 12.5K</H2>
                <Small className="text-success">↑ R$ 1.2K vs semana anterior</Small>
              </div>
              <div className="text-center space-y-sm">
                <Caption>Novos Pacientes</Caption>
                <H2 className="text-accent-blue">8</H2>
                <Small className="text-success">↑ 3 vs semana anterior</Small>
              </div>
              <div className="text-center space-y-sm">
                <Caption>Taxa de Ocupação</Caption>
                <H2 className="text-accent-orange">87%</H2>
                <Small className="text-success">↑ 5% vs semana anterior</Small>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
