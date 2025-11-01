import React, { ReactNode } from 'react';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  separator?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  disabled?: boolean;
}

export function ActionMenu({
  items,
  label = "Ações",
  orientation = 'horizontal',
  align = 'end',
  size = 'icon',
  disabled = false,
}: ActionMenuProps) {
  const Icon = orientation === 'horizontal' ? MoreHorizontal : MoreVertical;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">{label}</span>
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              disabled={item.disabled}
              className={
                item.variant === 'destructive'
                  ? 'text-destructive focus:text-destructive'
                  : ''
              }
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

