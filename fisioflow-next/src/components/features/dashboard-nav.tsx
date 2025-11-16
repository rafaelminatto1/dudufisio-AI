'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  DollarSign,
  User,
  ClipboardList,
  Activity,
  FileText,
  Settings,
  Bell,
  MessageSquare,
  Video,
  BookOpen,
  Briefcase,
  TrendingUp,
  Package,
  UserCog,
  Shield,
  Database,
  Zap,
  BarChart3,
  CheckSquare,
  Heart,
  Brain,
  Sparkles,
  Users2,
  FolderKanban,
  Store,
  Trophy,
  Mail,
  FileBarChart,
  GitBranch,
  Puzzle,
  Lock,
  Bookmark
} from 'lucide-react'

export function DashboardNav() {
  const pathname = usePathname()

  const navSections = [
    {
      title: 'Principal',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/admin', label: 'Admin Dashboard', icon: Shield },
        { href: '/dashboard/therapist', label: 'Fisioterapeuta', icon: Stethoscope },
        { href: '/dashboard/notifications', label: 'Notificações', icon: Bell },
        { href: '/dashboard/tasks', label: 'Tarefas (Kanban)', icon: CheckSquare },
      ]
    },
    {
      title: 'Clínico - Básico',
      items: [
        { href: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
        { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
        { href: '/dashboard/appointments', label: 'Agendamentos', icon: ClipboardList },
        { href: '/dashboard/checkin', label: 'Check-in', icon: CheckSquare },
        { href: '/dashboard/acompanhamento', label: 'Acompanhamento', icon: Activity },
        { href: '/dashboard/exercicios/biblioteca', label: 'Biblioteca de Exercícios', icon: BookOpen },
        { href: '/dashboard/protocols', label: 'Protocolos', icon: FileText },
        { href: '/dashboard/medical-records', label: 'Prontuários', icon: FileBarChart },
      ]
    },
    {
      title: 'Clínico - Avançado',
      items: [
        { href: '/dashboard/teleconsulta', label: 'Teleconsulta', icon: Video },
        { href: '/dashboard/session-evolution', label: 'Evolução de Sessão', icon: TrendingUp },
        { href: '/dashboard/materials', label: 'Materiais Didáticos', icon: BookOpen },
        { href: '/dashboard/knowledge-base', label: 'Base de Conhecimento', icon: Database },
        { href: '/dashboard/mentoria', label: 'Mentoria', icon: Users2 },
        { href: '/dashboard/specialty-assessments', label: 'Avaliações Especializadas', icon: ClipboardList },
        { href: '/dashboard/clinical-library', label: 'Biblioteca Clínica', icon: Bookmark },
      ]
    },
    {
      title: 'Ferramentas IA',
      items: [
        { href: '/dashboard/ai/laudo', label: 'Gerar Laudo IA', icon: FileText },
        { href: '/dashboard/ai/evolucao', label: 'Gerar Evolução IA', icon: Sparkles },
        { href: '/dashboard/ai/hep', label: 'Gerador de HEP', icon: Brain },
        { href: '/dashboard/ai/risk-analysis', label: 'Análise de Risco', icon: Shield },
        { href: '/dashboard/ai/video-generator', label: 'Gerador de Vídeo', icon: Video },
        { href: '/dashboard/exercicios/analise', label: 'Análise de Movimento (CV)', icon: Activity },
        { href: '/dashboard/ai/body-map', label: 'Mapa Corporal IA', icon: User },
        { href: '/dashboard/ai/analytics', label: 'Analytics IA', icon: BarChart3 },
        { href: '/dashboard/ai/consolidated', label: 'IA Consolidada', icon: Zap },
        { href: '/dashboard/ai/settings', label: 'Configurações IA', icon: Settings },
      ]
    },
    {
      title: 'Relatórios & Analytics',
      items: [
        { href: '/dashboard/reports', label: 'Relatórios', icon: FileText },
        { href: '/dashboard/reports/medical', label: 'Relatórios Médicos', icon: FileBarChart },
        { href: '/dashboard/reports/evaluation', label: 'Relatórios de Avaliação', icon: ClipboardList },
        { href: '/dashboard/reports/advanced', label: 'Relatórios Avançados', icon: BarChart3 },
        { href: '/dashboard/reports/consolidated', label: 'Relatórios Consolidados', icon: FileBarChart },
        { href: '/dashboard/analytics', label: 'Analytics Clínico', icon: TrendingUp },
        { href: '/dashboard/analytics/agenda', label: 'Analytics Agenda', icon: Calendar },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { href: '/dashboard/financeiro', label: 'Dashboard Financeiro', icon: DollarSign },
        { href: '/dashboard/financeiro/transactions', label: 'Transações', icon: DollarSign },
        { href: '/dashboard/subscriptions', label: 'Assinaturas', icon: Package },
      ]
    },
    {
      title: 'Gestão & Admin',
      items: [
        { href: '/dashboard/users', label: 'Gestão de Usuários', icon: UserCog },
        { href: '/dashboard/groups', label: 'Grupos', icon: Users2 },
        { href: '/dashboard/inventory', label: 'Inventário', icon: Package },
        { href: '/dashboard/inventory/dashboard', label: 'Dashboard Inventário', icon: BarChart3 },
        { href: '/dashboard/supplies', label: 'Suprimentos', icon: Package },
        { href: '/dashboard/events', label: 'Eventos', icon: Calendar },
        { href: '/dashboard/partnerships', label: 'Parcerias', icon: Briefcase },
      ]
    },
    {
      title: 'Comunicação & CRM',
      items: [
        { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { href: '/dashboard/crm', label: 'CRM', icon: Users },
        { href: '/dashboard/inactive-patients-email', label: 'Email Pacientes Inativos', icon: Mail },
      ]
    },
    {
      title: 'Gamificação',
      items: [
        { href: '/dashboard/gamificacao', label: 'Dashboard Gamificação', icon: Trophy },
        { href: '/dashboard/vouchers', label: 'Vouchers', icon: Store },
        { href: '/dashboard/voucher-store', label: 'Loja de Vouchers', icon: Store },
      ]
    },
    {
      title: 'Sistema & Configurações',
      items: [
        { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
        { href: '/dashboard/settings/agenda', label: 'Config. Agenda', icon: Calendar },
        { href: '/dashboard/backup', label: 'Backup', icon: Database },
        { href: '/dashboard/integrations', label: 'Integrações', icon: Puzzle },
        { href: '/dashboard/integrations/bi', label: 'Integração BI', icon: BarChart3 },
        { href: '/dashboard/audit-log', label: 'Log de Auditoria', icon: FileText },
        { href: '/dashboard/legal', label: 'Legal & Compliance', icon: Lock },
      ]
    },
  ]

  return (
    <aside className="w-64 border-r bg-background p-4 hidden md:block h-screen overflow-y-auto">
      <nav className="flex flex-col space-y-6">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="flex flex-col space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'justify-start',
                      isActive && 'bg-muted'
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
