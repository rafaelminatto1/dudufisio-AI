import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  reasons?: string[];
  showTooltip?: boolean;
}

const riskConfig = {
  high: {
    label: 'Alto Risco',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
    iconClassName: 'text-red-600',
  },
  medium: {
    label: 'Risco Médio',
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200',
    iconClassName: 'text-amber-600',
  },
  low: {
    label: 'Baixo Risco',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
    iconClassName: 'text-green-600',
  },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, reasons = [], showTooltip = true }) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  const badge = (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1 px-2 py-1`}>
      <Icon className={`w-3 h-3 ${config.iconClassName}`} />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );

  if (!showTooltip || reasons.length === 0) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">Critérios de risco:</p>
            <ul className="text-xs space-y-0.5">
              {reasons.map((reason, idx) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

