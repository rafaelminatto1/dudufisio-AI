
'use client';
import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import {
    LayoutGrid, Users, Calendar, Stethoscope, ChevronLeft, ChevronRight, BarChart3,
    ShieldCheck, Cog, Library, AreaChart, LogOut, FilePlus, FileClock, Dumbbell,
    AlertTriangle, Mail, BrainCircuit, ClipboardList, PieChart, DollarSign,
    SlidersHorizontal, Bell, MessageSquare, Handshake, Package, Ticket, Activity,
    Users2, BookMarked, FileText, TrendingUp, Database
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

  // 🔐 Enhanced Professional Role-Based Navigation System
  const getFilteredNavigation = (userRole: Role) => {
    const baseNavigation = {
      mainNav: [] as any[],
      aiToolsNav: [] as any[],
      managementNav: [] as any[],
      analyticsNav: [] as any[]
    };

    switch (userRole) {
      case Role.Admin:
        // Admin has comprehensive access to all modules
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard Geral' },
            { to: '/admin-dashboard', icon: BarChart3, label: 'Dashboard Administrativo' },
            { to: '/patients', icon: Users, label: 'Pacientes' },
            { to: '/agenda', icon: Calendar, label: 'Agenda' },
            { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
            { to: '/tasks', icon: ClipboardList, label: 'Quadro de Tarefas' },
          ],
          analyticsNav: [
            { to: '/clinical-analytics', icon: PieChart, label: 'Analytics Clínicos' },
            { to: '/ai-analytics', icon: BrainCircuit, label: 'Analytics de IA' },
            { to: '/financials', icon: DollarSign, label: 'Gestão Financeira' },
            { to: '/reports', icon: BarChart3, label: 'Relatórios BI' },
            { to: '/advanced-reports', icon: TrendingUp, label: 'Relatórios Avançados' },
          ],
          aiToolsNav: [
            { to: '/gerar-laudo', icon: FilePlus, label: 'Gerar Laudo' },
            { to: '/gerar-evolucao', icon: FileClock, label: 'Gerar Evolução' },
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
            { to: '/analise-risco', icon: AlertTriangle, label: 'Análise de Risco' },
          ],
          managementNav: [
            { to: '/users', icon: Users2, label: 'Usuários/Terapeutas' },
            { to: '/groups', icon: Users2, label: 'Grupos' },
            { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Clínicos' },
            { to: '/protocolos', icon: FileText, label: 'Protocolos Clínicos' },
            { to: '/inventory', icon: Package, label: 'Estoque/Insumos' },
            { to: '/partnerships', icon: Handshake, label: 'Convênios/Parcerias' },
            { to: '/events', icon: Ticket, label: 'Eventos' },
            { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp Business' },
            { to: '/email-inativos', icon: Mail, label: 'Email para Inativos' },
            { to: '/mentoria', icon: BrainCircuit, label: 'Sistema de Mentoria' },
            { to: '/knowledge-base', icon: Library, label: 'Base de Conhecimento' },
            { to: '/ia-economica', icon: AreaChart, label: 'IA Econômica' },
            { to: '/teleconsulta', icon: Activity, label: 'Teleconsulta' },
            { to: '/backup', icon: ShieldCheck, label: 'Backup & Manutenção' },
            { to: '/agenda-settings', icon: SlidersHorizontal, label: 'Config. Agenda' },
            { to: '/integrations', icon: ShieldCheck, label: 'Integrações' },
            { to: '/ai-settings', icon: SlidersHorizontal, label: 'Config. IA' },
            { to: '/audit-log', icon: ShieldCheck, label: 'Auditoria & Compliance' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.Therapist:
        // Therapists focused on patient care and clinical tools
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/therapist-dashboard', icon: Stethoscope, label: 'Dashboard Terapeuta' },
            { to: '/patients', icon: Users, label: 'Pacientes' },
            { to: '/agenda', icon: Calendar, label: 'Agenda' },
            { to: '/acompanhamento', icon: Activity, label: 'Acompanhamento' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
            { to: '/tasks', icon: ClipboardList, label: 'Tarefas' },
          ],
          analyticsNav: [
            { to: '/clinical-analytics', icon: PieChart, label: 'Analytics Clínicos' },
            { to: '/my-performance', icon: BarChart3, label: 'Minha Performance' },
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
            { to: '/protocolos', icon: FileText, label: 'Protocolos' },
            { to: '/teleconsulta', icon: Activity, label: 'Teleconsulta' },
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
          analyticsNav: [
            { to: '/my-progress', icon: TrendingUp, label: 'Meu Progresso' },
          ],
          aiToolsNav: [],
          managementNav: [
            { to: '/my-exercises', icon: Dumbbell, label: 'Meus Exercícios' },
            { to: '/teleconsulta', icon: Activity, label: 'Teleconsulta' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.EducadorFisico:
        // Physical Educator focused on exercises and educational content
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
          ],
          analyticsNav: [
            { to: '/exercise-analytics', icon: BarChart3, label: 'Analytics de Exercícios' },
          ],
          aiToolsNav: [
            { to: '/gerar-hep', icon: Dumbbell, label: 'Gerar Plano (HEP)' },
          ],
          managementNav: [
            { to: '/exercises', icon: Dumbbell, label: 'Biblioteca de Exercícios' },
            { to: '/materials', icon: BookMarked, label: 'Materiais Educativos' },
            { to: '/partnerships', icon: Handshake, label: 'Parcerias' },
            { to: '/events', icon: Ticket, label: 'Eventos/Workshops' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      case Role.Manager:
        // Manager focused on operational and financial oversight
        return {
          mainNav: [
            { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { to: '/admin-dashboard', icon: BarChart3, label: 'Dashboard Gerencial' },
            { to: '/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
          ],
          analyticsNav: [
            { to: '/financial-analytics', icon: DollarSign, label: 'Analytics Financeiros' },
            { to: '/operational-analytics', icon: BarChart3, label: 'Analytics Operacionais' },
            { to: '/reports', icon: FileText, label: 'Relatórios Gerenciais' },
            { to: '/advanced-reports', icon: TrendingUp, label: 'Relatórios Avançados' },
          ],
          aiToolsNav: [],
          managementNav: [
            { to: '/financials', icon: DollarSign, label: 'Gestão Financeira' },
            { to: '/inventory', icon: Package, label: 'Estoque' },
            { to: '/partnerships', icon: Handshake, label: 'Convênios' },
            { to: '/users', icon: Users2, label: 'Equipe' },
            { to: '/audit-log', icon: ShieldCheck, label: 'Auditoria' },
            { to: '/settings', icon: Cog, label: 'Configurações' },
          ]
        };

      default:
        return baseNavigation;
    }
  };

  // Get filtered navigation based on user role
  const navigation = user ? getFilteredNavigation(user.role) : {
    mainNav: [],
    aiToolsNav: [],
    managementNav: [],
    analyticsNav: []
  };

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
      </nav>

      {user && (
         <div className="p-3 border-t border-slate-200 shrink-0">
            <div className="p-2 rounded-lg bg-gradient-to-r from-slate-50 to-sky-50 border border-slate-200 flex items-center">
                <ReactRouterDOM.Link to="/settings" title="Ver perfil e configurações" className="flex items-center w-full">
                    <div className="relative">
                        <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full shrink-0 border-2 border-white shadow-sm" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          user.role === Role.Admin ? 'bg-red-500' :
                          user.role === Role.Therapist ? 'bg-blue-500' :
                          user.role === Role.Manager ? 'bg-purple-500' :
                          user.role === Role.Patient ? 'bg-green-500' :
                          user.role === Role.EducadorFisico ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`} title={`Perfil: ${user.role}`} />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3 text-left flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                            <div className="flex items-center gap-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === Role.Admin ? 'bg-red-100 text-red-700' :
                                  user.role === Role.Therapist ? 'bg-blue-100 text-blue-700' :
                                  user.role === Role.Manager ? 'bg-purple-100 text-purple-700' :
                                  user.role === Role.Patient ? 'bg-green-100 text-green-700' :
                                  user.role === Role.EducadorFisico ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.role === Role.Admin ? '👑 Admin' :
                                   user.role === Role.Therapist ? '🩺 Terapeuta' :
                                   user.role === Role.Manager ? '📊 Gerente' :
                                   user.role === Role.Patient ? '👤 Paciente' :
                                   user.role === Role.EducadorFisico ? '🏃 Ed. Físico' :
                                   user.role}
                                </span>
                            </div>
                        </div>
                    )}
                </ReactRouterDOM.Link>
                {!isCollapsed && (
                    <button onClick={handleLogout} title="Sair do sistema" className="ml-2 p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                )}
                {isCollapsed && (
                    <button onClick={handleLogout} title="Sair do sistema" className="absolute bottom-2 right-2 p-1.5 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
