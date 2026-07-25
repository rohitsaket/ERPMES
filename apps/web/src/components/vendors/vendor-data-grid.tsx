"use client";

import { useMemo, useRef, useState, useCallback } from "react";
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
import type { Vendor } from "@/lib/api/types";
import { VendorStatusBadge } from "./vendor-status-badge";
import { VendorActions } from "./vendor-actions";
import { ChevronUp, ChevronDown, ChevronsUpDown, GripVertical } from "lucide-react";

interface Props {
  data: Vendor[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  isLoading: boolean;
  selectedRows: Set<string>;
  onSelectedRowsChange: (ids: Set<string>) => void;
  density: "compact" | "normal" | "comfortable";
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (v: VisibilityState) => void;
}

export function VendorDataGrid({
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
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowHeight = density === "compact" ? 40 : density === "normal" ? 52 : 64;
  const fontSize = density === "compact" ? "text-xs" : density === "normal" ? "text-sm" : "text-sm";

  const columns = useMemo<ColumnDef<Vendor>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => {
                const v = e.target.checked;
                table.toggleAllPageRowsSelected(!!v);
                if (v) onSelectedRowsChange(new Set(data.map((d) => d.id)));
                else onSelectedRowsChange(new Set());
              }}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={selectedRows.has(row.original.id)}
              onChange={(e) => {
                const v = e.target.checked;
                const next = new Set(selectedRows);
                if (v) next.add(row.original.id);
                else next.delete(row.original.id);
                onSelectedRowsChange(next);
              }}
              aria-label="Select row"
            />
          ),
        size: 40,
        enableResizing: false,
        enableSorting: false,
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono font-medium text-primary">{row.original.code}</span>,
        size: 100,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium truncate">{row.original.name}</div>
            {row.original.companyName && <div className="text-xs text-muted-foreground truncate">{row.original.companyName}</div>}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: "gstNumber",
        header: "GST Number",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.gstNumber || "—"}</span>,
        size: 130,
      },
      {
        accessorKey: "panNumber",
        header: "PAN",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.panNumber || "—"}</span>,
        size: 120,
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.city || "—"}</span>,
        size: 120,
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.state || "—"}</span>,
        size: 120,
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.country || "—"}</span>,
        size: 100,
      },
      {
        accessorKey: "mobile",
        header: "Phone",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.mobile || row.original.telephone || "—"}</span>,
        size: 130,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-xs text-muted-foreground truncate">{row.original.email || "—"}</span>,
        size: 180,
      },
      {
        accessorKey: "paymentTerms",
        header: "Terms",
        cell: ({ row }) => (
          <span className="capitalize text-xs text-muted-foreground">
            {(row.original.paymentTerms || "—").replace(/_/g, " ")}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "creditLimit",
        header: "Credit Limit",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.creditLimit != null ? `$${row.original.creditLimit.toLocaleString()}` : "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <VendorStatusBadge status={row.original.status} />,
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}</span>,
        size: 120,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <VendorActions
            vendor={row.original}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            onView={() => onRowClick(row.original)}
          />
        ),
        size: 140,
        enableResizing: false,
        enableSorting: false,
      },
    ],
    [data, selectedRows, onSelectedRowsChange, onEdit, onDelete, onRowClick],
  );

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
                key={row.id}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedRows.has(row.original.id) && "bg-primary/5",
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
