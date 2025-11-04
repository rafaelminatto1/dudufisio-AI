import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface NavItemConfig {
  id: string;
  to?: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  children?: NavItemConfig[];
  roles?: string[];
  defaultExpanded?: boolean;
  isNew?: boolean;
}

interface NavItemProps {
  item: NavItemConfig;
  isCollapsed: boolean;
  level?: number;
  onToggle?: (id: string) => void;
  expanded?: boolean;
}

export function NavItem({
  item,
  isCollapsed,
  level = 0,
  onToggle,
  expanded = false,
}: NavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  // Se tem filhos mas não tem link próprio, é apenas um grupo
  if (hasChildren && !item.to) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => onToggle?.(item.id)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isCollapsed && 'justify-center px-2',
            level > 0 && 'pl-' + (level * 4 + 3)
          )}
        >
          <Icon className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-5 w-5')} />
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate text-left">{item.label}</span>
              {item.isNew && (
                <Badge variant="default" className="ml-auto text-xs">
                  Novo
                </Badge>
              )}
              {hasChildren &&
                (expanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ))}
            </>
          )}
        </button>
        {!isCollapsed && expanded && hasChildren && (
          <div className="ml-2 space-y-1 border-l-2 border-border pl-2">
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                isCollapsed={isCollapsed}
                level={level + 1}
                onToggle={onToggle}
                expanded={expanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Se tem link, é um item navegável
  if (item.to) {
    const content = (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-accent hover:text-accent-foreground',
            isCollapsed && 'justify-center px-2',
            level > 0 && !isCollapsed && 'pl-' + (level * 4 + 3)
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-5 w-5')} />
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.isNew && (
                  <Badge variant="default" className="ml-auto text-xs">
                    Novo
                  </Badge>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant={isActive ? 'secondary' : 'default'}
                    className="ml-auto h-5 min-w-[20px] justify-center px-1 text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </>
            )}
            {isCollapsed && item.badge !== undefined && item.badge > 0 && (
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
            )}
          </>
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  return null;
}

