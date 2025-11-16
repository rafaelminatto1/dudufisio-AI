import React, { useState, useMemo } from 'react';
import { Bell, X, Check, AlertTriangle, AlertCircle, Info, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertType, AlertSeverity } from '../../services/alertingService';

interface AlertCenterProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onAlertClick: (alert: Alert) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onAlertClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const filteredAlerts = useMemo(() => {
    if (selectedSeverity === 'all') return alerts;
    return alerts.filter(a => a.severity === selectedSeverity);
  }, [alerts, selectedSeverity]);

  const groupedAlerts = useMemo(() => {
    return {
      critical: filteredAlerts.filter(a => a.severity === 'critical'),
      warning: filteredAlerts.filter(a => a.severity === 'warning'),
      info: filteredAlerts.filter(a => a.severity === 'info'),
    };
  }, [filteredAlerts]);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico' },
      warning: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Atenção' },
      info: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Info' },
    };
    const config = configs[severity];
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} border-none`}>
        {config.label}
      </Badge>
    );
  };

  const handleAlertClick = (alert: Alert) => {
    if (!alert.isRead) {
      onMarkAsRead(alert.id);
    }
    onAlertClick(alert);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Alertas</span>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Central de Alertas</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Marcar todos como lidos
              </Button>
            )}
          </div>
          <SheetDescription>
            {unreadCount > 0 
              ? `Você tem ${unreadCount} alerta${unreadCount > 1 ? 's' : ''} não lido${unreadCount > 1 ? 's' : ''}`
              : 'Todos os alertas foram lidos'}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" onClick={() => setSelectedSeverity('all')}>
              Todos
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" onClick={() => setSelectedSeverity('critical')}>
              Críticos
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                {groupedAlerts.critical.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="warning" onClick={() => setSelectedSeverity('warning')}>
              Atenção
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                {groupedAlerts.warning.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="info" onClick={() => setSelectedSeverity('info')}>
              Info
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {groupedAlerts.info.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-3 pr-4">
              <AnimatePresence>
                {filteredAlerts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Bell className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium">Nenhum alerta</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSeverity === 'all' 
                        ? 'Tudo tranquilo por aqui!' 
                        : `Sem alertas de nível ${selectedSeverity}`}
                    </p>
                  </motion.div>
                ) : (
                  filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleAlertClick(alert)}
                      className={`
                        relative p-4 rounded-lg border cursor-pointer transition-all
                        ${alert.isRead 
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' 
                          : 'bg-white border-slate-300 hover:shadow-md'
                        }
                      `}
                    >
                      {!alert.isRead && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
                      )}

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getSeverityIcon(alert.severity)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${alert.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                              {alert.title}
                            </h4>
                            {getSeverityBadge(alert.severity)}
                          </div>

                          <p className={`text-sm mb-2 ${alert.isRead ? 'text-slate-500' : 'text-slate-700'}`}>
                            {alert.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-blue-600">
                              💡 {alert.actionRequired}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(alert.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

/**
 * Badge de contador de alertas (para usar no header/sidebar)
 */
export const AlertBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
    >
      {count > 9 ? '9+' : count}
    </motion.div>
  );
};


