import fs from 'fs'
import path from 'path'

const pages = [
  // Principal
  { path: 'admin', title: 'Admin Dashboard', icon: 'Shield', desc: 'Painel administrativo completo' },
  { path: 'therapist', title: 'Dashboard Fisioterapeuta', icon: 'Stethoscope', desc: 'Dashboard especializado para fisioterapeutas' },
  { path: 'notifications', title: 'Notificações', icon: 'Bell', desc: 'Central de notificações do sistema' },
  { path: 'tasks', title: 'Tarefas (Kanban)', icon: 'CheckSquare', desc: 'Gestão de tarefas em formato Kanban' },
  
  // Clínico Básico
  { path: 'appointments', title: 'Agendamentos', icon: 'ClipboardList', desc: 'Lista de agendamentos' },
  { path: 'checkin', title: 'Check-in', icon: 'CheckSquare', desc: 'Sistema de check-in de pacientes' },
  { path: 'acompanhamento', title: 'Acompanhamento', icon: 'Activity', desc: 'Acompanhamento de pacientes' },
  { path: 'protocols', title: 'Protocolos', icon: 'FileText', desc: 'Protocolos de tratamento' },
  { path: 'medical-records', title: 'Prontuários', icon: 'FileBarChart', desc: 'Prontuários eletrônicos' },
  { path: 'exercicios/biblioteca', title: 'Biblioteca de Exercícios', icon: 'BookOpen', desc: 'Catálogo completo de exercícios' },
  
  // Clínico Avançado
  { path: 'teleconsulta', title: 'Teleconsulta', icon: 'Video', desc: 'Sistema de teleconsulta' },
  { path: 'session-evolution', title: 'Evolução de Sessão', icon: 'TrendingUp', desc: 'Evolução das sessões de tratamento' },
  { path: 'materials', title: 'Materiais Didáticos', icon: 'BookOpen', desc: 'Materiais educativos para pacientes' },
  { path: 'knowledge-base', title: 'Base de Conhecimento', icon: 'Database', desc: 'Base de conhecimento clínico' },
  { path: 'mentoria', title: 'Mentoria', icon: 'Users2', desc: 'Sistema de mentoria profissional' },
  { path: 'specialty-assessments', title: 'Avaliações Especializadas', icon: 'ClipboardList', desc: 'Avaliações clínicas especializadas' },
  { path: 'clinical-library', title: 'Biblioteca Clínica', icon: 'Bookmark', desc: 'Biblioteca de referências clínicas' },
  
  // Ferramentas IA
  { path: 'ai/laudo', title: 'Gerar Laudo IA', icon: 'FileText', desc: 'Geração automática de laudos com IA' },
  { path: 'ai/evolucao', title: 'Gerar Evolução IA', icon: 'Sparkles', desc: 'Geração de evolução de sessão com IA' },
  { path: 'ai/hep', title: 'Gerador de HEP', icon: 'Brain', desc: 'Programa de exercícios domiciliares com IA' },
  { path: 'ai/risk-analysis', title: 'Análise de Risco', icon: 'Shield', desc: 'Análise de risco clínico com IA' },
  { path: 'ai/video-generator', title: 'Gerador de Vídeo', icon: 'Video', desc: 'Geração de vídeos educativos com IA' },
  { path: 'ai/body-map', title: 'Mapa Corporal IA', icon: 'User', desc: 'Mapeamento corporal inteligente' },
  { path: 'ai/analytics', title: 'Analytics IA', icon: 'BarChart3', desc: 'Analytics avançado com IA' },
  { path: 'ai/consolidated', title: 'IA Consolidada', icon: 'Zap', desc: 'Central de ferramentas de IA' },
  { path: 'ai/settings', title: 'Configurações IA', icon: 'Settings', desc: 'Configurações de IA' },
  
  // Relatórios
  { path: 'reports', title: 'Relatórios', icon: 'FileText', desc: 'Central de relatórios' },
  { path: 'reports/medical', title: 'Relatórios Médicos', icon: 'FileBarChart', desc: 'Relatórios médicos especializados' },
  { path: 'reports/evaluation', title: 'Relatórios de Avaliação', icon: 'ClipboardList', desc: 'Relatórios de avaliação clínica' },
  { path: 'reports/advanced', title: 'Relatórios Avançados', icon: 'BarChart3', desc: 'Relatórios com analytics avançado' },
  { path: 'reports/consolidated', title: 'Relatórios Consolidados', icon: 'FileBarChart', desc: 'Visão consolidada de relatórios' },
  { path: 'analytics', title: 'Analytics Clínico', icon: 'TrendingUp', desc: 'Analytics e métricas clínicas' },
  { path: 'analytics/agenda', title: 'Analytics Agenda', icon: 'Calendar', desc: 'Analytics de agendamentos' },
  
  // Financeiro
  { path: 'financeiro/transactions', title: 'Transações', icon: 'DollarSign', desc: 'Gestão de transações financeiras' },
  { path: 'subscriptions', title: 'Assinaturas', icon: 'Package', desc: 'Gestão de assinaturas e planos' },
  
  // Gestão
  { path: 'users', title: 'Gestão de Usuários', icon: 'UserCog', desc: 'Administração de usuários do sistema' },
  { path: 'groups', title: 'Grupos', icon: 'Users2', desc: 'Gestão de grupos de usuários' },
  { path: 'inventory', title: 'Inventário', icon: 'Package', desc: 'Controle de estoque' },
  { path: 'inventory/dashboard', title: 'Dashboard Inventário', icon: 'BarChart3', desc: 'Visão geral do inventário' },
  { path: 'supplies', title: 'Suprimentos', icon: 'Package', desc: 'Gestão de suprimentos' },
  { path: 'events', title: 'Eventos', icon: 'Calendar', desc: 'Calendário de eventos' },
  { path: 'partnerships', title: 'Parcerias', icon: 'Briefcase', desc: 'Gestão de parcerias' },
  
  // Comunicação
  { path: 'whatsapp', title: 'WhatsApp', icon: 'MessageSquare', desc: 'Integração WhatsApp' },
  { path: 'crm', title: 'CRM', icon: 'Users', desc: 'Customer Relationship Management' },
  { path: 'inactive-patients-email', title: 'Email Pacientes Inativos', icon: 'Mail', desc: 'Campanhas para pacientes inativos' },
  
  // Gamificação
  { path: 'vouchers', title: 'Vouchers', icon: 'Store', desc: 'Sistema de vouchers' },
  { path: 'voucher-store', title: 'Loja de Vouchers', icon: 'Store', desc: 'Loja de troca de vouchers' },
  
  // Sistema
  { path: 'settings', title: 'Configurações', icon: 'Settings', desc: 'Configurações do sistema' },
  { path: 'settings/agenda', title: 'Configurações Agenda', icon: 'Calendar', desc: 'Configurações de agendamento' },
  { path: 'backup', title: 'Backup', icon: 'Database', desc: 'Gestão de backups' },
  { path: 'integrations', title: 'Integrações', icon: 'Puzzle', desc: 'Integrações com sistemas externos' },
  { path: 'integrations/bi', title: 'Integração BI', icon: 'BarChart3', desc: 'Integração com ferramentas de BI' },
  { path: 'audit-log', title: 'Log de Auditoria', icon: 'FileText', desc: 'Registro de auditoria do sistema' },
  { path: 'legal', title: 'Legal & Compliance', icon: 'Lock', desc: 'Documentos legais e compliance' },
]

const baseDir = path.join(process.cwd(), 'src/app/(dashboard)/dashboard')

pages.forEach(page => {
  const pagePath = path.join(baseDir, page.path)
  const pageFile = path.join(pagePath, 'page.tsx')
  
  // Verificar se já existe
  if (fs.existsSync(pageFile)) {
    console.log(`⏭️  Página já existe: ${page.path}`)
    return
  }
  
  const content = `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ${page.icon} } from 'lucide-react'

export default function ${page.path.replace(/\//g, '_').replace(/-/g, '_')}Page() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <${page.icon} className="h-8 w-8" />
          ${page.title}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>${page.title}</CardTitle>
          <CardDescription>
            ${page.desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <${page.icon} className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Esta página está em desenvolvimento e em breve estará disponível com todas as funcionalidades.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`
  
  fs.writeFileSync(pageFile, content, 'utf-8')
  console.log(`✅ Criado: ${page.path}/page.tsx`)
})

console.log(`\n🎉 Total de ${pages.length} páginas criadas/verificadas!`)

