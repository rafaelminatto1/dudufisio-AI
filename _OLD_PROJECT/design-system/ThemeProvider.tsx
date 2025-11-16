import React, { createContext, useContext, useEffect, useState } from 'react';
import { designTokens } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: keyof typeof designTokens.colors;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontSize: 'sm' | 'base' | 'lg';
}

interface ThemeContextType {
  theme: ThemeConfig;
  isDark: boolean;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'system',
  primaryColor: 'primary',
  borderRadius: 'md',
  fontSize: 'base',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    // Load theme from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dudufisio-theme');
      if (saved) {
        try {
          return { ...defaultTheme, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Failed to parse saved theme:', error);
        }
      }
    }
    return defaultTheme;
  });

  const [isDark, setIsDark] = useState(false);

  // Determine if dark mode should be active
  useEffect(() => {
    const updateDarkMode = () => {
      if (theme.mode === 'dark') {
        setIsDark(true);
      } else if (theme.mode === 'light') {
        setIsDark(false);
      } else {
        // System preference
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    updateDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') {
        updateDarkMode();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = designTokens.colors[theme.primaryColor];

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(isDark ? 'dark' : 'light');

    // Apply CSS custom properties
    const cssVars = {
      // Primary colors
      '--color-primary-50': (primaryColor as any)[50],
      '--color-primary-100': (primaryColor as any)[100],
      '--color-primary-200': (primaryColor as any)[200],
      '--color-primary-300': (primaryColor as any)[300],
      '--color-primary-400': (primaryColor as any)[400],
      '--color-primary-500': (primaryColor as any)[500],
      '--color-primary-600': (primaryColor as any)[600],
      '--color-primary-700': (primaryColor as any)[700],
      '--color-primary-800': (primaryColor as any)[800],
      '--color-primary-900': (primaryColor as any)[900],
      '--color-primary-950': (primaryColor as any)[950],

      // Semantic colors
      '--color-background': isDark ? (designTokens.colors.neutral as any)[900] : (designTokens.colors.neutral as any)[0],
      '--color-foreground': isDark ? (designTokens.colors.neutral as any)[50] : (designTokens.colors.neutral as any)[900],
      '--color-muted': isDark ? (designTokens.colors.neutral as any)[800] : (designTokens.colors.neutral as any)[100],
      '--color-muted-foreground': isDark ? (designTokens.colors.neutral as any)[400] : (designTokens.colors.neutral as any)[600],
      '--color-card': isDark ? (designTokens.colors.neutral as any)[800] : (designTokens.colors.neutral as any)[0],
      '--color-card-foreground': isDark ? (designTokens.colors.neutral as any)[50] : (designTokens.colors.neutral as any)[900],
      '--color-border': isDark ? (designTokens.colors.neutral as any)[700] : (designTokens.colors.neutral as any)[200],
      '--color-input': isDark ? (designTokens.colors.neutral as any)[700] : (designTokens.colors.neutral as any)[200],

      // Border radius
      '--border-radius': (designTokens.borderRadius as any)[theme.borderRadius],

      // Font size adjustments
      '--font-size-multiplier': theme.fontSize === 'sm' ? '0.875' : theme.fontSize === 'lg' ? '1.125' : '1',
    };

    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Save theme to localStorage
    localStorage.setItem('dudufisio-theme', JSON.stringify(theme));
  }, [theme, isDark]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('dudufisio-theme');
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    updateTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme configuration component
export const ThemeCustomizer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, updateTheme, resetTheme } = useTheme();

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-3">Personalizar Tema</h3>

        {/* Theme Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Modo</label>
          <div className="flex space-x-2">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateTheme({ mode })}
                className={`px-3 py-1 text-sm rounded-md border ${
                  theme.mode === mode
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Escuro' : 'Sistema'}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cor Principal</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(designTokens.colors).filter(key =>
              !['neutral', 'semantic'].includes(key)
            ).map((colorKey) => {
              const color = designTokens.colors[colorKey as keyof typeof designTokens.colors];
              return (
                <button
                  key={colorKey}
                  onClick={() => updateTheme({ primaryColor: colorKey as any })}
                  className={`w-10 h-10 rounded-md border-2 ${
                    theme.primaryColor === colorKey ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: (color as any)[500] }}
                  title={colorKey}
                />
              );
            })}
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bordas</label>
          <div className="flex space-x-2">
            {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
              <button
                key={radius}
                onClick={() => updateTheme({ borderRadius: radius })}
                className={`px-3 py-1 text-sm border ${
                  theme.borderRadius === radius
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-background border-border hover:bg-muted'
                }`}
                style={{ borderRadius: designTokens.borderRadius[radius] }}
              >
                {radius === 'none' ? 'Nenhuma' : radius.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tamanho da Fonte</label>
          <div className="flex space-x-2">
            {(['sm', 'base', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateTheme({ fontSize: size })}
                className={`px-3 py-1 text-sm rounded-md border ${
                  theme.fontSize === size
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {size === 'sm' ? 'Pequena' : size === 'base' ? 'Normal' : 'Grande'}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetTheme}
          className="w-full mt-4 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
        >
          Restaurar Padrão
        </button>
      </div>
    </div>
  );
};