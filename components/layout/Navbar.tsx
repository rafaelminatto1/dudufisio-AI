import React, { memo } from 'react';
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.id || '');
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Fechar menu do usuário ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <header className="bg-white border-b border-fisio-neutral-200 h-16 flex items-center px-4 lg:px-6 shadow-sm">
      <div className="flex items-center justify-between w-full">
        {/* Lado Esquerdo */}
        <div className="flex items-center space-x-4">
          {/* Botão Menu Hambúrguer - Visível apenas em mobile/tablet */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors focus-ring"
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <Menu className="w-5 h-5 text-fisio-neutral-700" />
          </button>

          {/* Logo em Mobile */}
          <div className="lg:hidden flex items-center">
            <span className="text-lg font-bold">
              <span className="text-fisio-neutral-800">Fisio</span>
              <span className="text-fisio-primary-DEFAULT">Flow</span>
            </span>
          </div>

          {/* Barra de Pesquisa - Desktop */}
          <div className="hidden lg:flex items-center bg-fisio-neutral-50 rounded-lg px-4 py-2 w-96">
            <Search className="w-4 h-4 text-fisio-neutral-400 mr-2" />
            <input
              type="text"
              placeholder="Pesquisar pacientes, exercícios, protocolos..."
              className="bg-transparent flex-1 text-sm text-fisio-neutral-700 placeholder-fisio-neutral-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Botão de Pesquisa - Mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors focus-ring"
            aria-label="Pesquisar"
          >
            <Search className="w-5 h-5 text-fisio-neutral-700" />
          </button>

          {/* Notificações */}
          <button
            onClick={handleNotificationsClick}
            className="relative p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors focus-ring"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5 text-fisio-neutral-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fisio-error-DEFAULT text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Menu do Usuário */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors focus-ring"
              aria-label="Menu do usuário"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-fisio-neutral-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-fisio-primary-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-fisio-primary-700" />
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-fisio-neutral-700">
                {user?.name?.split(' ')[0] || 'Usuário'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-fisio-neutral-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-fisio-neutral-100">
                  <p className="text-sm font-medium text-fisio-neutral-800">{user?.name}</p>
                  <p className="text-xs text-fisio-neutral-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-left text-sm text-fisio-neutral-700 hover:bg-fisio-neutral-50 flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </button>
                
                <button
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2 text-left text-sm text-fisio-neutral-700 hover:bg-fisio-neutral-50 flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </button>
                
                <div className="border-t border-fisio-neutral-100 mt-1">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-2 text-left text-sm text-fisio-error-600 hover:bg-fisio-error-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
