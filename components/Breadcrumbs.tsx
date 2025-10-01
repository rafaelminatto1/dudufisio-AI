import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  // Mapeamento de rotas para labels amigáveis
  const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/admin-dashboard': 'Dashboard Administrativo',
    '/therapist-dashboard': 'Dashboard Terapeuta',
    '/partner-dashboard': 'Dashboard Parceiro',
    '/patients': 'Pacientes',
    '/agenda': 'Agenda',
    '/acompanhamento': 'Acompanhamento',
    '/session-evolution': 'Evolução de Sessões',
    '/teleconsulta': 'Teleconsulta',
    '/exercises': 'Exercícios',
    '/exercise-library': 'Biblioteca de Exercícios',
    '/protocolos': 'Protocolos Clínicos',
    '/specialty-assessments': 'Avaliações Especializadas',
    '/clinical-library': 'Biblioteca Clínica',
    '/materials': 'Materiais Clínicos',
    '/clinical-analytics': 'Analytics Clínicos',
    '/ai-analytics': 'Analytics de IA',
    '/financials': 'Gestão Financeira',
    '/financial-dashboard': 'Dashboard Financeiro',
    '/reports': 'Relatórios',
    '/advanced-reports': 'Relatórios Avançados',
    '/medical-reports': 'Relatórios Médicos',
    '/evaluation-reports': 'Relatórios de Avaliação',
    '/gerar-laudo': 'Gerar Laudo',
    '/gerar-evolucao': 'Gerar Evolução',
    '/gerar-hep': 'Gerar Plano (HEP)',
    '/hep-generator': 'Gerador HEP',
    '/analise-risco': 'Análise de Risco',
    '/risk-analysis': 'Análise de Risco (Detalhada)',
    '/users': 'Usuários/Terapeutas',
    '/user-management': 'Gestão de Usuários',
    '/groups': 'Grupos',
    '/inventory': 'Estoque/Insumos',
    '/inventory-dashboard': 'Dashboard de Estoque',
    '/events': 'Eventos',
    '/events-list': 'Lista de Eventos',
    '/partnerships': 'Parcerias',
    '/subscriptions': 'Assinaturas',
    '/whatsapp': 'WhatsApp Business',
    '/email-inativos': 'Email para Inativos',
    '/mentoria': 'Sistema de Mentoria',
    '/knowledge-base': 'Base de Conhecimento',
    '/backup-management': 'Gerenciamento de Backup',
    '/agenda-settings': 'Configurações da Agenda',
    '/integrations': 'Integrações',
    '/integrations-test': 'Teste de Integrações',
    '/bi-integration-test': 'Teste BI',
    '/audit-log': 'Auditoria & Compliance',
    '/audit-log-page': 'Log de Auditoria',
    '/legal': 'Legal',
    '/settings': 'Configurações',
    '/notifications': 'Notificações',
    '/tasks': 'Quadro de Tarefas',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [];

    // Sempre incluir Home
    breadcrumbs.push({ label: 'Início', href: '/dashboard' });

    // Construir breadcrumbs baseado nos segmentos da URL
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const label = routeLabels[currentPath] || pathSegments[i];
      
      // Se for o último item, não adicionar href
      const isLast = i === pathSegments.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Não mostrar breadcrumbs na página inicial
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-slate-500 mb-4">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-slate-700 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-slate-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;