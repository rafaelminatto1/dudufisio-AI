import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, Loader2, Check, X } from 'lucide-react';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  ripple?: boolean;
  glow?: boolean;
  className?: string;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  success = false,
  error = false,
  ripple = true,
  glow = false,
  className,
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick && !loading && !success && !error) {
      onClick(e);
    }
  };

  const variantClasses = {
    primary: {
      base: 'bg-gradient-primary text-white border-0 shadow-primary',
      hover: 'hover:shadow-lg hover:shadow-primary/50',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
    secondary: {
      base: 'bg-transparent text-primary-600 border border-primary-600',
      hover: 'hover:bg-primary-600 hover:text-white',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
    ghost: {
      base: 'bg-transparent text-gray-700 dark:text-gray-300 border-0',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
    danger: {
      base: 'bg-health-error text-white border-0',
      hover: 'hover:bg-health-error/90 hover:shadow-lg',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
    success: {
      base: 'bg-health-success text-white border-0',
      hover: 'hover:bg-health-success/90 hover:shadow-lg',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
    floating: {
      base: 'bg-gradient-primary text-white border-0 rounded-full shadow-xl',
      hover: 'hover:shadow-2xl hover:shadow-primary/50 hover:scale-105',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentVariant = variantClasses[variant];
  const isDisabled = disabled || loading;

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        currentVariant.base,
        currentVariant.hover,
        currentVariant.active,
        currentVariant.disabled,
        sizeClasses[size],
        {
          'rounded-full': variant === 'floating',
          'rounded-lg': variant !== 'floating',
          'hover-glow': glow,
          'animate-pulse-glow': loading,
        },
        className
      )}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping w-5 h-5 bg-white/60 rounded-full"
          style={{
            left: `${ripple.x - 10}px`,
            top: `${ripple.y - 10}px`,
          }}
        />
      ))}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {/* Loading Spinner */}
        {loading && (
          <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />
        )}

        {/* Success Icon */}
        {success && (
          <Check className={cn('text-white', iconSizeClasses[size])} />
        )}

        {/* Error Icon */}
        {error && (
          <X className={cn('text-white', iconSizeClasses[size])} />
        )}

        {/* Regular Icon */}
        {!loading && !success && !error && Icon && iconPosition === 'left' && (
          <Icon className={iconSizeClasses[size]} />
        )}

        {/* Button Text */}
        {!loading && !success && !error && children}

        {/* Regular Icon Right */}
        {!loading && !success && !error && Icon && iconPosition === 'right' && (
          <Icon className={iconSizeClasses[size]} />
        )}
      </span>

      {/* Shimmer effect for primary variant */}
      {variant === 'primary' && !isDisabled && (
        <div className="absolute inset-0 -top-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 hover:animate-shimmer transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Success/Error overlay */}
      {(success || error) && (
        <div className="absolute inset-0 bg-current opacity-10 animate-fade-in" />
      )}
    </button>
  );
};

export default EnhancedButton;
