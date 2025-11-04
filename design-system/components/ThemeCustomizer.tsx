import React, { useState, useEffect } from 'react';
import { useTheme, ThemeConfig } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader } from './layout/Card';
import { Button } from './inputs/Button';
import { Input } from './inputs/Input';
import { Select } from './inputs/Select';

interface ThemeCustomizerProps {
  className?: string;
}

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

const colorPresets: ColorPreset[] = [
  {
    name: 'Modern Blue',
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  {
    name: 'Elegant Purple',
    primary: '#8b5cf6',
    secondary: '#a855f7',
    accent: '#ec4899',
    success: '#22c55e',
    warning: '#f97316',
    error: '#dc2626',
  },
  {
    name: 'Professional Green',
    primary: '#059669',
    secondary: '#0d9488',
    accent: '#06b6d4',
    success: '#16a34a',
    warning: '#ea580c',
    error: '#dc2626',
  },
  {
    name: 'Warm Orange',
    primary: '#ea580c',
    secondary: '#f97316',
    accent: '#f59e0b',
    success: '#22c55e',
    warning: '#eab308',
    error: '#dc2626',
  },
];

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Professional)' },
];

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ className = '' }) => {
  const { theme, themeConfig, updateTheme } = useTheme();
  const [activePreset, setActivePreset] = useState<string>('Modern Blue');
  const [customColors, setCustomColors] = useState({
    primary: themeConfig.colors.primary,
    secondary: themeConfig.colors.secondary,
    accent: themeConfig.colors.accent,
    success: themeConfig.colors.success,
    warning: themeConfig.colors.warning,
    error: themeConfig.colors.error,
  });
  const [typography, setTypography] = useState({
    fontFamily: themeConfig.typography.fontFamily.primary,
    fontSize: themeConfig.typography.fontSize.base,
    lineHeight: themeConfig.typography.lineHeight.normal,
  });

  useEffect(() => {
    // Update custom colors when theme changes
    setCustomColors({
      primary: themeConfig.colors.primary,
      secondary: themeConfig.colors.secondary,
      accent: themeConfig.colors.accent,
      success: themeConfig.colors.success,
      warning: themeConfig.colors.warning,
      error: themeConfig.colors.error,
    });
  }, [themeConfig]);

  const handleColorChange = (colorName: string, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorName]: value }));
    
    // Update theme in real-time
    const newThemeConfig: Partial<ThemeConfig> = {
      colors: {
        ...themeConfig.colors,
        [colorName]: value,
      },
    };
    
    updateTheme(newThemeConfig);
  };

  const handlePresetChange = (presetName: string) => {
    const preset = colorPresets.find(p => p.name === presetName);
    if (preset) {
      setActivePreset(presetName);
      setCustomColors({
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        success: preset.success,
        warning: preset.warning,
        error: preset.error,
      });
      
      updateTheme({
        colors: {
          primary: preset.primary,
          secondary: preset.secondary,
          accent: preset.accent,
          success: preset.success,
          warning: preset.warning,
          error: preset.error,
        },
      });
    }
  };

  const handleTypographyChange = (property: string, value: string) => {
    setTypography(prev => ({ ...prev, [property]: value }));
    
    const newThemeConfig: Partial<ThemeConfig> = {
      typography: {
        ...themeConfig.typography,
        [property === 'fontFamily' ? 'fontFamily' : property]: 
          property === 'fontFamily' ? { ...themeConfig.typography.fontFamily, primary: value } : value,
      },
    };
    
    updateTheme(newThemeConfig);
  };

  const resetToDefault = () => {
    const defaultPreset = colorPresets[0];
    setActivePreset(defaultPreset.name);
    setCustomColors({
      primary: defaultPreset.primary,
      secondary: defaultPreset.secondary,
      accent: defaultPreset.accent,
      success: defaultPreset.success,
      warning: defaultPreset.warning,
      error: defaultPreset.error,
    });
    
    setTypography({
      fontFamily: 'Inter',
      fontSize: '16px',
      lineHeight: '1.5',
    });
    
    updateTheme({
      colors: {
        primary: defaultPreset.primary,
        secondary: defaultPreset.secondary,
        accent: defaultPreset.accent,
        success: defaultPreset.success,
        warning: defaultPreset.warning,
        error: defaultPreset.error,
      },
      typography: {
        ...themeConfig.typography,
        fontFamily: { ...themeConfig.typography.fontFamily, primary: 'Inter' },
        fontSize: { ...themeConfig.typography.fontSize, base: '16px' },
        lineHeight: { ...themeConfig.typography.lineHeight, normal: '1.5' },
      },
    });
  };

  const exportTheme = () => {
    const themeData = {
      colors: customColors,
      typography,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personalizador de Temas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Personalize cores, tipografia e estilos em tempo real
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              Resetar
            </Button>
            <Button variant="primary" size="sm" onClick={exportTheme}>
              Exportar Tema
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Color Presets */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Paletas de Cores Prontas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetChange(preset.name)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  activePreset === preset.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex space-x-1 mb-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Cores Personalizadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(customColors).map(([colorName, colorValue]) => (
              <div key={colorName}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {colorName}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={colorValue}
                    onChange={(e) => handleColorChange(colorName, e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colorValue}
                    onChange={(e) => handleColorChange(colorName, e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Tipografia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fonte Principal
              </label>
              <Select
                options={fontOptions}
                value={typography.fontFamily}
                onChange={(value) => handleTypographyChange('fontFamily', value)}
                placeholder="Selecione uma fonte"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamanho Base
              </label>
              <Input
                type="number"
                value={parseInt(typography.fontSize)}
                onChange={(e) => handleTypographyChange('fontSize', `${e.target.value}px`)}
                min="12"
                max="24"
                placeholder="16"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Altura da Linha
              </label>
              <Input
                type="number"
                step="0.1"
                value={parseFloat(typography.lineHeight)}
                onChange={(e) => handleTypographyChange('lineHeight', e.target.value)}
                min="1"
                max="2"
                placeholder="1.5"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Visualização
          </h3>
          <Card variant="outlined" className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold" style={{ color: customColors.primary }}>
                  Título Principal
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Este é um exemplo de texto com as cores personalizadas do seu tema.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="primary" style={{ backgroundColor: customColors.primary }}>
                  Botão Primário
                </Button>
                <Button variant="secondary" style={{ backgroundColor: customColors.secondary }}>
                  Botão Secundário
                </Button>
                <Button variant="accent" style={{ backgroundColor: customColors.accent }}>
                  Botão de Destaque
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg text-white text-center" style={{ backgroundColor: customColors.success }}>
                  Sucesso
                </div>
                <div className="p-4 rounded-lg text-white text-center" style={{ backgroundColor: customColors.warning }}>
                  Aviso
                </div>
                <div className="p-4 rounded-lg text-white text-center" style={{ backgroundColor: customColors.error }}>
                  Erro
                </div>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeCustomizer;