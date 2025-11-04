import React, { useState, useMemo } from 'react';
import { NavItem, NavItemConfig } from './NavItem';
import { cn } from '@/lib/utils';

interface NavSectionProps {
  title?: string;
  items: NavItemConfig[];
  isCollapsed: boolean;
  defaultExpanded?: boolean;
}

export function NavSection({
  title,
  items,
  isCollapsed,
  defaultExpanded = false,
}: NavSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (defaultExpanded) {
      return new Set(items.filter((item) => item.defaultExpanded).map((item) => item.id));
    }
    return new Set();
  });

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      {title && !isCollapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            onToggle={handleToggle}
            expanded={expandedIds.has(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

