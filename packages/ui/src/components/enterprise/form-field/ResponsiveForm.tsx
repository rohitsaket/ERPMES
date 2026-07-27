"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { forwardRef } from "react";

export interface ResponsiveFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveFormField = forwardRef<HTMLDivElement, ResponsiveFormFieldProps>(
  ({ label, required, error, hint, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {children}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
    )
  }
);

ResponsiveFormField.displayName = "ResponsiveFormField";