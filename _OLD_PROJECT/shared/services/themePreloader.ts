/**
 * Theme Preloader
 * Carrega o tema antes do render para evitar flash de conteúdo
 */

import { getSettings } from './indexedDB';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'fisioflow-theme';

export async function preloadTheme(): Promise<void> {
  try {
    // Tentar ler do IndexedDB primeiro (mais confiável)
    const stored = await getSettings(THEME_STORAGE_KEY);
    const theme = (stored?.value as Theme) || 'system';

    applyTheme(theme);
  } catch (error) {
    // Fallback para localStorage se IndexedDB falhar
    const theme = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'system';
    applyTheme(theme);
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Remove classes anteriores
  root.classList.remove('light', 'dark');

  let effectiveTheme: 'light' | 'dark' = 'light';

  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } else {
    effectiveTheme = theme;
  }

  // Aplicar classe sem transição inicial (evita flash)
  root.classList.add('no-theme-transition');
  root.classList.add(effectiveTheme);

  // Remover a classe no-transition após aplicar
  requestAnimationFrame(() => {
    root.classList.remove('no-theme-transition');
  });

  // Aplicar CSS variables para cores do tema
  applyThemeVariables(effectiveTheme);
}

function applyThemeVariables(theme: 'light' | 'dark'): void {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.style.setProperty('--background', '222.2 84% 4.9%');
    root.style.setProperty('--foreground', '210 40% 98%');
    root.style.setProperty('--card', '222.2 84% 4.9%');
    root.style.setProperty('--card-foreground', '210 40% 98%');
    root.style.setProperty('--popover', '222.2 84% 4.9%');
    root.style.setProperty('--popover-foreground', '210 40% 98%');
    root.style.setProperty('--primary', '217.2 91.2% 59.8%');
    root.style.setProperty('--primary-foreground', '222.2 47.4% 11.2%');
    root.style.setProperty('--secondary', '217.2 32.6% 17.5%');
    root.style.setProperty('--secondary-foreground', '210 40% 98%');
    root.style.setProperty('--muted', '217.2 32.6% 17.5%');
    root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
    root.style.setProperty('--accent', '217.2 32.6% 17.5%');
    root.style.setProperty('--accent-foreground', '210 40% 98%');
    root.style.setProperty('--destructive', '0 62.8% 30.6%');
    root.style.setProperty('--destructive-foreground', '210 40% 98%');
    root.style.setProperty('--border', '217.2 32.6% 17.5%');
    root.style.setProperty('--input', '217.2 32.6% 17.5%');
    root.style.setProperty('--ring', '224.3 76.3% 48%');
  } else {
    root.style.setProperty('--background', '0 0% 100%');
    root.style.setProperty('--foreground', '222.2 84% 4.9%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--popover', '0 0% 100%');
    root.style.setProperty('--popover-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--primary', '221.2 83.2% 53.3%');
    root.style.setProperty('--primary-foreground', '210 40% 98%');
    root.style.setProperty('--secondary', '210 40% 96.1%');
    root.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%');
    root.style.setProperty('--muted', '210 40% 96.1%');
    root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
    root.style.setProperty('--accent', '210 40% 96.1%');
    root.style.setProperty('--accent-foreground', '222.2 47.4% 11.2%');
    root.style.setProperty('--destructive', '0 84.2% 60.2%');
    root.style.setProperty('--destructive-foreground', '210 40% 98%');
    root.style.setProperty('--border', '214.3 31.8% 91.4%');
    root.style.setProperty('--input', '214.3 31.8% 91.4%');
    root.style.setProperty('--ring', '221.2 83.2% 53.3%');
  }
}

// Injetar CSS para evitar transição no load inicial
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .no-theme-transition * {
      transition: none !important;
    }
  `;
  document.head.appendChild(style);
}

