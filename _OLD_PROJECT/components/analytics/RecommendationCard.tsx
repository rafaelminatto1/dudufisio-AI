import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Recommendation } from '../../types/analytics';
import { Lightbulb, TrendingUp, X, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply?: (recommendation: Recommendation) => void;
  onDismiss?: (recommendationId: string) => void;
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onApply,
  onDismiss,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityConfig = {
    low: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Lightbulb },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Lightbulb },
    high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Lightbulb },
    critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: Lightbulb }
  };

  const config = priorityConfig[recommendation.priority];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <Card className={cn("p-6 border-l-4", config.color.split(' ')[2])}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("p-3 rounded-lg", config.color)}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                  <Badge className="capitalize">{recommendation.priority}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{recommendation.description}</p>
              </div>

              {onDismiss && recommendation.status === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(recommendation.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Impact Metrics */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>
                  <strong>+{recommendation.impact.estimatedChange}%</strong> {recommendation.impact.metric}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>{recommendation.impact.confidence}% confiança</span>
              </div>
            </div>

            {/* Actions */}
            {recommendation.actions.length > 0 && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  {isExpanded ? 'Ocultar' : 'Ver'} {recommendation.actions.length} {recommendation.actions.length === 1 ? 'ação' : 'ações'}
                </Button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2"
                  >
                    {recommendation.actions.map((action, index) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.label}</p>
                          {action.description && (
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onApply?.(recommendation)}
                          className="gap-2"
                        >
                          Aplicar
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Footer */}
            {recommendation.status === 'applied' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Aplicada com sucesso</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RecommendationCard;

