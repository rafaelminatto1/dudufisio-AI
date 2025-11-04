import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Search, Bell, User, Menu, X, ChevronDown } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ModernTopBarProps {
  title?: string;
  subtitle?: string;
  notifications?: NotificationItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onMenuToggle?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  onUserMenuClick?: () => void;
  className?: string;
}

const ModernTopBar: React.FC<ModernTopBarProps> = ({
  title,
  subtitle,
  notifications = [],
  user,
  onMenuToggle,
  onNotificationClick,
  onUserMenuClick,
  className,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 transition-all duration-300',
        'glass-nav dark:glass-nav-dark',
        'border-b border-white/10 dark:border-gray-700/10',
        {
          'shadow-lg': isScrolled,
          'shadow-none': !isScrolled,
        },
        className
      )}
      style={{
        left: '16rem', // Adjust based on sidebar width
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors duration-200 touch-target lg:hidden"
            aria-label="Abrir menu"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Title Section */}
          {(title || subtitle) && (
            <div className="hidden sm:block">
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <div
              className={cn(
                'flex items-center bg-white/50 dark:bg-gray-800/50 rounded-lg transition-all duration-300',
                'border border-white/20 dark:border-gray-700/20',
                'hover:bg-white/70 dark:hover:bg-gray-800/70',
                'focus-within:bg-white dark:focus-within:bg-gray-800',
                'focus-within:border-primary-500/50 focus-within:shadow-primary/20',
                {
                  'w-full': searchExpanded,
                  'w-10': !searchExpanded,
                }
              )}
            >
              <Search
                className={cn(
                  'w-4 h-4 text-gray-500 dark:text-gray-400 transition-all duration-300',
                  {
                    'ml-3': searchExpanded,
                    'mx-auto': !searchExpanded,
                  }
                )}
              />
              <input
                type="text"
                placeholder="Buscar..."
                className={cn(
                  'bg-transparent border-0 outline-none text-sm transition-all duration-300',
                  'placeholder-gray-500 dark:placeholder-gray-400',
                  {
                    'w-full px-3 py-2': searchExpanded,
                    'w-0 opacity-0': !searchExpanded,
                  }
                )}
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors duration-200 touch-target"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-health-error text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notificações
                    </h3>
          <button
            onClick={() => setShowNotifications(false)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Fechar notificações"
            title="Fechar notificações"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          onNotificationClick?.(notification);
                          setShowNotifications(false);
                        }}
                        className={cn(
                          'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200',
                          'border-b border-gray-100 dark:border-gray-700 last:border-b-0',
                          {
                            'bg-blue-50 dark:bg-blue-900/20': !notification.read,
                          }
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors duration-200 touch-target"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onUserMenuClick?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                    >
                      Configurações
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                      aria-label="Sair da conta"
                      title="Sair da conta"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ModernTopBar;
