"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, RotateCcw, Columns3, PanelRight, Download, Upload, RefreshCw, Printer, Settings2, Plus } from "lucide-react";
import type { VisibilityState } from "@tanstack/react-table";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  density: "compact" | "normal" | "comfortable";
  onDensityChange: (v: "compact" | "normal" | "comfortable") => void;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (v: VisibilityState) => void;
  onRefresh: () => void;
  onImport: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onSettings: () => void;
  onNewVendor: () => void;
}

export function VendorToolbar({
  search, onSearchChange,
  density, onDensityChange,
  columnVisibility, onColumnVisibilityChange,
  onRefresh,
  onImport,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onPrint,
  onSettings,
  onNewVendor,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      {/* Left: Search */}
      <div className="relative w-full sm:w-[320px] shrink-0">
        <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pl-10 text-sm rounded-md"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" onClick={onImport} title="Import">
          <Upload className="h-[18px] w-[18px]" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" title="Export">
              <Download className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCsv}>Export CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>Export Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}>Export PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" onClick={onPrint} title="Print">
          <Printer className="h-[18px] w-[18px]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" title="Columns">
              <Columns3 className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
            <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(columnVisibility).map(([key, value]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={value !== false}
                onCheckedChange={(v) => onColumnVisibilityChange({ ...columnVisibility, [key]: v })}
              >
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" title="Density">
              <PanelRight className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem checked={density === "compact"} onCheckedChange={() => onDensityChange("compact")}>Compact</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={density === "normal"} onCheckedChange={() => onDensityChange("normal")}>Normal</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={density === "comfortable"} onCheckedChange={() => onDensityChange("comfortable")}>Comfortable</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" onClick={onSettings} title="Settings">
          <Settings2 className="h-[18px] w-[18px]" />
        </Button>
        
        <Button variant="default" className="h-10 rounded-md px-4 font-medium gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={onNewVendor}>
            <Plus className="h-[18px] w-[18px]" />
            New Vendor
          </Button>
      </div>
    </div>
  );
}
