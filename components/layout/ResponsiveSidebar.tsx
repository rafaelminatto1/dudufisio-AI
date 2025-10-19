import React, { useMemo, memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Users, Calendar, Activity, FileText, BarChart3,
  DollarSign, BrainCircuit, Settings, X, ChevronLeft, ChevronRight,
  Stethoscope, ClipboardList, Package, MessageSquare, Target,
  Library, Film, TrendingUp, Bell
} from 'lucide-react';
import { Role } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';

interface ResponsiveSidebarProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface MenuItem {
  id: string;
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  user,
  onLogout,
  isOpen,
  onClose,
  isMobile,
  isTablet,
  isDesktop,
}) => {
  const location = useLocation();
  const { unreadCount } = useNotifications(user?.id || '');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Definir itens de menu baseado no papel do usuário
  const menuSections = useMemo((): MenuSection[] => {
    if (!user) return [];

    const sections: MenuSection[] = [];

    // Seção Principal - Disponível para todos
    sections.push({
      title: 'Principal',
      items: [
        { id: 'dashboard', path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'notifications', path: '/notifications', icon: Bell, label: 'Notificações', badge: unreadCount },
      ],
    });

    // Seção Clínica - Para Terapeutas e Admin
    if (user.role === Role.Admin || user.role === Role.Therapist) {
      sections.push({
        title: 'Clínico',
        items: [
          { id: 'patients', path: '/patients', icon: Users, label: 'Pacientes' },
          { id: 'agenda', path: '/agenda', icon: Calendar, label: 'Agenda' },
          { id: 'acompanhamento', path: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
          { id: 'exercises', path: '/exercises', icon: Activity, label: 'Exercícios' },
          { id: 'protocols', path: '/protocols', icon: FileText, label: 'Protocolos' },
        ],
      });
    }

    // Seção Analytics - Para Admin e Terapeutas
    if (user.role === Role.Admin || user.role === Role.Therapist) {
      sections.push({
        title: 'Analytics',
        items: [
          { id: 'reports', path: '/reports', icon: BarChart3, label: 'Relatórios' },
          { id: 'financials', path: '/financials', icon: DollarSign, label: 'Financeiro' },
          { id: 'analytics', path: '/clinical-analytics', icon: TrendingUp, label: 'Analytics' },
        ],
      });
    }

    // Seção IA - Para Admin e Terapeutas
    if (user.role === Role.Admin || user.role === Role.Therapist) {
      sections.push({
        title: 'Ferramentas IA',
        items: [
          { id: 'ai-tools', path: '/ai-tools/consolidated', icon: BrainCircuit, label: 'Ferramentas IA' },
          { id: 'video-generator', path: '/free-video-generator', icon: Film, label: 'Gerador Vídeo' },
          { id: 'knowledge-base', path: '/knowledge-base', icon: Library, label: 'Base Conhecimento' },
        ],
      });
    }

    // Seção Gestão - Apenas Admin
    if (user.role === Role.Admin) {
      sections.push({
        title: 'Gestão',
        items: [
          { id: 'crm', path: '/crm', icon: Target, label: 'CRM & Leads' },
          { id: 'whatsapp', path: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
          { id: 'inventory', path: '/inventory', icon: Package, label: 'Estoque' },
          { id: 'tasks', path: '/tasks', icon: ClipboardList, label: 'Tarefas' },
        ],
      });
    }

    // Configurações - Para todos
    sections.push({
      title: 'Sistema',
      items: [
        { id: 'settings', path: '/settings', icon: Settings, label: 'Configurações' },
      ],
    });

    return sections;
  }, [user, unreadCount]);

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Classes CSS baseadas no estado
  const sidebarClasses = `
    ${isMobile 
      ? `fixed left-0 top-0 bottom-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
         ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      : isTablet
        ? `${isCollapsed ? 'w-16' : 'w-56'} transition-all duration-300`
        : `${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`
    }
    bg-white border-r border-fisio-neutral-200 flex flex-col shadow-lg
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Header da Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-fisio-neutral-200 h-16">
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center w-full' : ''}`}>
          <Stethoscope className="w-7 h-7 text-fisio-primary-DEFAULT shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 text-xl font-bold">
              <span className="text-fisio-neutral-800">Fisio</span>
              <span className="text-fisio-primary-DEFAULT">Flow</span>
            </span>
          )}
        </div>
        
        {isMobile ? (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-fisio-neutral-500" />
          </button>
        ) : isDesktop && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-fisio-neutral-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-fisio-neutral-500" />
            )}
          </button>
        )}
      </div>

      {/* Conteúdo da Sidebar */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-fisio-neutral-500">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => isMobile && onClose()}
                  className={({ isActive }) => {
                    const active = isActive || isPathActive(item.path);
                    return `
                      flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-fisio-primary-50 text-fisio-primary-700 font-medium'
                        : 'text-fisio-neutral-600 hover:bg-fisio-neutral-100 hover:text-fisio-neutral-900'
                      }
                      ${isCollapsed && !isMobile ? 'justify-center' : ''}
                    `;
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-fisio-error-DEFAULT text-xs font-medium text-white">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && !isMobile && item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fisio-error-DEFAULT" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer da Sidebar com informações do usuário */}
      {user && !isCollapsed && (
        <div className="border-t border-fisio-neutral-200 p-4">
          <div className="flex items-center">
            <img
              src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-fisio-neutral-200"
            />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-fisio-neutral-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-fisio-neutral-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default memo(ResponsiveSidebar);