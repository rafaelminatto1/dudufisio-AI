import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Insight } from '../../types/analytics';
import { Brain, AlertTriangle, TrendingUp, Lightbulb, CheckCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InsightsFeedProps {
  insights: Insight[];
  onMarkAsRead?: (insightId: string) => void;
  onDismiss?: (insightId: string) => void;
  className?: string;
}

const InsightsFeed: React.FC<InsightsFeedProps> = ({
  insights,
  onMarkAsRead,
  onDismiss,
  className
}) => {
  // Garantir que temos um array válido
  const safeInsights = Array.isArray(insights) ? insights : [];
  
  const [filter, setFilter] = useState<Insight['category'] | 'all'>('all');

  const filteredInsights = filter === 'all'
    ? safeInsights
    : safeInsights.filter(i => i.category === filter);

  const unreadCount = safeInsights.filter(i => !i.isRead).length;

  const getSeverityIcon = (severity: Insight['severity']) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: Insight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950 border-red-500';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 border-yellow-500';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-950 border-green-500';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 border-blue-500';
    }
  };

  const getCategoryIcon = (category: Insight['category']) => {
    switch (category) {
      case 'pattern':
        return '🔍';
      case 'anomaly':
        return '⚡';
      case 'trend':
        return '📈';
      case 'opportunity':
        return '💡';
      case 'risk':
        return '⚠️';
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg">Feed de Insights</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} novos</Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pattern">Padrões</TabsTrigger>
          <TabsTrigger value="anomaly">Anomalias</TabsTrigger>
          <TabsTrigger value="trend">Tendências</TabsTrigger>
          <TabsTrigger value="opportunity">Oportunidades</TabsTrigger>
          <TabsTrigger value="risk">Riscos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {filteredInsights.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum insight nesta categoria</p>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "p-4 border-l-4 transition-all cursor-pointer",
                      getSeverityColor(insight.severity),
                      !insight.isRead && "shadow-md"
                    )}
                    onClick={() => onMarkAsRead?.(insight.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Icon */}
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.severity === 'critical' && "bg-red-100 dark:bg-red-900",
                          insight.severity === 'warning' && "bg-yellow-100 dark:bg-yellow-900",
                          insight.severity === 'success' && "bg-green-100 dark:bg-green-900",
                          insight.severity === 'info' && "bg-blue-100 dark:bg-blue-900"
                        )}>
                          {getSeverityIcon(insight.severity)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{insight.title}</h4>
                            {!insight.isRead && (
                              <motion.div
                                className="w-2 h-2 rounded-full bg-blue-600"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="gap-1">
                              <span>{getCategoryIcon(insight.category)}</span>
                              <span className="capitalize">{insight.category}</span>
                            </Badge>

                            {insight.data.changePercent !== undefined && (
                              <Badge className={cn(
                                "gap-1",
                                insight.data.changePercent > 0 && "bg-green-100 text-green-800",
                                insight.data.changePercent < 0 && "bg-red-100 text-red-800"
                              )}>
                                {insight.data.changePercent > 0 && <TrendingUp className="w-3 h-3" />}
                                {insight.data.changePercent > 0 ? '+' : ''}
                                {insight.data.changePercent.toFixed(1)}%
                              </Badge>
                            )}

                            <span className="text-xs text-muted-foreground">
                              {format(insight.createdAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {onDismiss && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(insight.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default InsightsFeed;

