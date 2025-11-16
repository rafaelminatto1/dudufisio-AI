import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Calendar, Users, Activity, Plus } from 'lucide-react';
import { Role } from '../../types/enums';

interface BottomNavigationProps {
  user: any;
}

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  roles?: Role[];
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ user }) => {
  // Itens principais da navegação inferior
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: LayoutGrid,
      label: 'Dashboard',
    },
    {
      path: '/agenda',
      icon: Calendar,
      label: 'Agenda',
      roles: [Role.Admin, Role.Therapist],
    },
    {
      path: '/patients',
      icon: Users,
      label: 'Pacientes',
      roles: [Role.Admin, Role.Therapist],
    },
    {
      path: '/exercises',
      icon: Activity,
      label: 'Exercícios',
      roles: [Role.Admin, Role.Therapist, Role.EducadorFisico],
    },
  ];

  // Filtrar itens baseado no papel do usuário
  const filteredItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  // Botão de ação flutuante (FAB) - posicionado no centro
  const handleFabClick = () => {
    // Lógica para abrir modal de criação rápida
    // Por exemplo: novo agendamento, novo paciente, etc.
    console.log('FAB clicked - open quick create modal');
  };

  return (
    <>
      {/* Botão de Ação Flutuante (FAB) */}
      <button
        onClick={handleFabClick}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-fisio-primary-DEFAULT rounded-full shadow-lg flex items-center justify-center hover-scale focus-ring"
        aria-label="Ação rápida"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-fisio-neutral-200 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const baseClasses = 'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-200';
                const activeClasses = isActive
                  ? 'text-fisio-primary-DEFAULT'
                  : 'text-fisio-neutral-500 hover:text-fisio-neutral-700';
                return `${baseClasses} ${activeClasses}`;
              }}
            >
              {({ isActive }) => (
                <>
                  <div className={`relative ${isActive ? 'animate-pulse-green' : ''}`}>
                    <item.icon className="w-5 h-5 mb-1" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-fisio-primary-DEFAULT rounded-full" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default memo(BottomNavigation);
