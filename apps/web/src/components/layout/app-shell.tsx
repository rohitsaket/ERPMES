"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { TopNavigation } from "./top-navigation";
import { cn } from "../../lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [desktopNavigationExpanded, setDesktopNavigationExpanded] =
    useState(true);

  return (
    <div className="h-dvh overflow-hidden bg-background">
      <Sidebar
        desktopExpanded={desktopNavigationExpanded}
        mobileOpen={mobileNavigationOpen}
        onDesktopExpandedChange={setDesktopNavigationExpanded}
        onMobileOpenChange={setMobileNavigationOpen}
      />
      <div
        className={cn(
          "flex h-dvh min-w-0 flex-col transition-[padding] duration-200",
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
          className="flex-1 p-4 focus:outline-none sm:p-6 lg:p-8 flex flex-col"
        >
          <div className="w-full flex-1 flex flex-col min-h-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
