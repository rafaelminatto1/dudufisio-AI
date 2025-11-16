import { useEffect, useState, useCallback } from 'react';
import { setSettings, getSettings } from '../lib/indexedDB';
import { applyTheme } from '../lib/themePreloader';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'fisioflow-theme';
const AUTO_SWITCH_KEY = 'fisioflow-theme-auto-switch';
const CUSTOM_COLORS_KEY = 'fisioflow-theme-custom-colors';

export interface ThemeSchedule {
  enabled: boolean;
  darkStart: string; // HH:MM format
  darkEnd: string;   // HH:MM format
}

export interface CustomThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Fallback para localStorage durante carregamento inicial
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [autoSwitch, setAutoSwitchState] = useState<ThemeSchedule>({
    enabled: false,
    darkStart: '18:00',
    darkEnd: '06:00'
  });
  const [customColors, setCustomColorsState] = useState<CustomThemeColors>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Load theme from IndexedDB on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await getSettings(THEME_STORAGE_KEY);
        if (stored?.value) {
          setThemeState(stored.value as Theme);
        }

        const autoSwitchStored = await getSettings(AUTO_SWITCH_KEY);
        if (autoSwitchStored?.value) {
          setAutoSwitchState(autoSwitchStored.value);
        }

        const colorsStored = await getSettings(CUSTOM_COLORS_KEY);
        if (colorsStored?.value) {
          setCustomColorsState(colorsStored.value);
        }
      } catch (error) {
        console.warn('Failed to load theme from IndexedDB, using localStorage fallback');
      }
    };

    loadTheme();
  }, []);

  // Apply theme with animation
  const applyThemeWithAnimation = useCallback((newTheme: 'light' | 'dark') => {
    setIsAnimating(true);
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    setResolvedTheme(newTheme);

    // Apply custom colors if any
    if (customColors.primary) {
      root.style.setProperty('--primary', customColors.primary);
    }
    if (customColors.secondary) {
      root.style.setProperty('--secondary', customColors.secondary);
    }
    if (customColors.accent) {
      root.style.setProperty('--accent', customColors.accent);
    }

    setTimeout(() => setIsAnimating(false), 300);
  }, [customColors]);

  // Check if current time is within dark mode schedule
  const shouldUseDarkMode = useCallback((): boolean => {
    if (!autoSwitch.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = autoSwitch.darkStart.split(':').map(Number);
    const [endHour, endMin] = autoSwitch.darkEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight schedules (e.g., 18:00 to 06:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }

    return currentTime >= startTime && currentTime < endTime;
  }, [autoSwitch]);

  // Apply theme based on user preference and auto-switch
  useEffect(() => {
    let effectiveTheme: 'light' | 'dark' = 'light';

    if (autoSwitch.enabled && theme === 'system') {
      effectiveTheme = shouldUseDarkMode() ? 'dark' : 'light';
    } else if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    applyThemeWithAnimation(effectiveTheme);

    // Save to both IndexedDB and localStorage
    setSettings(THEME_STORAGE_KEY, theme).catch(() => {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    });
  }, [theme, autoSwitch, shouldUseDarkMode, applyThemeWithAnimation]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system' || autoSwitch.enabled) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      applyThemeWithAnimation(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, autoSwitch.enabled, applyThemeWithAnimation]);

  // Auto-switch check interval
  useEffect(() => {
    if (!autoSwitch.enabled || theme !== 'system') return;

    const interval = setInterval(() => {
      const newTheme = shouldUseDarkMode() ? 'dark' : 'light';
      if (newTheme !== resolvedTheme) {
        applyThemeWithAnimation(newTheme);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoSwitch, theme, resolvedTheme, shouldUseDarkMode, applyThemeWithAnimation]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const setAutoSwitch = useCallback((schedule: ThemeSchedule) => {
    setAutoSwitchState(schedule);
    setSettings(AUTO_SWITCH_KEY, schedule).catch(() => {
      localStorage.setItem(AUTO_SWITCH_KEY, JSON.stringify(schedule));
    });
  }, []);

  const setCustomColors = useCallback((colors: CustomThemeColors) => {
    setCustomColorsState(colors);
    setSettings(CUSTOM_COLORS_KEY, colors).catch(() => {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
    });
    
    // Apply immediately
    const root = window.document.documentElement;
    if (colors.primary) root.style.setProperty('--primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
    if (colors.accent) root.style.setProperty('--accent', colors.accent);
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    autoSwitch,
    setAutoSwitch,
    customColors,
    setCustomColors,
    isAnimating
  };
};

