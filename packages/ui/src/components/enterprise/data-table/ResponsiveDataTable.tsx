"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown, GripVertical } from "lucide-react";

interface ResponsiveDataTableProps<TData> {
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  isLoading: boolean;
  selectedRows: Set<string>;
  onSelectedRowsChange: (ids: Set<string>) => void;
  density: "compact" | "normal" | "comfortable";
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (v: VisibilityState) => void;
  columns: ColumnDef<TData>[];
  getRowId: (row: TData) => string;
}

export function ResponsiveDataTable<TData>({
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onEdit,
  onDelete,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  density,
  columnVisibility,
  onColumnVisibilityChange,
  columns,
  getRowId,
}: ResponsiveDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowHeight = density === "compact" ? 40 : density === "normal" ? 52 : 64;
  const fontSize = density === "compact" ? "text-xs" : density === "normal" ? "text-sm" : "text-sm";

  const handleColumnVisibilityChange = useCallback(
    (v: any) => onColumnVisibilityChange(typeof v === 'function' ? v(columnVisibility) : v),
    [columnVisibility, onColumnVisibilityChange],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, pagination: { pageIndex: page - 1, pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(total / pageSize),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getRowId,
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) return null;

  return (
    <div ref={tableContainerRef} className="overflow-auto rounded-lg border" style={{ maxHeight: "calc(100vh - 320px)" }}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize(), minWidth: header.getSize() }}
                  className={cn(
                    "whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground",
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="inline-flex">
                        {{ asc: <ChevronUp className="h-3 w-3" />, desc: <ChevronDown className="h-3 w-3" /> }[header.column.getIsSorted() as string] || <ChevronsUpDown className="h-3 w-3 opacity-30" />}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const row = rows[virtualItem.index];
            if (!row) return null;
            return (
              <TableRow
                key={getRowId(row.original)}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedRows.has(getRowId(row.original)) && "bg-primary/5",
                  virtualItem.index % 2 === 1 && "bg-muted/30",
                )}
                style={{ height: rowHeight }}
                onClick={() => onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                    className={cn("truncate", fontSize)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}