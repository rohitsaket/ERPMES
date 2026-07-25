"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { TabBar } from "./tab-bar";
import { TabPane } from "./tab-pane";
import { getComponentForUrl } from "./registry";
import { usePathname, useRouter } from "next/navigation";

export function WorkspaceView() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useWorkspaceStore();
  const pathname = usePathname();

  // Sync URL with active tab
  useEffect(() => {
    if (activeTabId && activeTabId !== pathname) {
      window.history.pushState(null, "", activeTabId);
    }
  }, [activeTabId, pathname]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T: New Tab
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        addTab({ id: "/dashboard", title: "Dashboard" });
        window.history.pushState(null, "", "/dashboard");
      }
      
      // Ctrl+W: Close Tab
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
      
      // Ctrl+Tab / Ctrl+Shift+Tab
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        const index = tabs.findIndex(t => t.id === activeTabId);
        if (index === -1) return;
        
        let nextIndex;
        if (e.shiftKey) {
          nextIndex = index > 0 ? index - 1 : tabs.length - 1;
        } else {
          nextIndex = index < tabs.length - 1 ? index + 1 : 0;
        }
        
        const nextTab = tabs[nextIndex];
        if (nextTab) setActiveTab(nextTab.id);
      }
      
      // Ctrl+1..9
      if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
        const num = parseInt(e.key);
        const tab = tabs[num - 1];
        if (tab) {
          e.preventDefault();
          setActiveTab(tab.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabId, tabs, closeTab, setActiveTab, addTab]);

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <TabBar />
      <div className="flex-1 relative overflow-hidden bg-background">
        {tabs.map((tab) => {
          const Component = getComponentForUrl(tab.id);
          return (
            <TabPane
              key={tab.id}
              id={tab.id}
              component={Component}
            />
          );
        })}
        {tabs.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No tabs open. Use the sidebar to open a module.
          </div>
        )}
      </div>
    </div>
  );
}
