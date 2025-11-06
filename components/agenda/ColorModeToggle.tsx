import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ColorDisplayMode } from '../../types';
import { Palette, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ColorModeToggleProps {
  value?: ColorDisplayMode;
  onChange: (mode: ColorDisplayMode) => void;
  className?: string;
}

const COLOR_MODE_OPTIONS = [
  {
    value: 'hybrid' as ColorDisplayMode,
    label: 'Híbrido',
    description: 'Borda por terapeuta + Fundo por status',
    icon: '🎨'
  },
  {
    value: 'therapist' as ColorDisplayMode,
    label: 'Por Terapeuta',
    description: 'Cores baseadas no terapeuta',
    icon: '👤'
  },
  {
    value: 'status' as ColorDisplayMode,
    label: 'Por Status',
    description: 'Cores baseadas no status da consulta',
    icon: '📊'
  }
];

const STORAGE_KEY = 'agenda-color-mode';

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  value,
  onChange,
  className
}) => {
  const [currentMode, setCurrentMode] = useState<ColorDisplayMode>(() => {
    // Tentar carregar do localStorage
    if (value) return value;
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ColorDisplayMode) || 'hybrid';
  });

  useEffect(() => {
    if (value !== undefined) {
      setCurrentMode(value);
    }
  }, [value]);

  const handleModeChange = (mode: ColorDisplayMode) => {
    setCurrentMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    onChange(mode);
  };

  const currentOption = COLOR_MODE_OPTIONS.find(opt => opt.value === currentMode) || COLOR_MODE_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">{currentOption.icon} {currentOption.label}</span>
          <span className="sm:hidden">{currentOption.icon}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-1.5 text-sm font-semibold text-slate-700">
          Modo de Visualização
        </div>
        {COLOR_MODE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleModeChange(option.value)}
            className={cn(
              "flex items-start gap-3 py-3 cursor-pointer",
              currentMode === option.value && "bg-blue-50"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {currentMode === option.value && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
              {currentMode !== option.value && (
                <div className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base">{option.icon}</span>
                <span className="font-medium text-slate-900">{option.label}</span>
                {currentMode === option.value && (
                  <Badge variant="default" className="ml-auto text-xs">
                    Ativo
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {option.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <div className="px-2 py-2 border-t border-slate-200 mt-1">
          <p className="text-xs text-slate-500">
            💡 Sua preferência será salva automaticamente
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Hook para usar o modo de cor salvo
export const useColorMode = (): [ColorDisplayMode, (mode: ColorDisplayMode) => void] => {
  const [colorMode, setColorMode] = useState<ColorDisplayMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ColorDisplayMode) || 'hybrid';
  });

  const updateColorMode = (mode: ColorDisplayMode) => {
    setColorMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return [colorMode, updateColorMode];
};

export default ColorModeToggle;

