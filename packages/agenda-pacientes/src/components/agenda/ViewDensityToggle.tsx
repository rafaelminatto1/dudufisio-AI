import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Maximize2, Minimize2 } from 'lucide-react';
import Tooltip from '../ui/tooltip';

export type ViewDensity = 'comfortable' | 'compact';

interface ViewDensityToggleProps {
  density: ViewDensity;
  onDensityChange: (density: ViewDensity) => void;
  className?: string;
}

/**
 * Toggle para alternar entre modo de visualização confortável e compacto
 * 
 * - Comfortable: Espaçamento generoso, melhor para telas grandes
 * - Compact: Visualização densa, ideal para ver mais informações
 */
export function ViewDensityToggle({
  density,
  onDensityChange,
  className,
}: ViewDensityToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={density}
      onValueChange={(value) => {
        if (value) onDensityChange(value as ViewDensity);
      }}
      className={className}
    >
      <Tooltip content="Visualização confortável" side="bottom">
        <ToggleGroupItem
          value="comfortable"
          aria-label="Visualização confortável"
          className="h-9 w-9"
        >
          <Maximize2 className="h-4 w-4" />
        </ToggleGroupItem>
      </Tooltip>

      <Tooltip content="Visualização compacta" side="bottom">
        <ToggleGroupItem
          value="compact"
          aria-label="Visualização compacta"
          className="h-9 w-9"
        >
          <Minimize2 className="h-4 w-4" />
        </ToggleGroupItem>
      </Tooltip>
    </ToggleGroup>
  );
}

export default ViewDensityToggle;

