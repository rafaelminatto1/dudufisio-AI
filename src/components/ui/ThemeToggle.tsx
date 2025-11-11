/**
 * > THEME TOGGLE - DUDUFISIO-AI
 *
 * Toggle button for switching between light and dark modes.
 * Designed for sidebar integration with simple styling.
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
      aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
