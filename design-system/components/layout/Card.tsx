import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { animations, animationVariants } from '../../utils/animations';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderRadius = 'lg',
  shadow = 'md',
  hover = false,
  clickable = false,
  className = '',
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { themeConfig } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return `
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          shadow-lg hover:shadow-xl
        `;
      case 'outlined':
        return `
          bg-transparent
          border-2 border-[${themeConfig.colors.primary}]
          hover:bg-[${themeConfig.colors.surface}]
        `;
      case 'filled':
        return `
          bg-[${themeConfig.colors.surface}]
          border border-[${themeConfig.colors.border}]
          hover:bg-[${themeConfig.colors.backgroundSecondary}]
        `;
      case 'gradient':
        return `
          bg-gradient-to-br from-[${themeConfig.colors.primaryLight}] to-[${themeConfig.colors.primary}]
          text-white
          shadow-lg hover:shadow-xl
        `;
      default:
        return `
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          shadow-md hover:shadow-lg
          ${animationVariants.card}
        `;
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'xs':
        return 'p-2';
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-12';
      default:
        return 'p-6';
    }
  };

  const getBorderRadiusStyles = () => {
    switch (borderRadius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded';
      case 'md':
        return 'rounded-lg';
      case 'lg':
        return 'rounded-xl';
      case 'xl':
        return 'rounded-2xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-xl';
    }
  };

  const getShadowStyles = () => {
    switch (shadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      case 'xl':
        return 'shadow-xl';
      default:
        return 'shadow-md';
    }
  };

  const getHoverStyles = () => {
    if (hover || clickable) {
      return `
        transform transition-all duration-200 ease-in-out
        hover:-translate-y-1 hover:scale-[1.02]
        cursor-pointer
      `;
    }
    return '';
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (clickable && onClick) {
      onClick(event);
    }
  };

  return (
    <div
      ref={null}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        ${getVariantStyles()}
        ${getPaddingStyles()}
        ${getBorderRadiusStyles()}
        ${getShadowStyles()}
        ${getHoverStyles()}
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.secondary,
        transition: themeConfig.transitions.default,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Componente de cabeçalho de card
interface CardHeaderProps {
  children: React.ReactNode;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  avatar,
  action,
  title,
  subtitle,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  const { themeConfig } = useTheme();

  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-center space-x-4 flex-1">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 
              className={`text-lg font-semibold text-gray-900 dark:text-white truncate ${titleClassName}`}
              style={{ fontFamily: themeConfig.typography.fontFamily.primary }}
            >
              {title}
            </h3>
          )}
          
          {subtitle && (
            <p className={`text-sm text-gray-600 dark:text-gray-400 ${subtitleClassName}`}>
              {subtitle}
            </p>
          )}
          
          {children}
        </div>
      </div>
      
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

// Componente de conteúdo de card
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

// Componente de ações de card
interface CardActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export const CardActions: React.FC<CardActionsProps> = ({
  children,
  align = 'right',
  className = '',
}) => {
  const getAlignmentStyles = () => {
    switch (align) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      case 'between':
        return 'justify-between';
      default:
        return 'justify-end';
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${getAlignmentStyles()} ${className}`}>
      {children}
    </div>
  );
};

// Componente de rodapé de card
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  divider = true,
}) => {
  return (
    <div className={`${divider ? 'border-t border-gray-200 dark:border-gray-700 pt-4 mt-4' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Componente de avatar para uso em cards
interface CardAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CardAvatar: React.FC<CardAvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className = '',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'w-8 h-8 text-xs';
      case 'sm':
        return 'w-10 h-10 text-sm';
      case 'md':
        return 'w-12 h-12 text-base';
      case 'lg':
        return 'w-16 h-16 text-lg';
      case 'xl':
        return 'w-20 h-20 text-xl';
      default:
        return 'w-12 h-12 text-base';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ${getSizeStyles()} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {fallback?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};

export default Card;