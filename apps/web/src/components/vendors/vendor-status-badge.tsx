"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  blocked: "bg-red-100 text-red-700 border-red-200",
};

export function VendorStatusBadge({ status }: { status?: string }) {
  const s = (status || "active").toLowerCase();
  
  // Use a fallback if the status is not in the map
  const style = STATUS_STYLES[s] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
      )}
    >
      {s}
    </span>
  );
}
