import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CompactModeToggleProps {
  isCompact: boolean;
  onToggle: (compact: boolean) => void;
  className?: string;
}

const CompactModeToggle: React.FC<CompactModeToggleProps> = ({
  isCompact,
  onToggle,
  className
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(!isCompact)}
            className={className}
          >
            {isCompact ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCompact ? 'Modo Expandido' : 'Modo Compacto'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CompactModeToggle;

