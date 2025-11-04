import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import Tooltip from '../ui/tooltip';
import { cn } from '../../lib/utils';

export type ZoomLevel = 'compact' | 'normal' | 'spacious';

interface ZoomControlsProps {
  currentZoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  className?: string;
}

const ZOOM_CONFIG = {
  compact: {
    label: 'Compacto',
    factor: 0.8,
    icon: '📉',
  },
  normal: {
    label: 'Normal',
    factor: 1.0,
    icon: '📊',
  },
  spacious: {
    label: 'Espaçoso',
    factor: 1.2,
    icon: '📈',
  },
};

const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoom,
  onZoomChange,
  className,
}) => {
  const handleZoomOut = () => {
    if (currentZoom === 'spacious') onZoomChange('normal');
    else if (currentZoom === 'normal') onZoomChange('compact');
  };

  const handleZoomIn = () => {
    if (currentZoom === 'compact') onZoomChange('normal');
    else if (currentZoom === 'normal') onZoomChange('spacious');
  };

  const handleReset = () => {
    onZoomChange('normal');
  };

  const canZoomOut = currentZoom !== 'compact';
  const canZoomIn = currentZoom !== 'spacious';

  return (
    <div className={cn("flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1", className)}>
      {/* Zoom Out */}
      <Tooltip content="Mais compacto (Ctrl/Cmd + -)">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={!canZoomOut}
          className={cn(
            "h-7 w-7 p-0 hover:bg-slate-100",
            !canZoomOut && "opacity-40 cursor-not-allowed"
          )}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </Tooltip>

      {/* Current Zoom Indicator */}
      <div className="flex items-center gap-1 px-2 min-w-[100px] justify-center">
        <span className="text-base">{ZOOM_CONFIG[currentZoom].icon}</span>
        <span className="text-xs font-medium text-slate-700">
          {ZOOM_CONFIG[currentZoom].label}
        </span>
      </div>

      {/* Zoom In */}
      <Tooltip content="Mais espaçoso (Ctrl/Cmd + +)">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={!canZoomIn}
          className={cn(
            "h-7 w-7 p-0 hover:bg-slate-100",
            !canZoomIn && "opacity-40 cursor-not-allowed"
          )}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </Tooltip>

      {/* Separator */}
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Reset to Normal */}
      <Tooltip content="Restaurar padrão">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={currentZoom === 'normal'}
          className={cn(
            "h-7 w-7 p-0 hover:bg-slate-100",
            currentZoom === 'normal' && "opacity-40 cursor-not-allowed"
          )}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default ZoomControls;
export { ZOOM_CONFIG };


