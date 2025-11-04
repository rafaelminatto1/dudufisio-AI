import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  logoSrc?: string;
  logoAlt?: string;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
  avatarSrc?: string;
  avatarAlt?: string;
  variant?: 'default' | 'transparent' | 'elevated' | 'minimal';
  position?: 'static' | 'sticky' | 'fixed';
  className?: string;
  containerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  onLogoClick?: () => void;
  onAvatarClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  logo,
  logoSrc,
  logoAlt,
  navigation,
  actions,
  avatar,
  avatarSrc,
  avatarAlt,
  variant = 'default',
  position = 'sticky',
  className = '',
  containerClassName = '',
  titleClassName = '',
  subtitleClassName = '',
  onLogoClick,
  onAvatarClick,
}) => {
  const { themeConfig } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'transparent':
        return `
          bg-transparent
          text-white
          backdrop-blur-sm
          border-b border-white/10
        `;
      case 'elevated':
        return `
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-white
          shadow-lg
          border-b border-gray-200 dark:border-gray-700
        `;
      case 'minimal':
        return `
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-white
          border-b border-gray-100 dark:border-gray-800
        `;
      default:
        return `
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-white
          shadow-md
          border-b border-gray-200 dark:border-gray-700
        `;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'sticky':
        return 'sticky top-0 z-50';
      case 'fixed':
        return 'fixed top-0 left-0 right-0 z-50';
      default:
        return 'relative';
    }
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    }
  };

  return (
    <header
      className={`
        ${getVariantStyles()}
        ${getPositionStyles()}
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.primary,
        transition: themeConfig.transitions.default,
      }}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        <div className="flex items-center justify-between h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            {logo && (
              <div className="flex-shrink-0">
                {logo}
              </div>
            )}
            
            {logoSrc && (
              <button
                onClick={handleLogoClick}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoSrc}
                  alt={logoAlt || 'Logo'}
                  className="h-8 w-auto"
                />
              </button>
            )}
            
            {(title || subtitle) && (
              <div className="flex flex-col">
                {title && (
                  <h1 
                    className={`text-xl font-bold text-gray-900 dark:text-white ${titleClassName}`}
                    style={{ fontFamily: themeConfig.typography.fontFamily.primary }}
                  >
                    {title}
                  </h1>
                )}
                
                {subtitle && (
                  <p className={`text-sm text-gray-600 dark:text-gray-400 ${subtitleClassName}`}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navegação */}
          {navigation && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigation}
            </nav>
          )}

          {/* Ações e Avatar */}
          <div className="flex items-center space-x-4">
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
            
            {avatar && (
              <div className="flex-shrink-0">
                {avatar}
              </div>
            )}
            
            {avatarSrc && (
              <button
                onClick={handleAvatarClick}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <img
                  src={avatarSrc}
                  alt={avatarAlt || 'Avatar'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Componente de navegação do header
interface HeaderNavigationProps {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
  }>;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  items,
  className = '',
  itemClassName = '',
  activeClassName = '',
}) => {
  const { themeConfig } = useTheme();

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${item.active 
              ? `text-[${themeConfig.colors.primary}] bg-[${themeConfig.colors.primaryLight}] bg-opacity-10 ${activeClassName}`
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            ${itemClassName}
          `}
          style={{ fontFamily: themeConfig.typography.fontFamily.primary }}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
};

// Componente de ações do header
interface HeaderActionsProps {
  items: Array<{
    icon: React.ReactNode;
    onClick?: () => void;
    label?: string;
    badge?: number | string;
    variant?: 'default' | 'primary' | 'accent';
  }>;
  className?: string;
  itemClassName?: string;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  items,
  className = '',
  itemClassName = '',
}) => {
  const { themeConfig } = useTheme();

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return `bg-[${themeConfig.colors.primary}] text-white hover:bg-[${themeConfig.colors.primaryDark}]`;
      case 'accent':
        return `bg-[${themeConfig.colors.accent}] text-white hover:bg-[${themeConfig.colors.accentDark}]`;
      default:
        return 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          title={item.label}
          className={`
            relative p-2 rounded-lg transition-all duration-200
            ${getVariantStyles(item.variant || 'default')}
            ${itemClassName}
          `}
        >
          {item.icon}
          
          {item.badge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Componente de avatar do header
interface HeaderAvatarProps {
  src: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  className?: string;
}

export const HeaderAvatar: React.FC<HeaderAvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  online = false,
  className = '',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-10 h-10 text-base';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  return (
    <div className={`relative ${getSizeStyles()} ${className}`}>
      <img
        src={src}
        alt={alt || 'Avatar'}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {fallback.charAt(0).toUpperCase()}
        </span>
      </div>
      
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
      )}
    </div>
  );
};

export default Header;