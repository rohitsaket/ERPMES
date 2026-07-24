import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
  SortingState,
  PaginationState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    pageSize?: number;
    showPageSizeOptions?: boolean;
    pageSizeOptions?: number[];
  };
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  filtering?: ColumnFiltersState;
  onFilteringChange?: OnChangeFn<ColumnFiltersState>;
  paginationState?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  searchKey?: string;
  searchPlaceholder?: string;
  className?: string;
  onRowClick?: (row: TData) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: string[]) => void;
  getRowId?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = { pageSize: 10, showPageSizeOptions: true, pageSizeOptions: [10, 25, 50, 100] },
  sorting,
  onSortingChange,
  filtering,
  onFilteringChange,
  paginationState,
  onPaginationChange,
  searchKey,
  searchPlaceholder = 'Search...',
  className,
  onRowClick,
  selectable = false,
  onSelectionChange,
  getRowId = (row: any) => row.id,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sorting ?? [],
      columnFilters: filtering ?? [],
      pagination: paginationState ?? { pageIndex: 0, pageSize: pagination.pageSize ?? 10 },
      rowSelection,
    },
    onSortingChange: onSortingChange ?? ((updater) => {}),
    onColumnFiltersChange: onFilteringChange ?? ((updater) => {}),
    onPaginationChange: onPaginationChange ?? ((updater) => {}),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onFilteringChange,
    enableRowSelection: selectable,
    getRowId,
  });

  const handleSearchChange = (value: string) => {
    if (searchKey) {
      onFilteringChange?.([{ id: searchKey, value }]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection: Record<string, boolean> = {};
      table.getFilteredRowModel().rows.forEach((row) => {
        newSelection[getRowId(row.original)] = true;
      });
      setRowSelection(newSelection);
      onSelectionChange?.(Object.keys(newSelection));
    } else {
      setRowSelection({});
      onSelectionChange?.([]);
    }
  };

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {searchKey && (
          <div className="w-full sm:w-64">
            <Input
              placeholder={searchPlaceholder}
              value={(table.getState().columnFilters.find((f) => f.id === searchKey)?.value as string) || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {pagination.showPageSizeOptions && (
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {pagination.pageSizeOptions?.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
      </div>
    </div>

    <div className="rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {selectable && (
                <th className="w-12 h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCount === table.getFilteredRowModel().rows.length && table.getFilteredRowModel().rows.length > 0}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          selectedCount > 0 &&
                          selectedCount < table.getFilteredRowModel().rows.length;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ width: header.getSize() }}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ml-auto">
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 opacity-0" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {selectable && (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={row.getIsSelected()}
                      onChange={(e) => {
                        e.stopPropagation();
                        row.toggleSelected(e.target.checked);
                        const selected = table.getFilteredSelectedRowModel().rows.map((r) => getRowId(r.original));
                        onSelectionChange?.(selected);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                  </td>
                )}
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          {(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1}{' '}
          to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
