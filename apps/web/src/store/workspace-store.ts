import { create } from 'zustand';

export interface Tab {
  id: string; // The URL path (e.g. /master-data/vendors)
  title: string;
  icon?: string;
  isDirty?: boolean;
  isPinned?: boolean;
}

interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string | null;
  history: string[]; // Track active tab history for close fallback
  
  // Actions
  addTab: (tab: Omit<Tab, "isDirty" | "isPinned"> & Partial<Tab>) => void;
  closeTab: (id: string) => void;
  closeOthers: (id: string) => void;
  closeLeft: (id: string) => void;
  closeRight: (id: string) => void;
  closeAll: () => void;
  setActiveTab: (id: string) => void;
  setTabDirty: (id: string, isDirty: boolean) => void;
  togglePinTab: (id: string) => void;
  reorderTabs: (startIndex: number, endIndex: number) => void;
  restoreClosedTab: () => void; // Optional: for Ctrl+Shift+T
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  tabs: [
    { id: "/dashboard", title: "Dashboard", isPinned: true, icon: "LayoutDashboard" }
  ],
  activeTabId: "/dashboard",
  history: ["/dashboard"],

  addTab: (newTab) => {
    set((state) => {
      // Check if tab exists
      const exists = state.tabs.find((t) => t.id === newTab.id);
      let newTabs = state.tabs;
      
      if (!exists) {
        if (state.tabs.length >= 30) {
          // Tab limit logic would go here, maybe show a warning instead of blocking
          // For now, just allow it or auto-close oldest unpinned?
          // We will just add it.
        }
        newTabs = [...state.tabs, { ...newTab, isDirty: false, isPinned: false }];
      }

      // Update history
      const newHistory = state.history.filter((id) => id !== newTab.id);
      newHistory.push(newTab.id);

      return {
        tabs: newTabs,
        activeTabId: newTab.id,
        history: newHistory,
      };
    });
  },

  closeTab: (id) => {
    set((state) => {
      const tab = state.tabs.find(t => t.id === id);
      if (tab?.isPinned) return state;

      const newTabs = state.tabs.filter((t) => t.id !== id);
      const newHistory = state.history.filter((h) => h !== id);
      
      let newActiveId: string | null = state.activeTabId;
      if (state.activeTabId === id) {
        newActiveId = newHistory.length > 0 ? (newHistory[newHistory.length - 1] || null) : (newTabs.length > 0 ? (newTabs[0]?.id || null) : null);
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveId,
        history: newHistory,
      };
    });
  },

  closeOthers: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter(t => t.id === id || t.isPinned);
      const newHistory = state.history.filter(h => newTabs.some(t => t.id === h));
      if (!newHistory.includes(id)) newHistory.push(id);
      
      return {
        tabs: newTabs,
        activeTabId: id,
        history: newHistory,
      };
    });
  },

  closeLeft: (id) => {
    set((state) => {
      const index = state.tabs.findIndex(t => t.id === id);
      if (index === -1) return state;
      const newTabs = state.tabs.filter((t, i) => i >= index || t.isPinned);
      const newHistory = state.history.filter(h => newTabs.some(t => t.id === h));
      
      let newActiveId = state.activeTabId;
      if (!newTabs.some(t => t.id === newActiveId)) {
        newActiveId = id;
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveId,
        history: newHistory,
      };
    });
  },

  closeRight: (id) => {
    set((state) => {
      const index = state.tabs.findIndex(t => t.id === id);
      if (index === -1) return state;
      const newTabs = state.tabs.filter((t, i) => i <= index || t.isPinned);
      const newHistory = state.history.filter(h => newTabs.some(t => t.id === h));
      
      let newActiveId = state.activeTabId;
      if (!newTabs.some(t => t.id === newActiveId)) {
        newActiveId = id;
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveId,
        history: newHistory,
      };
    });
  },

  closeAll: () => {
    set((state) => {
      const newTabs = state.tabs.filter(t => t.isPinned);
      const newHistory = state.history.filter(h => newTabs.some(t => t.id === h));
      const lastTab = newTabs[newTabs.length - 1];
      const newActiveId = lastTab ? lastTab.id : null;
      
      return {
        tabs: newTabs,
        activeTabId: newActiveId,
        history: newHistory,
      };
    });
  },

  setActiveTab: (id) => {
    set((state) => {
      if (!state.tabs.some(t => t.id === id)) return state;
      const newHistory = state.history.filter((h) => h !== id);
      newHistory.push(id);
      return {
        activeTabId: id,
        history: newHistory,
      };
    });
  },

  setTabDirty: (id, isDirty) => {
    set((state) => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, isDirty } : t)
    }));
  },

  togglePinTab: (id) => {
    set((state) => {
      const tabs = [...state.tabs];
      const index = tabs.findIndex(t => t.id === id);
      if (index > -1) {
        const target = tabs[index];
        if (target) {
          tabs[index] = { ...target, isPinned: !target.isPinned };
        }
      }
      
      const pinned = tabs.filter(t => t.isPinned);
      const unpinned = tabs.filter(t => !t.isPinned);
      
      return { tabs: [...pinned, ...unpinned] };
    });
  },

  reorderTabs: (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.tabs);
      const [removed] = result.splice(startIndex, 1);
      if (removed) {
        result.splice(endIndex, 0, removed);
      }
      return { tabs: result };
    });
  },

  restoreClosedTab: () => {
    // Requires a closed tabs history, can implement later if needed
  }
}));
