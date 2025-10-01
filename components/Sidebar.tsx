
'use client';
import React, { useState, useMemo, useCallback, memo } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutGrid, Users, Calendar, Stethoscope, ChevronLeft, ChevronRight, BarChart3,
    ShieldCheck, Cog, Library, AreaChart, LogOut, FilePlus, FileClock, Dumbbell,
    AlertTriangle, Mail, BrainCircuit, ClipboardList, PieChart, DollarSign,
    SlidersHorizontal, Bell, MessageSquare, Handshake, Package, Ticket, Activity,
    Users2, BookMarked, FileText, TrendingUp, Database, Settings, Monitor, 
    HardDrive, Wrench, CreditCard, Eye, FileCheck, Search, Target, 
    FileSpreadsheet, Zap, Globe, UserCheck, Archive, FileSearch
} from 'lucide-react';
import { useAuth } from "../contexts/AppContext";
import { useNotifications } from '../hooks/useNotifications';
import { Role } from '../types';
import SidebarSearch from './SidebarSearch';
import NotificationBell from './NotificationBell';

const NavLinkComponent = memo(({ to, icon: Icon, label, isCollapsed, badgeCount }: { to: string, icon: React.ElementType, label: string, isCollapsed: boolean, badgeCount?: number }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-1.5 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-sky-50 text-sky-600 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
      title={isCollapsed ? label : undefined}
    >
        <div className="relative flex items-center w-full min-w-0">
            <Icon className={`w-4 h-4 shrink-0 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && (
              <span className="text-sm leading-tight break-words hyphens-auto flex-1 min-w-0">
                {label}
              </span>
            )}
            
            {!isCollapsed && badgeCount && badgeCount > 0 ? (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white shrink-0">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            ) : null}

             {isCollapsed && badgeCount && badgeCount > 0 ? (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            ) : null}
        </div>
    </NavLink>
));

const NavGroup = memo<{ title: string; isCollapsed: boolean; children: React.ReactNode }>(({ title, isCollapsed, children }) => (
    <div>
        {!isCollapsed && (
            <h3 className="px-2 pt-3 pb-1 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                {title}
            </h3>
        )}
        <div className="space-y-0.5">
            {children}
        </div>
    </div>
));

// 🔐 Enhanced Professional Role-Based Navigation System
// MOVIDO PARA FORA DO COMPONENTE para evitar erro de hoisting
const getFilteredNavigation = (userRole: Role, unreadCount: number) => {
    const baseNavigation = {
      mainNav: [] as any[],
      clinicalNav: [] as any[],
      aiToolsNav: [] as any[],
      managementNav: [] as any[],
      analyticsNav: [] as any[],
      systemNav: [] as any[]
    };

    switch (userRole) {
      case Role.Admin:
        // Admin has comprehensive access to all modules
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard Geral' },
            { to: '/admin-dashboard', icon: BarChart3, label: 'Dashboard Administrativo' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
            { to: '/tasks', icon: ClipboardList, label: 'Quadro de Tarefas' },
          ],
          clinicalNav: [
            { to: '/patients', icon: Users, label: 'Pacientes' },
            { to: '/agenda', icon: Calendar, label: 'Agenda' },
            { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
            { to: '/session-evolution', icon: TrendingUp, label: 'Evolução de Sessões' },
            { to: '/teleconsulta', icon: Activity, label: 'Teleconsulta' },
            { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
            { to: '/exercise-library', icon: Library, label: 'Biblioteca de Exercícios' },
            { to: '/protocolos', icon: FileText, label: 'Protocolos Clínicos' },
            { to: '/specialty-assessments', icon: Search, label: 'Avaliações Especializadas' },
            { to: '/clinical-library', icon: Archive, label: 'Biblioteca Clínica' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
            { to: '/mentoria', icon: BrainCircuit, label: 'Sistema de Mentoria' },
            { to: '/knowledge-base', icon: Library, label: 'Base de Conhecimento' },
          ],
          analyticsNav: [
            { to: '/reports/consolidated', icon: BarChart3, label: 'Dashboard de Relatórios', roles: [Role.Admin, Role.Therapist] },
            { to: '/clinical-analytics', icon: PieChart, label: 'Analytics Clínicos' },
            { to: '/ai-analytics', icon: BrainCircuit, label: 'Analytics de IA' },
            { to: '/financials', icon: DollarSign, label: 'Gestão Financeira' },
          ],
          aiToolsNav: [
            { to: '/ai-tools/consolidated', icon: BrainCircuit, label: 'Ferramentas IA', roles: [Role.Admin, Role.Therapist] },
            { to: '/gerar-laudo', icon: FilePlus, label: 'Gerar Laudo' },
            { to: '/gerar-evolucao', icon: FileClock, label: 'Gerar Evolução' },
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
            { to: '/analise-risco', icon: AlertTriangle, label: 'Análise de Risco' },
            { to: '/ia-economica', icon: AreaChart, label: 'IA Econômica' },
          ],
          managementNav: [
            { to: '/users', icon: Users2, label: 'Usuários/Terapeutas' },
            { to: '/user-management', icon: UserCheck, label: 'Gestão de Usuários' },
            { to: '/groups', icon: Users2, label: 'Grupos' },
            { to: '/inventory', icon: Package, label: 'Estoque/Insumos' },
            { to: '/inventory-dashboard', icon: Monitor, label: 'Dashboard de Estoque' },
            { to: '/events', icon: Ticket, label: 'Eventos' },
            { to: '/events-list', icon: Calendar, label: 'Lista de Eventos' },
            { to: '/partnerships', icon: Handshake, label: 'Parcerias' },
            { to: '/partnership-page', icon: Handshake, label: 'Página de Parcerias' },
            { to: '/subscriptions', icon: CreditCard, label: 'Assinaturas' },
          ],
          systemNav: [
            { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp Business' },
            { to: '/email-inativos', icon: Mail, label: 'Email para Inativos' },
            { to: '/backup-management', icon: HardDrive, label: 'Gerenciamento de Backup' },
            { to: '/agenda-settings', icon: SlidersHorizontal, label: 'Config. Agenda' },
            { to: '/integrations', icon: ShieldCheck, label: 'Integrações' },
            { to: '/integrations-test', icon: Zap, label: 'Teste de Integrações' },
            { to: '/bi-integration-test', icon: Globe, label: 'Teste BI' },
            { to: '/ai-settings', icon: SlidersHorizontal, label: 'Config. IA' },
            { to: '/audit-log', icon: ShieldCheck, label: 'Auditoria & Compliance' },
            { to: '/audit-log-page', icon: FileCheck, label: 'Log de Auditoria' },
            { to: '/legal', icon: FileText, label: 'Legal' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.Therapist:
        // Therapists focused on patient care and clinical tools
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/therapist-dashboard', icon: Stethoscope, label: 'Dashboard Terapeuta' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
            { to: '/tasks', icon: ClipboardList, label: 'Tarefas' },
          ],
          clinicalNav: [
            { to: '/patients', icon: Users, label: 'Pacientes' },
            { to: '/agenda', icon: Calendar, label: 'Agenda' },
            { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
            { to: '/session-evolution', icon: TrendingUp, label: 'Evolução de Sessões' },
            { to: '/teleconsulta', icon: Activity, label: 'Teleconsulta' },
            { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
            { to: '/exercise-library', icon: Library, label: 'Biblioteca de Exercícios' },
            { to: '/protocolos', icon: FileText, label: 'Protocolos' },
            { to: '/specialty-assessments', icon: Search, label: 'Avaliações Especializadas' },
            { to: '/clinical-library', icon: Archive, label: 'Biblioteca Clínica' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
            { to: '/knowledge-base', icon: Library, label: 'Base de Conhecimento' },
          ],
          analyticsNav: [
            { to: '/clinical-analytics', icon: PieChart, label: 'Analytics Clínicos' },
            { to: '/my-performance', icon: BarChart3, label: 'Minha Performance' },
            { to: '/reports', icon: FileText, label: 'Relatórios' },
            { to: '/medical-reports', icon: FileSpreadsheet, label: 'Relatórios Médicos' },
            { to: '/evaluation-reports', icon: FileCheck, label: 'Relatórios de Avaliação' },
          ],
          aiToolsNav: [
            { to: '/gerar-laudo', icon: FilePlus, label: 'Gerar Laudo' },
            { to: '/gerar-evolucao', icon: FileClock, label: 'Gerar Evolução' },
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
            { to: '/hep-generator', icon: Target, label: 'Gerador HEP' },
            { to: '/analise-risco', icon: AlertTriangle, label: 'Análise de Risco' },
            { to: '/risk-analysis', icon: Eye, label: 'Análise de Risco (Detalhada)' },
          ],
          managementNav: [],
          systemNav: [
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.Patient:
        // Patient portal with limited access
        return {
          mainNav: [
            { to: '/patient-portal', icon: LayoutGrid, label: 'Meu Portal' },
            { to: '/my-appointments', icon: Calendar, label: 'Meus Agendamentos' },
            { to: '/my-treatments', icon: Activity, label: 'Meus Tratamentos' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
          ],
          clinicalNav: [],
          analyticsNav: [
            { to: '/my-progress', icon: TrendingUp, label: 'Meu Progresso' },
          ],
          aiToolsNav: [],
          managementNav: [
            { to: '/my-exercises', icon: Dumbbell, label: 'Meus Exercícios' },
            { to: '/teleconsulta', icon: Activity, label: 'Teleconsulta' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ],
          systemNav: []
        };

      case Role.EducadorFisico:
        // Physical Educator focused on exercises and educational content
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/partner-dashboard', icon: Stethoscope, label: 'Dashboard Parceiro' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
          ],
          clinicalNav: [
            { to: '/exercises', icon: Dumbbell, label: 'Biblioteca de Exercícios' },
            { to: '/exercise-library', icon: Library, label: 'Biblioteca Completa' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Educativos' },
            { to: '/clinical-library', icon: Archive, label: 'Biblioteca Clínica' },
            { to: '/knowledge-base', icon: Library, label: 'Base de Conhecimento' },
          ],
          analyticsNav: [
            { to: '/exercise-analytics', icon: BarChart3, label: 'Analytics de Exercícios' },
            { to: '/reports', icon: FileText, label: 'Relatórios' },
          ],
          aiToolsNav: [
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
            { to: '/hep-generator', icon: Target, label: 'Gerador HEP' },
          ],
          managementNav: [
            { to: '/partnerships', icon: Handshake, label: 'Parcerias' },
            { to: '/partnership-page', icon: Handshake, label: 'Página de Parcerias' },
            { to: '/events', icon: Ticket, label: 'Eventos/Workshops' },
            { to: '/events-list', icon: Calendar, label: 'Lista de Eventos' },
          ],
          systemNav: [
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      // Caso Manager removido - não existe mais no enum Role

      default:
        return baseNavigation;
    }
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.id || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get filtered navigation based on user role - memoizado
  const navigation = useMemo(() => 
    user ? getFilteredNavigation(user.role, unreadCount) : {
      mainNav: [],
      clinicalNav: [],
      aiToolsNav: [],
      managementNav: [],
      analyticsNav: [],
      systemNav: []
    }, [user?.role, unreadCount]
  );

  const getItemGroup = useCallback((to: string) => {
    if (navigation.mainNav.some((item: any) => item.to === to)) return 'Principal';
    if (navigation.clinicalNav?.some((item: any) => item.to === to)) return 'Clínico';
    if (navigation.analyticsNav?.some((item: any) => item.to === to)) return 'Analytics & BI';
    if (navigation.aiToolsNav.some((item: any) => item.to === to)) return 'Ferramentas IA';
    if (navigation.managementNav.some((item: any) => item.to === to)) return 'Gestão';
    if (navigation.systemNav?.some((item: any) => item.to === to)) return 'Sistema';
    return 'Outros';
  }, [navigation]);

  // Função para buscar itens da navegação - memoizada
  const searchNavigationItems = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    const allItems = [
      ...navigation.mainNav,
      ...(navigation.clinicalNav || []),
      ...(navigation.analyticsNav || []),
      ...(navigation.aiToolsNav || []),
      ...(navigation.managementNav || []),
      ...(navigation.systemNav || [])
    ];

    return allItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    ).map(item => ({
      ...item,
      group: getItemGroup(item.to)
    }));
  }, [navigation, getItemGroup]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleResultClick = useCallback((to: string) => {
    navigate(to);
  }, [navigate]);

  return (
    <div 
      className={`transition-all duration-300 ease-in-out bg-white border-r border-slate-200 flex flex-col ${isCollapsed ? 'w-14' : 'w-56'}`}
      data-testid="sidebar"
    >
      <div className="flex items-center p-3 border-b border-slate-200 h-14 shrink-0">
        {!isCollapsed && <Stethoscope className="w-6 h-6 text-sky-500" />}
        {!isCollapsed && <span className="text-sm font-bold text-slate-800 ml-2">Fisio<span className="text-sky-500">Flow</span></span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 rounded-full text-slate-500 hover:bg-slate-100 ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}>
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Search Component */}
      <SidebarSearch
        isCollapsed={isCollapsed}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        searchResults={searchNavigationItems(searchQuery)}
        onResultClick={handleResultClick}
      />
      
      <nav className="flex-1 px-2 py-3 space-y-2 overflow-y-auto">
        {navigation.mainNav.length > 0 && (
          <NavGroup title="Principal" isCollapsed={isCollapsed}>
            {navigation.mainNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
          </NavGroup>
        )}
        {navigation.clinicalNav && navigation.clinicalNav.length > 0 && (
          <NavGroup title="Clínico" isCollapsed={isCollapsed}>
            {navigation.clinicalNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
          </NavGroup>
        )}
        {navigation.analyticsNav && navigation.analyticsNav.length > 0 && (
          <NavGroup title="Analytics & BI" isCollapsed={isCollapsed}>
            {navigation.analyticsNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
          </NavGroup>
        )}
        {navigation.aiToolsNav.length > 0 && (
          <NavGroup title="Ferramentas IA" isCollapsed={isCollapsed}>
            {navigation.aiToolsNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
          </NavGroup>
        )}
        {navigation.managementNav.length > 0 && (
          <NavGroup title="Gestão" isCollapsed={isCollapsed}>
            {navigation.managementNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
          </NavGroup>
        )}
        {navigation.systemNav && navigation.systemNav.length > 0 && (
          <NavGroup title="Sistema" isCollapsed={isCollapsed}>
            {navigation.systemNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
          </NavGroup>
        )}
      </nav>

      {user && (
         <div className="p-3 border-t border-slate-200 shrink-0">
            <div className="p-2 rounded-lg bg-gradient-to-r from-slate-50 to-sky-50 border border-slate-200">
                {/* User Profile Section */}
                <Link to="/settings" title="Ver perfil e configurações" className="flex items-center w-full mb-2">
                    <div className="relative">
                        <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full shrink-0 border-2 border-white shadow-sm" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          user.role === Role.Admin ? 'bg-red-500' :
                          user.role === Role.Therapist ? 'bg-blue-500' :
                          user.role === 'Manager' ? 'bg-purple-500' :
                          user.role === Role.Patient ? 'bg-green-500' :
                          user.role === Role.EducadorFisico ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`} title={`Perfil: ${user.role}`} />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3 text-left flex-1 overflow-hidden min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                            <div className="flex items-center gap-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === Role.Admin ? 'bg-red-100 text-red-700' :
                                  user.role === Role.Therapist ? 'bg-blue-100 text-blue-700' :
                                  user.role === 'Manager' ? 'bg-purple-100 text-purple-700' :
                                  user.role === Role.Patient ? 'bg-green-100 text-green-700' :
                                  user.role === Role.EducadorFisico ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.role === Role.Admin ? '👑 Admin' :
                                   user.role === Role.Therapist ? '🩺 Terapeuta' :
                                   user.role === 'Manager' ? '📊 Gerente' :
                                   user.role === Role.Patient ? '👤 Paciente' :
                                   user.role === Role.EducadorFisico ? '🏃 Ed. Físico' :
                                   user.role}
                                </span>
                            </div>
                        </div>
                    )}
                </Link>
                
                {/* Action Buttons Section */}
                {!isCollapsed && (
                    <div className="flex items-center justify-between space-x-1">
                        <NotificationBell unreadCount={unreadCount} isCollapsed={isCollapsed} />
                        <button onClick={handleLogout} title="Sair do sistema" className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {isCollapsed && (
                    <div className="flex items-center justify-center space-x-1">
                        <NotificationBell unreadCount={unreadCount} isCollapsed={isCollapsed} />
                        <button onClick={handleLogout} title="Sair do sistema" className="p-1.5 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default memo(Sidebar);
