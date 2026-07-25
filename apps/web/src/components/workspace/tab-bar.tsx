"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { X, LayoutDashboard, Building2, Users, Package, ShoppingCart, CalendarDays, Factory, ShieldCheck, BarChart3, Settings } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

// Helper to resolve icon
function getIconForTab(iconName?: string, id?: string) {
  if (iconName === "LayoutDashboard") return LayoutDashboard;
  if (iconName === "Building2") return Building2;
  if (iconName === "Users") return Users;
  if (iconName === "Package") return Package;
  if (iconName === "ShoppingCart") return ShoppingCart;
  if (iconName === "CalendarDays") return CalendarDays;
  if (iconName === "Factory") return Factory;
  if (iconName === "ShieldCheck") return ShieldCheck;
  if (iconName === "BarChart3") return BarChart3;
  if (iconName === "Settings") return Settings;
  
  if (id?.includes("vendor")) return Building2;
  if (id?.includes("customer")) return Users;
  if (id?.includes("inventory") || id?.includes("product")) return Package;
  if (id?.includes("sales") || id?.includes("purchase")) return ShoppingCart;
  if (id?.includes("planning") || id?.includes("mrp")) return CalendarDays;
  if (id?.includes("manufacturing") || id?.includes("production") || id?.includes("job") || id?.includes("wip")) return Factory;
  if (id?.includes("quality") || id?.includes("inspection")) return ShieldCheck;
  if (id?.includes("analytics")) return BarChart3;
  if (id?.includes("admin")) return Settings;

  return LayoutDashboard;
}

interface SortableTabProps {
  tab: any;
  isActive: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onContextMenu: {
    closeTab: (id: string) => void;
    closeOthers: (id: string) => void;
    closeLeft: (id: string) => void;
    closeRight: (id: string) => void;
    closeAll: () => void;
    togglePinTab: (id: string) => void;
  }
}

function SortableTab({ tab, isActive, onActivate, onClose, onContextMenu }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : isActive ? 10 : 1,
  };

  const IconComponent = getIconForTab(tab.icon, tab.id);

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1 && !tab.isPinned) {
      e.preventDefault();
      onClose(tab.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={style}
      ref={setNodeRef}
      className="flex-shrink-0"
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            {...attributes}
            {...listeners}
            data-tab-id={tab.id}
            onClick={() => onActivate(tab.id)}
            onMouseUp={handleMouseUp}
            title={tab.title}
            className={cn(
              "group relative flex items-center h-[20px] cursor-pointer select-none transition-colors duration-150 ease-in-out font-sans text-[12px] font-medium border-t-[2px] border-transparent",
              "px-4 mx-[1px]", 
              "rounded-t-[6px]",
              isActive 
                ? "bg-[#FFFFFF] border-[#E5E7EB] border-x border-t-[#2563EB] border-b-0 text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.05)]" 
                : "bg-transparent text-[#6B7280] hover:bg-[#F1F5F9] border-x border-x-transparent border-t-transparent border-b border-b-transparent",
              tab.isPinned ? "w-[32px] justify-center px-0 shrink-0" : "min-w-[100px] max-w-[200px]"
            )}
            style={isActive ? { marginBottom: '-1px', paddingBottom: '1px' } : {}}
          >
            {/* Active Tab Cover for seamless bottom */}
            {isActive && (
               <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-[#FFFFFF] z-10" />
            )}

            <div className="flex items-center gap-[10px] overflow-hidden w-full px-1 z-20">
              {tab.isDirty && !tab.isPinned && (
                <div className="w-[6px] h-[6px] rounded-full bg-[#2563EB] shrink-0" />
              )}
              
              <IconComponent className={cn("h-[12px] w-[12px] shrink-0", isActive ? "text-[#2563EB]" : "text-[#6B7280]")} />
              
              {!tab.isPinned && (
                <span className="truncate whitespace-nowrap">{tab.title}</span>
              )}
            </div>

            {!tab.isPinned && (
              <button
                className={cn(
                  "ml-auto shrink-0 flex items-center justify-center w-[16px] h-[16px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-[#E5E7EB] z-20",
                  isActive && "opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tab.isDirty) {
                    if (!confirm(`Save changes for ${tab.title}?`)) {
                      onClose(tab.id);
                    }
                  } else {
                    onClose(tab.id);
                  }
                }}
              >
                {tab.isDirty ? (
                  <div className="w-[8px] h-[8px] rounded-full bg-[#2563EB] group-hover:hidden" />
                ) : null}
                <X className={cn("h-[10px] w-[10px]", tab.isDirty ? "hidden group-hover:block text-[#6B7280]" : "text-[#6B7280]")} />
              </button>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 z-50">
          <ContextMenuItem onClick={() => onContextMenu.closeTab(tab.id)}>Close</ContextMenuItem>
          <ContextMenuItem onClick={() => onContextMenu.closeOthers(tab.id)}>Close Others</ContextMenuItem>
          <ContextMenuItem onClick={() => onContextMenu.closeLeft(tab.id)}>Close Left</ContextMenuItem>
          <ContextMenuItem onClick={() => onContextMenu.closeRight(tab.id)}>Close Right</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onContextMenu.togglePinTab(tab.id)}>
            {tab.isPinned ? "Unpin Tab" : "Pin Tab"}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onContextMenu.closeAll()}>Close All</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </motion.div>
  );
}

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeOthers, closeLeft, closeRight, closeAll, togglePinTab, reorderTabs } = useWorkspaceStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleActivate = (id: string) => {
    setActiveTab(id);
    if (pathname !== id) {
      router.push(id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-scroll to active tab
  useEffect(() => {
    if (activeTabId && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [activeTabId, tabs.length]);

  // Handle drag scrolling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only engage drag scroll if clicking directly on the tab bar background (not on a tab)
    if (e.target === scrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
      setScrollLeft(scrollRef.current?.scrollLeft || 0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => setIsDragging(false);

  // Handle mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id);
      const newIndex = tabs.findIndex((t) => t.id === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  const pinnedTabs = tabs.filter(t => t.isPinned);
  const unpinnedTabs = tabs.filter(t => !t.isPinned);

  return (
    <div 
      className="flex items-end h-[22px] bg-[#F8FAFC] border-b border-[#E5E7EB] px-[12px] pt-[2px] overflow-x-auto overflow-y-hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for standard browsers
      ref={scrollRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { display: none; }
      `}} />
      
      <DndContext id="tab-bar-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex">
            <AnimatePresence initial={false}>
              {pinnedTabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={activeTabId === tab.id}
                  onActivate={handleActivate}
                  onClose={closeTab}
                  onContextMenu={{ closeTab, closeOthers, closeLeft, closeRight, closeAll, togglePinTab }}
                />
              ))}
              
              {unpinnedTabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={activeTabId === tab.id}
                  onActivate={handleActivate}
                  onClose={closeTab}
                  onContextMenu={{ closeTab, closeOthers, closeLeft, closeRight, closeAll, togglePinTab }}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
