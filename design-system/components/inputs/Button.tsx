import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  title,
}) => {
  const { themeConfig } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.primary}] to-[${themeConfig.colors.primaryDark}]
          text-white
          hover:from-[${themeConfig.colors.primaryLight}] hover:to-[${themeConfig.colors.primary}]
          focus:ring-4 focus:ring-[${themeConfig.colors.primaryLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'secondary':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.secondary}] to-[${themeConfig.colors.secondaryDark}]
          text-white
          hover:from-[${themeConfig.colors.secondaryLight}] hover:to-[${themeConfig.colors.secondary}]
          focus:ring-4 focus:ring-[${themeConfig.colors.secondaryLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'accent':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.accent}] to-[${themeConfig.colors.accentDark}]
          text-white
          hover:from-[${themeConfig.colors.accentLight}] hover:to-[${themeConfig.colors.accent}]
          focus:ring-4 focus:ring-[${themeConfig.colors.accentLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'success':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.success}] to-[${themeConfig.colors.successDark}]
          text-white
          hover:from-[${themeConfig.colors.successLight}] hover:to-[${themeConfig.colors.success}]
          focus:ring-4 focus:ring-[${themeConfig.colors.successLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'warning':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.warning}] to-[${themeConfig.colors.warningDark}]
          text-white
          hover:from-[${themeConfig.colors.warningLight}] hover:to-[${themeConfig.colors.warning}]
          focus:ring-4 focus:ring-[${themeConfig.colors.warningLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'error':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.error}] to-[${themeConfig.colors.errorDark}]
          text-white
          hover:from-[${themeConfig.colors.errorLight}] hover:to-[${themeConfig.colors.error}]
          focus:ring-4 focus:ring-[${themeConfig.colors.errorLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'outline':
        return `
          bg-transparent
          border-2 border-[${themeConfig.colors.primary}]
          text-[${themeConfig.colors.primary}]
          hover:bg-[${themeConfig.colors.primary}] hover:text-white
          focus:ring-4 focus:ring-[${themeConfig.colors.primaryLight}] focus:ring-opacity-50
          shadow-md hover:shadow-lg
        `;
      case 'ghost':
        return `
          bg-transparent
          text-[${themeConfig.colors.textPrimary}]
          hover:bg-[${themeConfig.colors.surface}] hover:text-[${themeConfig.colors.primary}]
          focus:ring-4 focus:ring-[${themeConfig.colors.primaryLight}] focus:ring-opacity-50
          shadow-sm hover:shadow-md
        `;
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-3 py-1.5 text-xs';
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'xl':
        return 'px-10 py-5 text-xl';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      title={title}
      className={`
        relative inline-flex items-center justify-center
        rounded-xl font-semibold
        transition-all duration-200 ease-in-out
        transform hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.primary,
        transition: themeConfig.transitions.default,
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : ''}`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </div>
    </button>
  );
};

// Componente de grupo de botões
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'none',
  className = '',
}) => {
  const getSpacing = () => {
    switch (spacing) {
      case 'sm':
        return orientation === 'horizontal' ? 'space-x-2' : 'space-y-2';
      case 'md':
        return orientation === 'horizontal' ? 'space-x-4' : 'space-y-4';
      case 'lg':
        return orientation === 'horizontal' ? 'space-x-6' : 'space-y-6';
      default:
        return '';
    }
  };

  const containerClass = `
    flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
    ${getSpacing()}
    ${className}
  `;

  return (
    <div className={containerClass}>
      {children}
    </div>
  );
};

// Componente de ícone de botão
interface IconButtonProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  title,
}) => {
  const { themeConfig } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.primary}] to-[${themeConfig.colors.primaryDark}]
          text-white
          hover:from-[${themeConfig.colors.primaryLight}] hover:to-[${themeConfig.colors.primary}]
          focus:ring-4 focus:ring-[${themeConfig.colors.primaryLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'secondary':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.secondary}] to-[${themeConfig.colors.secondaryDark}]
          text-white
          hover:from-[${themeConfig.colors.secondaryLight}] hover:to-[${themeConfig.colors.secondary}]
          focus:ring-4 focus:ring-[${themeConfig.colors.secondaryLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'accent':
        return `
          bg-gradient-to-r from-[${themeConfig.colors.accent}] to-[${themeConfig.colors.accentDark}]
          text-white
          hover:from-[${themeConfig.colors.accentLight}] hover:to-[${themeConfig.colors.accent}]
          focus:ring-4 focus:ring-[${themeConfig.colors.accentLight}] focus:ring-opacity-50
          shadow-lg hover:shadow-xl
        `;
      case 'outline':
        return `
          bg-transparent
          border-2 border-[${themeConfig.colors.primary}]
          text-[${themeConfig.colors.primary}]
          hover:bg-[${themeConfig.colors.primary}] hover:text-white
          focus:ring-4 focus:ring-[${themeConfig.colors.primaryLight}] focus:ring-opacity-50
          shadow-md hover:shadow-lg
        `;
      case 'ghost':
        return `
          bg-transparent
          text-[${themeConfig.colors.textPrimary}]
          hover:bg-[${themeConfig.colors.surface}] hover:text-[${themeConfig.colors.primary}]
          focus:ring-4 focus:ring-[${themeConfig.colors.primaryLight}] focus:ring-opacity-50
          shadow-sm hover:shadow-md
        `;
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'w-8 h-8';
      case 'sm':
        return 'w-10 h-10';
      case 'md':
        return 'w-12 h-12';
      case 'lg':
        return 'w-14 h-14';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={handleClick}
      title={title}
      className={`
        relative inline-flex items-center justify-center
        rounded-xl font-semibold
        transition-all duration-200 ease-in-out
        transform hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.primary,
        transition: themeConfig.transitions.default,
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className={`flex items-center justify-center ${loading ? 'opacity-0' : ''}`}>
        {icon}
      </div>
    </button>
  );
};

export default Button;