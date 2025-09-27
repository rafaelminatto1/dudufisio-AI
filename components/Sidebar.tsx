
'use client';
import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { 
    LayoutGrid, Users, Calendar, Stethoscope, ChevronLeft, ChevronRight, BarChart3, 
    ShieldCheck, Cog, Library, AreaChart, LogOut, FilePlus, FileClock, Dumbbell, 
    AlertTriangle, Mail, BrainCircuit, ClipboardList, PieChart, DollarSign, 
    SlidersHorizontal, Bell, MessageSquare, Handshake, Package, Ticket, Activity, Users2, BookMarked, FileText
} from 'lucide-react';
import { useAuth } from "../contexts/AppContext";
import { useNotifications } from '../hooks/useNotifications';
import { Role } from '../types';

const NavLinkComponent = ({ to, icon: Icon, label, isCollapsed, badgeCount }: { to: string, icon: React.ElementType, label: string, isCollapsed: boolean, badgeCount?: number }) => (
    <ReactRouterDOM.NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-sky-50 text-sky-600 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
      title={isCollapsed ? label : undefined}
    >
        <div className="relative flex items-center w-full">
            <Icon className={`w-4 h-4 shrink-0 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-sm">{label}</span>}
            
            {!isCollapsed && badgeCount && badgeCount > 0 ? (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            ) : null}

             {isCollapsed && badgeCount && badgeCount > 0 ? (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            ) : null}
        </div>
    </ReactRouterDOM.NavLink>
);

const NavGroup: React.FC<{ title: string; isCollapsed: boolean; children: React.ReactNode }> = ({ title, isCollapsed, children }) => (
    <div>
        {!isCollapsed && (
            <h3 className="px-3 pt-4 pb-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                {title}
            </h3>
        )}
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const { unreadCount } = useNotifications(user?.id || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
<<<<<<< Current (Your changes)

  // 🔐 Professional Role-Based Navigation Filter
  const getFilteredNavigation = (userRole: Role) => {
    const baseNavigation = {
      mainNav: [] as any[],
      aiToolsNav: [] as any[],
      managementNav: [] as any[]
    };

    switch (userRole) {
      case Role.Admin:
        // Admin has access to everything
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/admin-dashboard', icon: BarChart3, label: 'Dashboard Administrativo' },
            { to: '/clinical-analytics', icon: PieChart, label: 'Dashboard Clínico' },
            { to: '/patients', icon: Users, label: 'Pacientes' },
            { to: '/agenda', icon: Calendar, label: 'Agenda' },
            { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
            { to: '/tasks', icon: ClipboardList, label: 'Quadro de Tarefas' },
          ],
          aiToolsNav: [
            { to: '/gerar-laudo', icon: FilePlus, label: 'Gerar Laudo' },
            { to: '/gerar-evolucao', icon: FileClock, label: 'Gerar Evolução' },
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
            { to: '/analise-risco', icon: AlertTriangle, label: 'Análise de Risco' },
          ],
          managementNav: [
            { to: '/groups', icon: Users2, label: 'Grupos' },
            { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
            { to: '/financials', icon: DollarSign, label: 'Financeiro' },
            { to: '/inventory', icon: Package, label: 'Insumos' },
            { to: '/partnerships', icon: Handshake, label: 'Parcerias' },
            { to: '/events', icon: Ticket, label: 'Eventos' },
            { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
            { to: '/email-inativos', icon: Mail, label: 'Email para Inativos' },
            { to: '/mentoria', icon: BrainCircuit, label: 'Mentoria' },
            { to: '/reports', icon: BarChart3, label: 'Relatórios' },
            { to: '/knowledge-base', icon: Library, label: 'Base de Conhecimento' },
            { to: '/ia-economica', icon: AreaChart, label: 'IA Econômica' },
            { to: '/agenda-settings', icon: SlidersHorizontal, label: 'Config. Agenda' },
            { to: '/integrations', icon: ShieldCheck, label: 'Integrações' },
            { to: '/ai-settings', icon: SlidersHorizontal, label: 'Config. IA' },
            { to: '/audit-log', icon: ShieldCheck, label: 'Auditoria' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.Therapist:
        // Therapists focused on patient care and clinical tools
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/clinical-analytics', icon: PieChart, label: 'Dashboard Clínico' },
            { to: '/patients', icon: Users, label: 'Pacientes' },
            { to: '/agenda', icon: Calendar, label: 'Agenda' },
            { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
            { to: '/tasks', icon: ClipboardList, label: 'Tarefas' },
          ],
          aiToolsNav: [
            { to: '/gerar-laudo', icon: FilePlus, label: 'Gerar Laudo' },
            { to: '/gerar-evolucao', icon: FileClock, label: 'Gerar Evolução' },
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
            { to: '/analise-risco', icon: AlertTriangle, label: 'Análise de Risco' },
          ],
          managementNav: [
            { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
            { to: '/reports', icon: BarChart3, label: 'Relatórios' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.Patient:
        // Patient portal with limited access
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Meu Portal' },
            { to: '/my-appointments', icon: Calendar, label: 'Meus Agendamentos' },
            { to: '/my-treatments', icon: Activity, label: 'Meus Tratamentos' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
          ],
          aiToolsNav: [],
          managementNav: [
            { to: '/my-exercises', icon: Dumbbell, label: 'Meus Exercícios' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.EducadorFisico:
        // Educator focused on exercises and materials
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
          ],
          aiToolsNav: [],
          managementNav: [
            { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
            { to: '/partnerships', icon: Handshake, label: 'Parcerias' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      default:
        return baseNavigation;
    }
  };

  // Get filtered navigation based on user role
  const navigation = user ? getFilteredNavigation(user.role) : { mainNav: [], aiToolsNav: [], managementNav: [] };
=======
  
  const mainNav = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/clinical-analytics', icon: PieChart, label: 'Dashboard Clínico' },
    { to: '/patients', icon: Users, label: 'Pacientes' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
    { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
    { to: '/tasks', icon: ClipboardList, label: 'Quadro de Tarefas' },
  ];

  const aiToolsNav = [
    { to: '/gerar-laudo', icon: FilePlus, label: 'Gerar Laudo' },
    { to: '/gerar-evolucao', icon: FileClock, label: 'Gerar Evolução' },
    { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
    { to: '/analise-risco', icon: AlertTriangle, label: 'Análise de Risco' },
  ];

  const managementNav = [
    { to: '/groups', icon: Users2, label: 'Grupos' },
    { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
    { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
    { to: '/protocolos', icon: FileText, label: 'Protocolos Clínicos' },
    { to: '/financials', icon: DollarSign, label: 'Financeiro' },
    { to: '/inventory', icon: Package, label: 'Insumos' },
    { to: '/partnerships', icon: Handshake, label: 'Parcerias' },
    { to: '/events', icon: Ticket, label: 'Eventos' },
    { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
    { to: '/email-inativos', icon: Mail, label: 'Email para Inativos' },
    { to: '/mentoria', icon: BrainCircuit, label: 'Mentoria' },
    { to: '/reports', icon: BarChart3, label: 'Relatórios' },
    { to: '/knowledge-base', icon: Library, label: 'Base de Conhecimento' },
    { to: '/ia-economica', icon: AreaChart, label: 'IA Econômica' },
    { to: '/agenda-settings', icon: SlidersHorizontal, label: 'Config. Agenda' },
    { to: '/integrations', icon: ShieldCheck, label: 'Integrações' },
    { to: '/ai-settings', icon: SlidersHorizontal, label: 'Config. IA' },
    { to: '/audit-log', icon: ShieldCheck, label: 'Auditoria' },
    { to: '/settings', icon: Cog, label: 'Configurações' },
  ];
>>>>>>> Incoming (Background Agent changes)

  return (
    <div className={`transition-all duration-300 ease-in-out bg-white border-r border-slate-200 flex flex-col ${isCollapsed ? 'w-16' : 'w-52'}`}>
      <div className="flex items-center p-3 border-b border-slate-200 h-14 shrink-0">
        {!isCollapsed && <Stethoscope className="w-6 h-6 text-sky-500" />}
        {!isCollapsed && <span className="text-lg font-bold text-slate-800 ml-2">Fisio<span className="text-sky-500">Flow</span></span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 rounded-full text-slate-500 hover:bg-slate-100 ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}>
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.mainNav.length > 0 && (
          <NavGroup title="Principal" isCollapsed={isCollapsed}>
            {navigation.mainNav.map(item => <NavLinkComponent key={item.to} {...item} isCollapsed={isCollapsed} />)}
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
      </nav>

      {user && (
         <div className="p-3 border-t border-slate-200 shrink-0">
            <div className="p-2 rounded-lg bg-slate-50 flex items-center">
                <ReactRouterDOM.Link to="/settings" title="Ver perfil e configurações" className="flex items-center w-full">
                    <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full shrink-0" />
                    {!isCollapsed && (
                        <div className="ml-3 text-left flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.role}</p>
                        </div>
                    )}
                </ReactRouterDOM.Link>
                {!isCollapsed && (
                    <button onClick={handleLogout} title="Sair" className="ml-2 p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800">
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
