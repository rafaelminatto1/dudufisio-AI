import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  width?: number;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  rowHeight?: number;
  overscan?: number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function VirtualizedTable<T extends { id: string }>({
  data,
  columns,
  height = 600,
  rowHeight = 52,
  overscan = 5,
  onRowClick,
  className,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto rounded-md border', className)}
      style={{ height }}
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <TableRow
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer' : ''}
                style={{ height: `${rowHeight}px` }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

