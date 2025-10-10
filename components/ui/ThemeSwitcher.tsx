import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ThemeSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  size = 'md',
  showLabel = false,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check for system preference and saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(shouldBeDark);
    setMounted(true);
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (!mounted) {
    // Return skeleton to prevent hydration mismatch
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse', sizeClasses[size])} />
        {showLabel && (
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
          sizeClasses[size]
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20 dark:opacity-30" />
        
        {/* Icons */}
        <div className="relative flex items-center justify-between w-full px-1">
          <motion.div
            className={cn('text-yellow-500', iconSizeClasses[size])}
            initial={false}
            animate={{
              opacity: isDark ? 0.3 : 1,
              scale: isDark ? 0.8 : 1,
            }}
            transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Sun />
          </motion.div>
          
          <motion.div
            className={cn('text-blue-400', iconSizeClasses[size])}
            initial={false}
            animate={{
              opacity: isDark ? 1 : 0.3,
              scale: isDark ? 1 : 0.8,
            }}
            transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Moon />
          </motion.div>
        </div>

        {/* Animated thumb */}
        <motion.div
          className={cn(
            'absolute top-0.5 bg-white dark:bg-gray-900 rounded-full shadow-lg border-2 border-gray-300 dark:border-gray-600',
            'flex items-center justify-center',
            thumbSizeClasses[size]
          )}
          initial={false}
          animate={{
            x: isDark ? (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Icon morphing */}
          <motion.div
            className="overflow-hidden"
            initial={false}
            animate={{
              rotate: isDark ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <Moon className={cn('text-blue-600', iconSizeClasses[size])} />
            ) : (
              <Sun className={cn('text-yellow-600', iconSizeClasses[size])} />
            )}
          </motion.div>
        </motion.div>
      </button>

      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};

export default ThemeSwitcher;
