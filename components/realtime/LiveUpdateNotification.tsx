import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Eye, Calendar, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export interface LiveUpdate {
  id: string;
  type: 'insert' | 'update' | 'delete';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

interface LiveUpdateNotificationProps {
  update: LiveUpdate | null;
  onClose: () => void;
  onView?: () => void;
  autoClose?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const LiveUpdateNotification: React.FC<LiveUpdateNotificationProps> = ({
  update,
  onClose,
  onView,
  autoClose = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (update) {
      setIsVisible(true);

      if (autoClose) {
        const timeout = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, autoClose);

        return () => clearTimeout(timeout);
      }
    }
  }, [update, autoClose, onClose]);

  if (!update) return null;

  const positionClasses = {
    'top-right': 'top-20 right-4',
    'top-center': 'top-20 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const typeConfig = {
    insert: {
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200',
      label: 'Novo'
    },
    update: {
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200',
      label: 'Atualizado'
    },
    delete: {
      icon: X,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200',
      label: 'Removido'
    }
  };

  const config = typeConfig[update.type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: update.type === 'insert' ? -50 : 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={cn("fixed z-50", positionClasses[position])}
        >
          <Card className={cn(
            "w-96 max-w-[calc(100vw-2rem)] p-4 shadow-2xl border-2",
            config.bgColor,
            config.borderColor
          )}>
            <div className="flex items-start gap-3">
              {/* Icon with pulse */}
              <motion.div
                className={cn("p-2 rounded-full", config.bgColor)}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className={cn("w-5 h-5", config.color)} />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{update.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {config.label}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{update.description}</p>

                {update.userName && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>Por {update.userName}</span>
                  </div>
                )}

                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onView}
                    className="mt-3 w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </Button>
                )}
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress bar (auto-close) */}
            {autoClose && (
              <motion.div
                className={cn("h-1 mt-3 rounded-full", config.color.replace('text-', 'bg-'))}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: autoClose / 1000, ease: 'linear' }}
              />
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveUpdateNotification;

