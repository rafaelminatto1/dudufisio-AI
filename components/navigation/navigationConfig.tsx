import {
  LayoutGrid,
  Users,
  Calendar,
  Activity,
  Dumbbell,
  Library,
  BarChart3,
  BrainCircuit,
  Settings,
  Bell,
  ClipboardList,
  TrendingUp,
  Film,
  FileText,
  Search,
  Archive,
  BookMarked,
  DollarSign,
  PieChart,
  Target,
  MessageSquare,
  Mail,
  Package,
  Monitor,
  ShieldCheck,
  Users2,
  Ticket,
  Handshake,
  CreditCard,
  SlidersHorizontal,
  HardDrive,
  FileCheck,
  Sparkles,
  Zap,
  Globe,
  Wrench,
  Palette,
  Brain,
} from 'lucide-react';
import { Role } from '@/types';
import { NavItemConfig } from './NavItem';

export interface NavigationSection {
  title?: string;
  items: NavItemConfig[];
  defaultExpanded?: boolean;
}

export interface NavigationConfig {
  sections: NavigationSection[];
}

export function getNavigationConfig(role: Role, unreadCount: number = 0): NavigationConfig {
  switch (role) {
    case Role.Admin:
      return {
        sections: [
          {
            title: 'Dashboard',
            items: [
              {
                id: 'dashboard',
                to: '/dashboard',
                icon: LayoutGrid,
                label: 'Visão Geral',
              },
              {
                id: 'ai-dashboard',
                to: '/ai-dashboard',
                icon: Brain,
                label: 'Dashboard de IA',
                isNew: true,
              },
              {
                id: 'admin-dashboard',
                to: '/admin-dashboard',
                icon: BarChart3,
                label: 'Dashboard Admin',
              },
              {
                id: 'notifications',
                to: '/notifications',
                icon: Bell,
                label: 'Notificações',
                badge: unreadCount,
              },
              {
                id: 'tasks',
                to: '/tasks',
                icon: ClipboardList,
                label: 'Tarefas',
              },
            ],
          },
          {
            title: 'Gestão de Pacientes',
            items: [
              {
                id: 'patients-group',
                icon: Users,
                label: 'Pacientes',
                children: [
                  {
                    id: 'patients-all',
                    to: '/patients',
                    icon: Users,
                    label: 'Todos os Pacientes',
                  },
                  {
                    id: 'patients-alerts',
                    to: '/patients?filter=alerts',
                    icon: Bell,
                    label: 'Alertas e Pendências',
                  },
                ],
                defaultExpanded: true,
              },
              {
                id: 'appointments-group',
                icon: Calendar,
                label: 'Agendamentos',
                children: [
                  {
                    id: 'agenda',
                    to: '/agenda',
                    icon: Calendar,
                    label: 'Agenda Semanal',
                  },
                  {
                    id: 'appointments-list',
                    to: '/appointments',
                    icon: ClipboardList,
                    label: 'Lista de Agendamentos',
                    isNew: true,
                  },
                ],
                defaultExpanded: true,
              },
              {
                id: 'care-group',
                icon: Activity,
                label: 'Atendimento',
                children: [
                  {
                    id: 'acompanhamento',
                    to: '/acompanhamento/monitoramento',
                    icon: Activity,
                    label: 'Acompanhamento',
                  },
                  {
                    id: 'session-evolution',
                    to: '/session-evolution',
                    icon: TrendingUp,
                    label: 'Evolução de Sessões',
                  },
                  {
                    id: 'teleconsulta',
                    to: '/teleconsulta',
                    icon: Activity,
                    label: 'Teleconsulta',
                  },
                ],
              },
            ],
            defaultExpanded: true,
          },
          {
            title: 'Tratamento e Exercícios',
            items: [
              {
                id: 'exercises-group',
                icon: Dumbbell,
                label: 'Exercícios',
                children: [
                  {
                    id: 'exercises',
                    to: '/exercises',
                    icon: Dumbbell,
                    label: 'Prescrever Exercícios',
                  },
                  {
                    id: 'exercise-library',
                    to: '/exercise-library',
                    icon: Library,
                    label: 'Biblioteca de Exercícios',
                  },
                  {
                    id: 'video-generator',
                    to: '/free-video-generator',
                    icon: Film,
                    label: 'Gerador Gemini Veo',
                  },
                ],
              },
              {
                id: 'protocols-group',
                icon: FileText,
                label: 'Protocolos Clínicos',
                children: [
                  {
                    id: 'protocols',
                    to: '/protocols',
                    icon: FileText,
                    label: 'Meus Protocolos',
                  },
                  {
                    id: 'specialty-assessments',
                    to: '/specialty-assessments',
                    icon: Search,
                    label: 'Avaliações Especializadas',
                  },
                  {
                    id: 'clinical-library',
                    to: '/clinical-library',
                    icon: Archive,
                    label: 'Biblioteca Clínica',
                  },
                  {
                    id: 'materials',
                    to: '/materials',
                    icon: BookMarked,
                    label: 'Materiais Clínicos',
                  },
                  {
                    id: 'knowledge-base',
                    to: '/knowledge-base',
                    icon: Library,
                    label: 'Base de Conhecimento',
                  },
                ],
              },
            ],
          },
          {
            title: 'Analytics e Relatórios',
            items: [
              {
                id: 'clinical-analytics',
                to: '/clinical-analytics',
                icon: PieChart,
                label: 'Analytics Clínicos',
              },
              {
                id: 'reports-consolidated',
                to: '/reports/consolidated',
                icon: BarChart3,
                label: 'Dashboard de Relatórios',
              },
              {
                id: 'ai-analytics',
                to: '/ai-analytics',
                icon: BrainCircuit,
                label: 'Analytics de IA',
              },
              {
                id: 'financials',
                to: '/financials',
                icon: DollarSign,
                label: 'Gestão Financeira',
              },
            ],
          },
          {
            title: 'Ferramentas IA',
            items: [
              {
                id: 'ai-tools',
                to: '/ai-tools/consolidated',
                icon: BrainCircuit,
                label: 'Ferramentas IA',
              },
              {
                id: 'body-map-demo',
                to: '/body-map-demo',
                icon: Sparkles,
                label: 'Body Map NOVO',
                isNew: true,
              },
              {
                id: 'gerar-laudo',
                to: '/gerar-laudo',
                icon: FileText,
                label: 'Gerar Laudo',
              },
              {
                id: 'gerar-evolucao',
                to: '/gerar-evolucao',
                icon: TrendingUp,
                label: 'Gerar Evolução',
              },
              {
                id: 'hep-generator',
                to: '/hep-generator',
                icon: Dumbbell,
                label: 'Gerar Plano (HEP)',
              },
            ],
          },
          {
            title: 'Gestão',
            items: [
              {
                id: 'user-management',
                to: '/user-management',
                icon: Users2,
                label: 'Gestão de Usuários',
              },
              {
                id: 'supplies',
                to: '/supplies',
                icon: Package,
                label: 'Gestão de Insumos',
              },
              {
                id: 'inventory-dashboard',
                to: '/inventory-dashboard',
                icon: Monitor,
                label: 'Dashboard de Estoque',
              },
              {
                id: 'events',
                to: '/events',
                icon: Ticket,
                label: 'Eventos',
              },
              {
                id: 'partnerships',
                to: '/partnerships',
                icon: Handshake,
                label: 'Parcerias',
              },
              {
                id: 'subscriptions',
                to: '/subscriptions',
                icon: CreditCard,
                label: 'Assinaturas',
              },
            ],
          },
          {
            title: 'Sistema',
            items: [
              {
                id: 'crm',
                to: '/crm',
                icon: Target,
                label: 'CRM & Leads',
              },
              {
                id: 'whatsapp',
                to: '/whatsapp',
                icon: MessageSquare,
                label: 'WhatsApp Business',
              },
              {
                id: 'integrations',
                to: '/integrations',
                icon: ShieldCheck,
                label: 'Integrações',
              },
              {
                id: 'bi-integration',
                to: '/bi-integration-test',
                icon: Globe,
                label: 'Teste BI',
              },
              {
                id: 'audit-log',
                to: '/audit-log',
                icon: FileCheck,
                label: 'Auditoria',
              },
              {
                id: 'design-system',
                to: '/design-system',
                icon: Palette,
                label: 'Design System',
              },
              {
                id: 'settings',
                to: '/settings',
                icon: Settings,
                label: 'Configurações',
              },
            ],
          },
        ],
      };

    case Role.Therapist:
      return {
        sections: [
          {
            title: 'Dashboard',
            items: [
              {
                id: 'dashboard',
                to: '/dashboard',
                icon: LayoutGrid,
                label: 'Dashboard',
              },
              {
                id: 'notifications',
                to: '/notifications',
                icon: Bell,
                label: 'Notificações',
                badge: unreadCount,
              },
              {
                id: 'tasks',
                to: '/tasks',
                icon: ClipboardList,
                label: 'Tarefas',
              },
            ],
          },
          {
            title: 'Gestão de Pacientes',
            items: [
              {
                id: 'patients',
                to: '/patients',
                icon: Users,
                label: 'Pacientes',
              },
              {
                id: 'agenda',
                to: '/agenda',
                icon: Calendar,
                label: 'Agenda',
              },
              {
                id: 'acompanhamento',
                to: '/acompanhamento/monitoramento',
                icon: Activity,
                label: 'Acompanhamento',
              },
              {
                id: 'session-evolution',
                to: '/session-evolution',
                icon: TrendingUp,
                label: 'Evolução de Sessões',
              },
            ],
            defaultExpanded: true,
          },
          {
            title: 'Tratamento',
            items: [
              {
                id: 'exercises',
                to: '/exercises',
                icon: Dumbbell,
                label: 'Exercícios',
              },
              {
                id: 'exercise-library',
                to: '/exercise-library',
                icon: Library,
                label: 'Biblioteca',
              },
              {
                id: 'protocols',
                to: '/protocols',
                icon: FileText,
                label: 'Protocolos',
              },
            ],
          },
          {
            title: 'Analytics',
            items: [
              {
                id: 'clinical-analytics',
                to: '/clinical-analytics',
                icon: PieChart,
                label: 'Analytics',
              },
              {
                id: 'reports',
                to: '/reports',
                icon: BarChart3,
                label: 'Relatórios',
              },
            ],
          },
          {
            title: 'Sistema',
            items: [
              {
                id: 'settings',
                to: '/settings',
                icon: Settings,
                label: 'Configurações',
              },
            ],
          },
        ],
      };

    case Role.Patient:
      return {
        sections: [
          {
            items: [
              {
                id: 'patient-portal',
                to: '/patient-portal',
                icon: LayoutGrid,
                label: 'Meu Portal',
              },
              {
                id: 'my-appointments',
                to: '/my-appointments',
                icon: Calendar,
                label: 'Meus Agendamentos',
              },
              {
                id: 'my-treatments',
                to: '/my-treatments',
                icon: Activity,
                label: 'Meus Tratamentos',
              },
              {
                id: 'my-exercises',
                to: '/my-exercises',
                icon: Dumbbell,
                label: 'Meus Exercícios',
              },
              {
                id: 'my-progress',
                to: '/my-progress',
                icon: TrendingUp,
                label: 'Meu Progresso',
              },
              {
                id: 'notifications',
                to: '/notifications',
                icon: Bell,
                label: 'Notificações',
                badge: unreadCount,
              },
              {
                id: 'settings',
                to: '/settings',
                icon: Settings,
                label: 'Configurações',
              },
            ],
          },
        ],
      };

    default:
      return { sections: [] };
  }
}

