import React from 'react';
import { cn } from '@/lib/utils';

// Table Root Component
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Habilitar zebra striping nas linhas */
  striped?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse',
            striped && '[&_tbody_tr:nth-child(odd)]:bg-neutral-bgAlt',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = 'Table';

// TableHeader Component
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          'bg-neutral-bgAlt border-b-2 border-neutral-border',
          className
        )}
        {...props}
      />
    );
  }
);
TableHeader.displayName = 'TableHeader';

// TableBody Component
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={cn('', className)} {...props} />;
  }
);
TableBody.displayName = 'TableBody';

// TableRow Component
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Habilitar hover effect */
  hoverable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hoverable = true, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-neutral-border transition-colors',
          hoverable && 'hover:bg-neutral-bgAlt',
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

// TableHead Component
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Habilitar ícone de sorting */
  sortable?: boolean;
  /** Direção do sorting */
  sortDirection?: 'asc' | 'desc' | null;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-md py-sm text-left text-small font-semibold text-neutral-textSecondary',
          sortable && 'cursor-pointer select-none hover:text-neutral-text',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-xs">
          {children}
          {sortable && (
            <span className="text-xs">
              {sortDirection === 'asc' && '↑'}
              {sortDirection === 'desc' && '↓'}
              {!sortDirection && '↕'}
            </span>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

// TableCell Component
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Alinhar o conteúdo */
  align?: 'left' | 'center' | 'right';
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <td
        ref={ref}
        className={cn(
          'px-md py-sm text-body text-neutral-text',
          alignStyles[align],
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

// Export all components
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };

