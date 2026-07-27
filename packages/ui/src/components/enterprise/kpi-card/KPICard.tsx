"use client";

import { cn } from "@diamondflow/ui/lib/utils";
import { forwardRef } from "react";

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  variant?: "default" | "compact" | "comfortable";
}

export const KPICard = forwardRef<HTMLDivElement, KPICardProps>(
  ({ className, title, value, icon, trend, subtitle, variant = "default", ...props }, ref) => {
    const padding = variant === "compact" ? "p-3" : variant === "comfortable" ? "p-6" : "p-4";
    const titleSize = variant === "compact" ? "text-xs" : "text-sm";
    const valueSize = variant === "compact" ? "text-xl" : variant === "comfortable" ? "text-3xl" : "text-2xl";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm flex items-center",
          padding,
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mr-4 rounded-lg bg-primary/10 p-3 text-primary dark:bg-primary/20 dark:text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-muted-foreground truncate", titleSize)}>{title}</p>
          <div className="flex items-baseline gap-2">
            <div className={cn("font-bold truncate", valueSize)}>{value}</div>
            {trend && (
              <span className={cn("text-xs font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className={cn("text-xs text-muted-foreground mt-0.5", variant === "compact" ? "hidden" : "block")}>{subtitle}</p>}
        </div>
</div>
    )
  }
);
KPICard.displayName = "KPICard";