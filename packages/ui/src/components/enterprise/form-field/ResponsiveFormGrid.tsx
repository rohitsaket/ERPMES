"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ResponsiveFormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const ResponsiveFormGrid = forwardRef<HTMLDivElement, ResponsiveFormGridProps>(
  ({ children, columns = 2, className, ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <div
        ref={ref}
        className={cn("grid gap-4", gridCols[columns], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
);

ResponsiveFormGrid.displayName = "ResponsiveFormGrid";