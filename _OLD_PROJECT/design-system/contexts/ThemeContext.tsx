import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definições de tema baseadas no design system
export interface ThemeConfig {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    success: string;
    successLight: string;
    successDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    error: string;
    errorLight: string;
    errorDark: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceSecondary: string;
    surfaceElevated: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    textDisabled: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    subtle: string;
    hero: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
      '6xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
      loose: string;
    };
  };
  spacing: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
  };
  transitions: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
      slower: string;
    };
    easing: {
      linear: string;
      in: string;
      out: string;
      inOut: string;
      bounce: string;
    };
  };
}

// Tema claro padrão
const lightTheme: ThemeConfig = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    secondaryLight: '#94a3b8',
    secondaryDark: '#475569',
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    accentDark: '#0284c7',
    success: '#10b981',
    successLight: '#34d399',
    successDark: '#059669',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#f1f5f9',
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    surfaceElevated: '#ffffff',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    textDisabled: '#cbd5e1',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    secondary: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    accent: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    subtle: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    hero: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Playfair Display', Georgia, 'Times New Roman', serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: '0 0 #0000',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

// Tema escuro
const darkTheme: ThemeConfig = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    surfaceElevated: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#1e293b',
    textDisabled: '#475569',
  },
  gradients: {
    ...lightTheme.gradients,
    subtle: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    hero: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
  },
};

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      return savedTheme || defaultTheme;
    }
    return defaultTheme;
  });

  const isDark = theme === 'dark';
  const themeConfig = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar tema ao HTML
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Aplicar CSS variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.gradients).forEach(([key, value]) => {
      const cssVar = `--gradient-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.typography.fontFamily).forEach(([key, value]) => {
      const cssVar = `--font-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.typography.fontSize).forEach(([key, value]) => {
      const cssVar = `--font-size-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.typography.fontWeight).forEach(([key, value]) => {
      const cssVar = `--font-weight-${key}`;
      root.style.setProperty(cssVar, value.toString());
    });

    Object.entries(themeConfig.typography.lineHeight).forEach(([key, value]) => {
      const cssVar = `--line-height-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      const cssVar = `--spacing-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      const cssVar = `--radius-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      const cssVar = `--shadow-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.transitions.duration).forEach(([key, value]) => {
      const cssVar = `--transition-duration-${key}`;
      root.style.setProperty(cssVar, value);
    });

    Object.entries(themeConfig.transitions.easing).forEach(([key, value]) => {
      const cssVar = `--transition-easing-${key}`;
      root.style.setProperty(cssVar, value);
    });
  }, [theme, themeConfig]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    themeConfig,
    toggleTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;