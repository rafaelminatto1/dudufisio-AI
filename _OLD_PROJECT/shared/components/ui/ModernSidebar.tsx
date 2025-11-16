import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  active?: boolean;
  children?: NavigationItem[];
}

interface ModernSidebarProps {
  items: NavigationItem[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: (href: string) => void;
  className?: string;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  items,
  isCollapsed = false,
  onToggle,
  onNavigate,
  className,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-in-out',
        'glass-nav dark:glass-nav-dark',
        'border-r border-white/10 dark:border-gray-700/10',
        {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        },
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/10">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DF</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              DuduFisio
            </span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors duration-200 touch-target"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            isExpanded={expandedItems.includes(item.id)}
            onToggleExpanded={() => toggleExpanded(item.id)}
            onNavigate={handleNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10 dark:border-gray-700/10">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2024 DuduFisio-AI
          </div>
        </div>
      )}
    </div>
  );
};

interface NavigationItemComponentProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onNavigate: (href: string) => void;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({
  item,
  isCollapsed,
  isExpanded,
  onToggleExpanded,
  onNavigate,
}) => {
  const { icon: Icon, label, href, badge, active, children } = item;

  const hasChildren = children && children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpanded();
    } else {
      onNavigate(href);
    }
  };

  return (
    <div className="space-y-1">
      {/* Main Item */}
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 touch-target',
          'hover:bg-white/10 dark:hover:bg-gray-700/20',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
          {
            'bg-gradient-primary text-white shadow-primary': active,
            'text-gray-700 dark:text-gray-300': !active,
            'justify-center': isCollapsed,
          }
        )}
      >
        <div className="relative">
          <Icon className="w-5 h-5 flex-shrink-0" />
          {badge && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-health-error text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left font-medium truncate">{label}</span>
            {hasChildren && (
              <div className={cn(
                'transition-transform duration-200',
                isExpanded ? 'rotate-180' : ''
              )}>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </>
        )}
      </button>

      {/* Children */}
      {hasChildren && !isCollapsed && isExpanded && (
        <div className="ml-4 space-y-1 animate-fade-in">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => onNavigate(child.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                'hover:bg-white/5 dark:hover:bg-gray-700/10',
                'focus:outline-none focus:ring-1 focus:ring-primary-500/30',
                {
                  'bg-primary-500/10 text-primary-600 dark:text-primary-400': child.active,
                  'text-gray-600 dark:text-gray-400': !child.active,
                }
              )}
            >
              <child.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left text-sm truncate">{child.label}</span>
              {child.badge && child.badge > 0 && (
                <span className="w-2 h-2 bg-health-error rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernSidebar;
