"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, open: _open, onOpenChange: _onOpenChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col overflow-hidden rounded-md bg-popover", className)}
      {...props}
    />
  )
);
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="search"
    className={cn(
      "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  />
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-72 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-6 text-center text-sm", className)} {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode }
>(({ className, heading, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-1", className)} {...props}>
    {heading && (
      <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {heading}
      </p>
    )}
    {children}
  </div>
));
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }
>(({ className, onSelect, onClick, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    tabIndex={0}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent focus:bg-accent",
      className
    )}
    onClick={(event) => {
      onClick?.(event);
      onSelect?.();
    }}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
};
