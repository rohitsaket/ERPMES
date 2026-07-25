"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit3, Trash2, Copy, ToggleLeft, History, FileText, ShoppingCart, BookOpen, MoreHorizontal } from "lucide-react";
import type { Vendor } from "@/lib/api/types";

interface Props {
  vendor: Vendor;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VendorActions({ onView, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onView} title="View">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onEdit} title="Edit">
        <Edit3 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500/70 hover:text-red-600 hover:bg-red-50" onClick={onDelete} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="More">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <ToggleLeft className="mr-2 h-4 w-4" /> Enable / Disable
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <History className="mr-2 h-4 w-4" /> History
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <FileText className="mr-2 h-4 w-4" /> Documents
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Purchase History
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <BookOpen className="mr-2 h-4 w-4" /> Ledger
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
