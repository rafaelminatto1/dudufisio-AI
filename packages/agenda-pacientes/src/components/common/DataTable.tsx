import React, { ReactNode, useRef } from 'react';
import {
  ColumnDef,
  Column,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkeletonTable } from '@/components/ui/skeleton-table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  showColumnToggle?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  // Virtualization options
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
  tableHeight?: number;
  rowHeight?: number;
  overscan?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showPagination = true,
  showColumnToggle = true,
  loading = false,
  emptyState,
  onRowClick,
  className,
  enableSorting = true,
  enableFiltering = true,
  manualPagination = false,
  pageCount,
  onPaginationChange,
  enableVirtualization = true,
  virtualizationThreshold = 100,
  tableHeight = 600,
  rowHeight = 52,
  overscan = 5,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    ...(manualPagination && pageCount !== undefined ? { pageCount } : {}),
    ...(manualPagination ? { manualPagination: true } : {}),
  });

  if (loading) {
    return <SkeletonTable columns={columns.length} rows={pageSize} />;
  }

  const rows = table.getRowModel().rows;
  const shouldVirtualize = enableVirtualization && rows.length >= virtualizationThreshold;
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = shouldVirtualize && virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = shouldVirtualize && virtualItems.length > 0
    ? totalSize - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Column Toggle */}
      {showColumnToggle && (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table */}
      <div
        className={cn('rounded-md border', shouldVirtualize ? 'overflow-auto' : '')}
        ref={shouldVirtualize ? parentRef : undefined}
        style={shouldVirtualize ? { height: tableHeight } : undefined}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              shouldVirtualize ? (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td style={{ height: `${paddingTop}px` }} />
                    </tr>
                  )}
                  {virtualItems.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={() => onRowClick?.(row.original)}
                        className={onRowClick ? 'cursor-pointer' : ''}
                        style={{ height: `${rowHeight}px` }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                </>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => onRowClick?.(row.original)}
                    className={onRowClick ? 'cursor-pointer' : ''}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyState || 'Nenhum resultado encontrado.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Linhas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente helper para criar header de coluna com ordenação
 */
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

