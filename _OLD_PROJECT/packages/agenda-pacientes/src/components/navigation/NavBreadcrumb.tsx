import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbConfig {
  [key: string]: string;
}

const breadcrumbNames: BreadcrumbConfig = {
  dashboard: 'Dashboard',
  'admin-dashboard': 'Dashboard Administrativo',
  patients: 'Pacientes',
  agenda: 'Agenda',
  appointments: 'Agendamentos',
  exercises: 'Exercícios',
  'exercise-library': 'Biblioteca de Exercícios',
  protocols: 'Protocolos',
  acompanhamento: 'Acompanhamento',
  monitoramento: 'Monitoramento',
  'session-evolution': 'Evolução de Sessões',
  financials: 'Financeiro',
  reports: 'Relatórios',
  settings: 'Configurações',
  notifications: 'Notificações',
  tasks: 'Tarefas',
  'clinical-analytics': 'Analytics Clínicos',
  'ai-tools': 'Ferramentas IA',
  'gerar-laudo': 'Gerar Laudo',
  'gerar-evolucao': 'Gerar Evolução',
  'hep-generator': 'Gerar Plano (HEP)',
  teleconsulta: 'Teleconsulta',
};

export function NavBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Início</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = breadcrumbNames[pathname] || pathname;

          return (
            <React.Fragment key={routeTo}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

