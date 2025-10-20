



'use client';
import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { LayoutGrid, NotebookText, LogOut, Stethoscope, TrendingUp, ShoppingCart, Ticket, Calendar, FileText, Dumbbell, Bell, Flame } from 'lucide-react';
import { useApp } from "../../contexts/AppContext";
import { useNotifications } from '../../hooks/useNotifications';

const NavLinkComponent = ({ to, icon: Icon, label, badgeCount }: { to: string, icon: React.ElementType, label: string, badgeCount?: number }) => (
    <ReactRouterDOM.NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
        <Icon className="w-5 h-5 mr-4" />
        <span className="flex-1">{label}</span>
        {badgeCount && badgeCount > 0 ? (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white border border-red-600">
                {badgeCount > 9 ? '9+' : badgeCount}
            </span>
        ) : null}
    </ReactRouterDOM.NavLink>
);

const PatientSidebar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = ReactRouterDOM.useNavigate();
  const { unreadCount } = useNotifications(user?.id || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navItems = [
    { to: '/portal/dashboard', icon: LayoutGrid, label: 'Início' },
    { to: '/portal/appointments', icon: Calendar, label: 'Meus Agendamentos' },
    { to: '/portal/meu-progresso', icon: TrendingUp, label: 'Meu Progresso' },
    { to: '/portal/my-exercises', icon: Dumbbell, label: 'Meus Exercícios' },
    { to: '/portal/notifications', icon: Bell, label: 'Notificações', badgeCount: unreadCount },
    { to: '/portal/pain-diary', icon: NotebookText, label: 'Diário de Dor' },
    { to: '/portal/gamification', icon: Flame, label: 'Meu Engajamento' },
    { to: '/portal/documents', icon: FileText, label: 'Meus Documentos' },
    { to: '/portal/partner-services', icon: ShoppingCart, label: 'Serviços da Parceria' },
    { to: '/portal/my-vouchers', icon: Ticket, label: 'Meus Vouchers' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="flex items-center justify-center p-4 border-b border-slate-200 h-16 bg-slate-50">
        <Stethoscope className="w-8 h-8 text-blue-600" />
        <span className="text-xl font-bold text-slate-900 ml-2">Fisio<span className="text-blue-600">Flow</span></span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, label, badgeCount }) => (
          <NavLinkComponent
            key={to}
            to={to}
            icon={icon}
            label={label}
            {...(typeof badgeCount === 'number' && { badgeCount })}
          />
        ))}
      </nav>
      {user && (
         <div className="p-3 border-t border-slate-200 bg-slate-50">
            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center shadow-sm">
                <img src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-10 h-10 rounded-full border-2 border-slate-200" />
                <div className="ml-3 flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-600">{user.role}</p>
                </div>
                 <button onClick={handleLogout} title="Sair" className="ml-2 p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientSidebar;