"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { ComponentType, Suspense } from "react";

interface TabPaneProps {
  id: string;
  component: ComponentType<any>;
}

export function TabPane({ id, component: Component }: TabPaneProps) {
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const isActive = activeTabId === id;

  return (
    <div
      className={cn(
        "w-full h-full overflow-auto bg-background",
        !isActive && "hidden"
      )}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
        <Component />
      </Suspense>
    </div>
  );
}
