"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { TopNavigation } from "./top-navigation";
import { Breadcrumbs } from "./breadcrumbs";
import { cn } from "../../lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [desktopNavigationExpanded, setDesktopNavigationExpanded] =
    useState(true);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar
        desktopExpanded={desktopNavigationExpanded}
        mobileOpen={mobileNavigationOpen}
        onDesktopExpandedChange={setDesktopNavigationExpanded}
        onMobileOpenChange={setMobileNavigationOpen}
      />
      <div
        className={cn(
          "flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200",
          desktopNavigationExpanded ? "lg:pl-64" : "lg:pl-16"
        )}
      >
        <TopNavigation
          desktopNavigationExpanded={desktopNavigationExpanded}
          onDesktopMenuClick={() =>
            setDesktopNavigationExpanded((expanded) => !expanded)
          }
          onMobileMenuClick={() => setMobileNavigationOpen(true)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 focus:outline-none sm:p-6 lg:p-8"
        >
          <Breadcrumbs />
          <div className="mx-auto mt-4 w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
