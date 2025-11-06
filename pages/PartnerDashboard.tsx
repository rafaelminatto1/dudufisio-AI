import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import {
  Users, TrendingUp, DollarSign, Calendar,
  Target, Award, Activity, Clock,
  PieChart, BarChart, FileText, CheckCircle2,
  AlertCircle, Eye, ArrowUpRight, Phone, Mail
} from 'lucide-react';
import { useData } from "../contexts/AppContext";
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import { auditService } from '../services/auditService';
import { Patient, Appointment } from '../types';

/**
 * 🤝 DASHBOARD DO PARCEIRO
 *
 * Dashboard profissional para parceiros e profissionais externos com foco em:
 * - Métricas de colaboração e referenciamento
 * - Performance dos pacientes referenciados
 * - Comissões e indicadores financeiros de parceria
 * - Oportunidades de negócio e networking
 */

interface PartnerMetrics {
  totalReferrals: number;
  activeReferrals: number;
  monthlyGrowth: number;
  partnershipValue: number;
  successRate: number;
  avgTreatmentTime: number;
  pendingReviews: number;
  communicationScore: number;
}

interface PartnerReferral {
  id: string;
  patientName: string;
  condition: string;
  referralDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  progress: number;
  estimatedValue: number;
  priority: 'high' | 'medium' | 'low';
}

// Componente de Métrica Empresarial
const BusinessMetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: { value: number; positive: boolean };
  action?: { label: string; onClick: () => void };
  highlight?: boolean;
}> = ({ title, value, subtitle, icon: Icon, trend, action, highlight }) => (
  <div className={`bg-white rounded-card shadow-card border p-lg transition-all hover:shadow-cardHover ${highlight ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' : 'border-neutral-border'}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-md">
          <div className={`p-md rounded-lg ${highlight ? 'bg-purple-100' : 'bg-primary-light'}`}>
            <Icon className={`w-5 h-5 ${highlight ? 'text-purple-600' : 'text-primary'}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${highlight ? 'text-purple-800' : 'text-neutral-textSecondary'}`}>{title}</p>
            <p className={`text-2xl font-bold ${highlight ? 'text-purple-900' : 'text-neutral-text'}`}>{value}</p>
            {subtitle && (
              <p className={`text-xs ${highlight ? 'text-purple-600' : 'text-neutral-textSecondary'}`}>{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-sm">
        {trend && (
          <div className={`text-sm font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-primary hover:text-blue-800 flex items-center gap-1"
          >
            {action.label}
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  </div>
);

// Componente de Referência de Paciente
const ReferralCard: React.FC<{
  referral: PartnerReferral;
  onViewDetails: (referral: PartnerReferral) => void;
}> = ({ referral, onViewDetails }) => {
  const statusConfig = {
    'pending': { color: 'text-warning', bg: 'bg-warning-light', label: 'Pendente' },
    'active': { color: 'text-primary', bg: 'bg-primary-light', label: 'Em Tratamento' },
    'completed': { color: 'text-success', bg: 'bg-success-light', label: 'Concluído' },
    'cancelled': { color: 'text-error', bg: 'bg-error-light', label: 'Cancelado' }
  };

  const priorityConfig = {
    'high': { color: 'text-error', icon: '🔴' },
    'medium': { color: 'text-warning', icon: '🟡' },
    'low': { color: 'text-success', icon: '🟢' }
  };

  const config = statusConfig[referral.status];
  const priority = priorityConfig[referral.priority];

  return (
    <div className="bg-white rounded-lg border border-neutral-border p-md hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-neutral-text">{referral.patientName}</p>
            <p className="text-sm text-neutral-textSecondary flex items-center gap-1">
              {priority.icon} {referral.condition}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <span className={`px-md py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <button
            onClick={() => onViewDetails(referral)}
            className="p-sm text-neutral-textTertiary hover:text-neutral-textSecondary rounded-full hover:bg-neutral-bgDark"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {referral.status === 'active' && (
        <div className="mb-md">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-textSecondary">Progresso</span>
            <span className="font-medium">{referral.progress}%</span>
          </div>
          <div className="w-full bg-neutral-bgDark rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${referral.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-textSecondary">
          Referenciado em: {new Date(referral.referralDate).toLocaleDateString('pt-BR')}
        </span>
        <span className="font-medium text-success">
          R$ {referral.estimatedValue.toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
};

const PartnerDashboard: React.FC = () => {
  const { user } = useData();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log de auditoria para acesso ao dashboard
  useEffect(() => {
    auditService.createLog({
      user: user?.name || 'Partner User',
      action: 'VIEW_PARTNER_DASHBOARD' as any,
      details: 'Acessou dashboard de parceiro',
      resourceType: undefined
    });
  }, [user]);

  // Dados mock para demonstração
  const partnerMetrics: PartnerMetrics = {
    totalReferrals: 89,
    activeReferrals: 23,
    monthlyGrowth: 18.5,
    partnershipValue: 45720,
    successRate: 94.2,
    avgTreatmentTime: 8.3,
    pendingReviews: 3,
    communicationScore: 9.1
  };

  const mockReferrals: PartnerReferral[] = [
    {
      id: '1',
      patientName: 'Maria Silva Santos',
      condition: 'Lesão no Ombro - Bursite',
      referralDate: '2024-03-20',
      status: 'active',
      progress: 75,
      estimatedValue: 2850,
      priority: 'high'
    },
    {
      id: '2',
      patientName: 'João Carlos Oliveira',
      condition: 'Reabilitação Pós-Cirúrgica',
      referralDate: '2024-03-18',
      status: 'pending',
      progress: 0,
      estimatedValue: 4200,
      priority: 'medium'
    },
    {
      id: '3',
      patientName: 'Ana Beatriz Costa',
      condition: 'Dor Lombar Crônica',
      referralDate: '2024-03-15',
      status: 'completed',
      progress: 100,
      estimatedValue: 3600,
      priority: 'low'
    }
  ];

  const handleViewReferralDetails = async (referral: PartnerReferral) => {
    await auditService.createLog({
      user: user?.name || 'Partner User',
      action: 'VIEW_REFERRAL_DETAILS' as any,
      details: `Visualizou detalhes da referência: ${referral.patientName}`,
      resourceId: referral.id,
      resourceType: undefined
    });
    // Implementar modal de detalhes
    
  };

  const handleContactClinic = async () => {
    await auditService.createLog({
      user: user?.name || 'Partner User',
      action: 'CONTACT_CLINIC' as any,
      details: 'Iniciou contato com a clínica',
      resourceType: undefined
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-smxl">
      <PageHeader
        title="Dashboard de Parceiro"
        subtitle="Gerencie suas referências e acompanhe o crescimento da sua rede de colaboração."
      />

      {/* Métricas Principais de Parceria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <BusinessMetricCard
          title="Total de Referências"
          value={partnerMetrics.totalReferrals}
          icon={Users}
          trend={{ value: partnerMetrics.monthlyGrowth, positive: true }}
          highlight={true}
        />

        <BusinessMetricCard
          title="Referências Ativas"
          value={partnerMetrics.activeReferrals}
          subtitle="Em tratamento"
          icon={Activity}
          action={{ label: "Ver detalhes", onClick: () => {} }}
        />

        <BusinessMetricCard
          title="Valor da Parceria"
          value={`R$ ${partnerMetrics.partnershipValue.toLocaleString('pt-BR')}`}
          subtitle="Este mês"
          icon={DollarSign}
          trend={{ value: 23, positive: true }}
        />

        <BusinessMetricCard
          title="Taxa de Sucesso"
          value={`${partnerMetrics.successRate}%`}
          subtitle="Tratamentos concluídos"
          icon={Target}
          trend={{ value: 2.1, positive: true }}
        />
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <BusinessMetricCard
          title="Tempo Médio Tratamento"
          value={`${partnerMetrics.avgTreatmentTime} semanas`}
          subtitle="Por paciente referenciado"
          icon={Clock}
        />

        <BusinessMetricCard
          title="Avaliações Pendentes"
          value={partnerMetrics.pendingReviews}
          subtitle="Aguardando feedback"
          icon={AlertCircle}
          action={{ label: "Revisar", onClick: () => {} }}
        />

        <BusinessMetricCard
          title="Score de Comunicação"
          value={`${partnerMetrics.communicationScore}/10`}
          subtitle="Baseado em 47 avaliações"
          icon={Award}
          trend={{ value: 0.3, positive: true }}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Coluna Esquerda - Referências Recentes */}
        <div className="lg:col-span-2 space-y-smxl">
          <div className="bg-white rounded-card shadow-card border border-neutral-border p-lg">
            <div className="flex items-center justify-between mb-xl">
              <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                <Users className="w-5 h-5 text-purple-600" />
                Referências Recentes
              </h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Ver todas
              </button>
            </div>
            <div className="grid gap-md">
              {mockReferrals.map((referral: any) => (
                <ReferralCard
                  key={referral.id}
                  referral={referral}
                  onViewDetails={handleViewReferralDetails}
                />
              ))}
            </div>
          </div>

          {/* Performance Mensal */}
          <div className="bg-white rounded-card shadow-card border border-neutral-border p-lg">
            <h3 className="text-lg font-semibold text-neutral-text mb-md flex items-center gap-sm">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Mensal
            </h3>
            <div className="grid grid-cols-2 gap-md">
              <div className="text-center p-md bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-sm text-neutral-textSecondary">Novas Referências</p>
              </div>
              <div className="text-center p-md bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-success">8</p>
                <p className="text-sm text-neutral-textSecondary">Tratamentos Finalizados</p>
              </div>
              <div className="text-center p-md bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">R$ 15.6k</p>
                <p className="text-sm text-neutral-textSecondary">Receita Gerada</p>
              </div>
              <div className="text-center p-md bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <p className="text-2xl font-bold text-warning">9.2/10</p>
                <p className="text-sm text-neutral-textSecondary">Satisfação Média</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Ações e Contato */}
        <div className="space-y-smxl">
          {/* Central de Contato */}
          <div className="bg-white rounded-card shadow-card border border-neutral-border p-lg">
            <h3 className="text-lg font-semibold text-neutral-text mb-md">Central de Contato</h3>
            <div className="space-y-sm">
              <button
                onClick={handleContactClinic}
                className="w-full p-md bg-primary-light text-primary rounded-lg text-left hover:bg-primary-light transition-colors flex items-center gap-sm"
              >
                <Phone className="w-4 h-4" />
                Ligar para Clínica
              </button>
              <button
                onClick={handleContactClinic}
                className="w-full p-md bg-purple-50 text-purple-700 rounded-lg text-left hover:bg-purple-100 transition-colors flex items-center gap-sm"
              >
                <Mail className="w-4 h-4" />
                Enviar E-mail
              </button>
              <button className="w-full p-md bg-success-light text-success rounded-lg text-left hover:bg-success-light transition-colors flex items-center gap-sm">
                <Calendar className="w-4 h-4" />
                Agendar Reunião
              </button>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-card shadow-card border border-neutral-border p-lg">
            <h3 className="text-lg font-semibold text-neutral-text mb-md">Ações Rápidas</h3>
            <div className="space-y-sm">
              <button className="w-full p-md bg-primary-light text-primary rounded-lg text-left hover:bg-primary-light transition-colors">
                ➕ Nova Referência
              </button>
              <button className="w-full p-md bg-indigo-50 text-indigo-700 rounded-lg text-left hover:bg-indigo-100 transition-colors">
                📊 Relatório Mensal
              </button>
              <button className="w-full p-md bg-emerald-50 text-emerald-700 rounded-lg text-left hover:bg-emerald-100 transition-colors">
                💰 Extrato Financeiro
              </button>
              <button className="w-full p-md bg-amber-50 text-amber-700 rounded-lg text-left hover:bg-amber-100 transition-colors">
                🎯 Metas e Objetivos
              </button>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white rounded-card shadow-card border border-neutral-border p-lg">
            <h3 className="text-lg font-semibold text-neutral-text mb-md">Próximos Eventos</h3>
            <div className="space-y-sm">
              <div className="flex items-center gap-md p-sm rounded">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-text">Reunião Mensal</p>
                  <p className="text-xs text-neutral-textSecondary">Amanhã, 14:00</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-sm rounded">
                <div className="w-2 h-2 bg-success-light0 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-text">Workshop de Capacitação</p>
                  <p className="text-xs text-neutral-textSecondary">Sexta, 09:00</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-sm rounded">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-text">Conferência de Resultados</p>
                  <p className="text-xs text-neutral-textSecondary">Próxima semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;