/**
 * Layout Principal do App de Pacientes
 * MoocaFisio - App para Pacientes
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, User, LogOut } from 'lucide-react';
import { logout } from '../services/patientAuthService';
import { cn } from '../lib/utils';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const location = useLocation();
  
  // Detectar se está sendo usado como remote ou standalone
  const isRemote = location.pathname.startsWith('/patient/');
  const basePath = isRemote ? '/patient' : '';
  
  const handleLogout = () => {
    logout();
    const loginPath = isRemote ? '/patient/login' : '/login';
    window.location.href = loginPath;
  };
  
  const navItems = [
    {
      to: `${basePath}/dashboard`,
      icon: Home,
      label: 'Início',
    },
    {
      to: `${basePath}/exercises`,
      icon: Activity,
      label: 'Exercícios',
    },
    {
      to: `${basePath}/profile`,
      icon: User,
      label: 'Perfil',
    },
  ];
  
  return (
    <div className="min-h-screen bg-neutral-bgAlt pb-20 md:pb-0">
      {/* Header - Desktop e Mobile */}
      <header className="bg-white border-b border-neutral-border sticky top-0 z-40">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="text-h3 text-primary font-bold">MoocaFisio</div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-lg">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-sm px-md py-sm rounded-lg transition-colors',
                  location.pathname === item.to
                    ? 'bg-primary text-white'
                    : 'text-neutral-textSecondary hover:bg-neutral-bgAlt'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-body font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-sm px-md py-sm rounded-lg text-error hover:bg-error-light transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-body font-medium">Sair</span>
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-md py-lg">
        {children}
      </main>
      
      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-border z-50">
        <div className="flex items-center justify-around px-md py-sm">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-xs py-sm px-lg rounded-lg transition-colors min-w-[72px]',
                location.pathname === item.to
                  ? 'text-primary'
                  : 'text-neutral-textSecondary'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-small font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

