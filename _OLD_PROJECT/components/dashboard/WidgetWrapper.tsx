import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Maximize2, Minimize2, X, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface WidgetWrapperProps {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  onRemove?: () => void;
  onSettings?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
  isDragging?: boolean;
  className?: string;
  headerActions?: ReactNode;
}

export function WidgetWrapper({
  id,
  title,
  description,
  icon,
  children,
  onRemove,
  onSettings,
  onExpand,
  isExpanded = false,
  isDragging = false,
  className,
  headerActions,
}: WidgetWrapperProps) {
  return (
    <Card
      className={cn(
        'transition-all',
        isDragging && 'opacity-50 rotate-2',
        isExpanded && 'col-span-2 row-span-2',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-grab active:cursor-grabbing"
            data-drag-handle
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {headerActions}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onExpand && (
                <>
                  <DropdownMenuItem onClick={onExpand}>
                    {isExpanded ? (
                      <>
                        <Minimize2 className="mr-2 h-4 w-4" />
                        Minimizar
                      </>
                    ) : (
                      <>
                        <Maximize2 className="mr-2 h-4 w-4" />
                        Expandir
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onSettings && (
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
              )}
              {onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onRemove}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remover
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

