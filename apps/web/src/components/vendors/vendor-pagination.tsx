"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedCount?: number;
}

export function VendorPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {selectedCount > 0 && (
          <span className="text-xs font-medium text-primary">
            {selectedCount} selected
          </span>
        )}
        <span className="text-sm text-muted-foreground">
          Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()} Vendors
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[10 w-auto min-w-[120px] text-xs">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
            <SelectItem value="250">250 per page</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="h-8" onClick={() => onPageChange(1)} disabled={page <= 1} title="First">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1} title="Previous">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="flex items-center px-2 text-xs text-muted-foreground">
          Page <input type="number" value={page} onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) onPageChange(p); }} className="w-12 text-center border-0 bg-transparent outline-none text-xs" min={1} max={totalPages} />
          of {totalPages}
        </span>

        <Button variant="outline" size="icon" className="h-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} title="Next">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} title="Last">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}