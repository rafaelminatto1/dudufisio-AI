import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/layout/Card';

interface ColorSwatchProps {
  name: string;
  color: string;
  hex: string;
  rgb: string;
  hsl: string;
  description?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ 
  name, 
  color, 
  hex, 
  rgb, 
  hsl, 
  description 
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="group relative">
      <div 
        className="w-full h-20 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => copyToClipboard(hex)}
      />
      <div className="mt-3 space-y-1">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{name}</h4>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        )}
        <div className="space-y-1">
          <button
            onClick={() => copyToClipboard(hex)}
            className="block w-full text-left text-xs font-mono text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {hex}
          </button>
          <button
            onClick={() => copyToClipboard(rgb)}
            className="block w-full text-left text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {rgb}
          </button>
          <button
            onClick={() => copyToClipboard(hsl)}
            className="block w-full text-left text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {hsl}
          </button>
        </div>
      </div>
      {copied && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-lg">
          Copiado!
        </div>
      )}
    </div>
  );
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return 'rgb(0, 0, 0)';
};

const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }
  return 'hsl(0, 0%, 0%)';
};

export const ColorPalette: React.FC = () => {
  const { themeConfig } = useTheme();

  const primaryColors = [
    { name: 'Primary', color: themeConfig.colors.primary, description: 'Cor principal da marca' },
    { name: 'Primary Light', color: themeConfig.colors.primaryLight, description: 'Variação clara' },
    { name: 'Primary Dark', color: themeConfig.colors.primaryDark, description: 'Variação escura' },
  ];

  const secondaryColors = [
    { name: 'Secondary', color: themeConfig.colors.secondary, description: 'Cor secundária' },
    { name: 'Secondary Light', color: themeConfig.colors.secondaryLight, description: 'Variação clara' },
    { name: 'Secondary Dark', color: themeConfig.colors.secondaryDark, description: 'Variação escura' },
  ];

  const accentColors = [
    { name: 'Accent', color: themeConfig.colors.accent, description: 'Cor de destaque' },
    { name: 'Accent Light', color: themeConfig.colors.accentLight, description: 'Variação clara' },
    { name: 'Accent Dark', color: themeConfig.colors.accentDark, description: 'Variação escura' },
  ];

  const stateColors = [
    { name: 'Success', color: themeConfig.colors.success, description: 'Estado de sucesso' },
    { name: 'Warning', color: themeConfig.colors.warning, description: 'Estado de aviso' },
    { name: 'Error', color: themeConfig.colors.error, description: 'Estado de erro' },
  ];

  const backgroundColors = [
    { name: 'Background', color: themeConfig.colors.background, description: 'Fundo principal' },
    { name: 'Background Secondary', color: themeConfig.colors.backgroundSecondary, description: 'Fundo secundário' },
    { name: 'Surface', color: themeConfig.colors.surface, description: 'Superfície elevada' },
  ];

  const textColors = [
    { name: 'Text Primary', color: themeConfig.colors.textPrimary, description: 'Texto principal' },
    { name: 'Text Secondary', color: themeConfig.colors.textSecondary, description: 'Texto secundário' },
    { name: 'Text Tertiary', color: themeConfig.colors.textTertiary, description: 'Texto terciário' },
  ];

  const colorSections = [
    { title: 'Cores Primárias', colors: primaryColors },
    { title: 'Cores Secundárias', colors: secondaryColors },
    { title: 'Cores de Destaque', colors: accentColors },
    { title: 'Estados', colors: stateColors },
    { title: 'Backgrounds', colors: backgroundColors },
    { title: 'Textos', colors: textColors },
  ];

  return (
    <div className="space-y-12">
      {/* Cabeçalho Premium */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Paleta de Cores
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Paleta de cores profissionais e harmoniosas que transmitem elegância e confiança
        </p>
      </div>

      {/* Seções de Cores */}
      {colorSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.colors.map((color, colorIndex) => (
              <ColorSwatch
                key={colorIndex}
                name={color.name}
                color={color.color}
                hex={color.color}
                rgb={hexToRgb(color.color)}
                hsl={hexToHsl(color.color)}
                description={color.description}
              />
            ))}
          </div>
        </Card>
      ))}

      {/* Gradientes Premium */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Gradientes Especiais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div 
              className="h-32 rounded-xl shadow-lg"
              style={{ background: themeConfig.gradients.primary }}
            />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Gradiente Primário
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gradiente principal para elementos de destaque
            </p>
          </div>
          <div className="space-y-3">
            <div 
              className="h-32 rounded-xl shadow-lg"
              style={{ background: themeConfig.gradients.hero }}
            />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Gradiente Hero
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gradiente para seções hero e headers
            </p>
          </div>
          <div className="space-y-3">
            <div 
              className="h-32 rounded-xl shadow-lg"
              style={{ background: themeConfig.gradients.subtle }}
            />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Gradiente Sutil
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gradiente sutil para backgrounds
            </p>
          </div>
          <div className="space-y-3">
            <div 
              className="h-32 rounded-xl shadow-lg"
              style={{ background: themeConfig.gradients.accent }}
            />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Gradiente de Destaque
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gradiente para elementos de destaque especial
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ColorPalette;