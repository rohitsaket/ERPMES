"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  FilePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const quickActions = [
  {
    name: "Create Quotation",
    href: "/sales/quotations/new",
    icon: FilePlus,
  },
  {
    name: "Create Production Order",
    href: "/planning/production-orders/new",
    icon: PlusCircle,
  },
  {
    name: "Transfer Inventory",
    href: "/inventory/transfers",
    icon: PlusCircle,
  },
];

interface TopNavigationProps {
  desktopNavigationExpanded: boolean;
  onDesktopMenuClick: () => void;
  onMobileMenuClick: () => void;
}

export function TopNavigation({
  desktopNavigationExpanded,
  onDesktopMenuClick,
  onMobileMenuClick,
}: TopNavigationProps) {
  const { user, signOut, organization } = useAuth();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [commandQuery, setCommandQuery] = React.useState("");
  const normalizedQuery = commandQuery.trim().toLowerCase();
  const filteredNavigation = navigation.filter((item) =>
    item.name.toLowerCase().includes(normalizedQuery),
  );
  const filteredQuickActions = quickActions.filter((item) =>
    item.name.toLowerCase().includes(normalizedQuery),
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!commandOpen) setCommandQuery("");
  }, [commandOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 w-full items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMobileMenuClick}
            className="h-11 w-11 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDesktopMenuClick}
            className="hidden h-11 w-11 lg:inline-flex"
            aria-label={
              desktopNavigationExpanded
                ? "Collapse navigation"
                : "Expand navigation"
            }
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 lg:hidden"
          >
            <Building2 className="h-7 w-7 shrink-0 text-primary" />
            <span className="hidden truncate text-xl font-bold sm:block">
              DiamondFlow
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden h-11 w-64 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <Search className="h-4 w-4" />
            <span>Search navigation</span>
            <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 text-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="h-11 w-11 md:hidden"
            aria-label="Search navigation"
          >
            <Search className="h-5 w-5" />
          </Button>

          <div className="hidden min-w-0 items-center gap-2 rounded-md bg-secondary px-3 py-2 md:flex">
            <Building2 className="h-4 w-4" />
            <span className="max-w-40 truncate text-sm font-medium">
              {organization?.name || "Organization"}
            </span>
          </div>

          <div>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11"
            aria-label="Notifications, 3 unread"
            disabled
            title="Notifications are not implemented yet"
          >
            <Bell className="h-5 w-5" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-11 w-11 rounded-full"
                aria-label="Open user menu"
              >
                <Avatar>
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex w-full items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </header>

      {commandOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setCommandOpen(false)}
            aria-label="Close search"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search navigation"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border bg-popover shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b p-3">
              <Search
                className="ml-1 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <Command className="min-w-0 flex-1">
                <CommandInput
                  autoFocus
                  placeholder="Search navigation and actions..."
                  className="border-0 focus-visible:ring-0"
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                />
              </Command>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => setCommandOpen(false)}
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Command>
              <CommandList className="max-h-[60vh] p-2">
                {!filteredNavigation.length &&
                  !filteredQuickActions.length && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                {filteredNavigation.length > 0 && (
                  <CommandGroup heading="Navigation">
                  {filteredNavigation.map((item) => (
                    <CommandItem
                      key={item.name}
                      onSelect={() => setCommandOpen(false)}
                      className="min-h-11"
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </CommandItem>
                  ))}
                  </CommandGroup>
                )}
                {filteredQuickActions.length > 0 && (
                  <CommandGroup heading="Quick Actions">
                    {filteredQuickActions.map((item) => (
                      <CommandItem
                        key={item.name}
                        onSelect={() => setCommandOpen(false)}
                        className="min-h-11"
                      >
                        <Link
                          href={item.href}
                          className="flex w-full items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
