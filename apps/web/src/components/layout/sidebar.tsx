"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  Gem,
  ClipboardCheck,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  BarChart3,
  Warehouse,
  Wrench,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Bot,
  UserRound,
  Shield,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-auth";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "read:analytics:company",
  },
  {
    title: "Master Data",
    icon: Package,
    permission: "read:product:company",
    items: [
      { title: "Products", href: "/master-data/products", permission: "read:product:company" },
      { title: "Customers", href: "/master-data/customers", permission: "read:customer:company" },
      { title: "Vendors", href: "/master-data/vendors", permission: "read:vendor:company" },
      { title: "Work Centers", href: "/master-data/work-centers", permission: "read:workcenter:factory" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    permission: "read:salesorder:company",
    items: [
      { title: "Quotations", href: "/sales/quotations", permission: "read:quotation:company" },
      { title: "Orders", href: "/sales/orders", permission: "read:salesorder:company" },
    ],
  },
  {
    title: "Planning",
    icon: Factory,
    permission: "run:mrp:company",
    items: [
      { title: "MRP", href: "/planning/mrp", permission: "run:mrp:company" },
      { title: "Production Orders", href: "/planning/production-orders", permission: "read:productionorder:factory" },
      { title: "Capacity", href: "/planning/capacity", permission: "read:capacity:factory" },
    ],
  },
  {
    title: "Procurement",
    icon: Truck,
    permission: "create:purchaseorder:company",
    items: [
      { title: "Requisitions", href: "/procurement/purchase-requisitions", permission: "read:requisition:company" },
      { title: "RFQs", href: "/procurement/rfqs", permission: "read:rfq:company" },
      { title: "Purchase Orders", href: "/procurement/purchase-orders", permission: "read:purchaseorder:company" },
      { title: "Vendors", href: "/master-data/vendors", permission: "read:vendor:company" },
    ],
  },
  {
    title: "Inventory",
    icon: Warehouse,
    permission: "read:inventorylot:warehouse",
    items: [
      { title: "Lots", href: "/inventory/lots", permission: "read:inventorylot:warehouse" },
      { title: "Transactions", href: "/inventory/transactions", permission: "read:inventorytransaction:company" },
      { title: "Transfers", href: "/inventory/transfers", permission: "transfer:inventory:company" },
      { title: "Adjustments", href: "/inventory/adjustments", permission: "adjust:inventory:factory" },
      { title: "Physical Count", href: "/inventory/physical-count", permission: "manage:physicalcount:factory" },
      { title: "ERP Sync", href: "/inventory/erp-sync", permission: "manage:erpsync:company" },
    ],
  },
  {
    title: "Manufacturing",
    icon: Gem,
    permission: "read:operation:workcenter",
    items: [
      { title: "Shop Floor", href: "/manufacturing/shop-floor", permission: "read:operation:workcenter" },
      { title: "Operations", href: "/manufacturing/operations", permission: "read:operation:workcenter" },
      { title: "Job Cards", href: "/manufacturing/job-cards", permission: "read:jobcard:factory" },
      { title: "WIP", href: "/manufacturing/wip", permission: "read:wip:factory" },
      { title: "Diamonds", href: "/manufacturing/diamonds", permission: "read:diamond:factory" },
      { title: "Packets", href: "/manufacturing/packets", permission: "read:diamondpacket:factory" },
    ],
  },
  {
    title: "Quality",
    icon: ShieldCheck,
    permission: "read:inspection:department",
    items: [
      { title: "Inspection Plans", href: "/quality/inspection-plans", permission: "read:inspectionplan:company" },
      { title: "Inspections", href: "/quality/inspections", permission: "read:inspection:department" },
      { title: "NCRs", href: "/quality/ncrs", permission: "read:ncr:factory" },
      { title: "Certificates", href: "/quality/certificates", permission: "read:certificate:factory" },
    ],
  },
  {
    title: "Maintenance",
    icon: Wrench,
    permission: "read:asset:factory",
    items: [
      { title: "Assets", href: "/maintenance/assets", permission: "read:asset:factory" },
      { title: "Work Orders", href: "/maintenance/work-orders", permission: "read:workorder:factory" },
      { title: "PM Schedules", href: "/maintenance/schedules", permission: "read:pmschedule:factory" },
    ],
  },
  {
    title: "Dispatch",
    icon: Truck,
    permission: "read:shipment:company",
    items: [
      { title: "Bagging", href: "/dispatch/bagging", permission: "create:bag:factory" },
      { title: "Shipments", href: "/dispatch/shipments", permission: "read:shipment:company" },
      { title: "Carriers", href: "/dispatch/carriers", permission: "read:carrier:company" },
    ],
  },
  {
    title: "Finance",
    icon: CreditCard,
    permission: "read:invoice:company",
    items: [
      { title: "Invoices", href: "/finance/invoices", permission: "read:invoice:company" },
      { title: "Payments", href: "/finance/payments", permission: "read:payment:company" },
      { title: "Journal Entries", href: "/finance/journal-entries", permission: "read:journalentry:company" },
      { title: "Chart of Accounts", href: "/finance/chart-of-accounts", permission: "read:chartofaccount:company" },
    ],
  },
  {
    title: "Returns",
    icon: RotateCcw,
    permission: "read:returnauth:company",
    items: [
      { title: "Authorizations", href: "/returns/authorizations", permission: "read:returnauth:company" },
      { title: "Receipts", href: "/returns/receipts", permission: "read:returnreceipt:company" },
      { title: "Repair Orders", href: "/returns/repair-orders", permission: "read:repairorder:company" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    permission: "read:analytics:company",
    items: [
      { title: "OEE", href: "/analytics/oee", permission: "read:analytics:factory" },
      { title: "Yield", href: "/analytics/yield", permission: "read:analytics:factory" },
      { title: "On-Time Delivery", href: "/analytics/otd", permission: "read:analytics:company" },
      { title: "WIP Aging", href: "/analytics/wip-aging", permission: "read:analytics:factory" },
      { title: "Capacity", href: "/analytics/capacity", permission: "read:analytics:factory" },
      { title: "Custom Reports", href: "/analytics/custom", permission: "manage:report:company" },
    ],
  },
  {
    title: "AI Assistant",
    icon: Bot,
    permission: "manage:ai:global",
    items: [
      { title: "Chat", href: "/ai/chat", permission: "manage:ai:global" },
    ],
  },
  {
    title: "Admin",
    icon: Shield,
    permission: "manage:users:global",
    items: [
      { title: "Users", href: "/admin/users", permission: "manage:users:global" },
      { title: "Permissions", href: "/admin/permissions", permission: "manage:permissions:global" },
    ],
  },
];

interface SidebarProps {
  desktopExpanded: boolean;
  mobileOpen: boolean;
  onDesktopExpandedChange: (open: boolean) => void;
  onMobileOpenChange: (open: boolean) => void;
}

import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace-store";

export function Sidebar({
  desktopExpanded,
  mobileOpen,
  onDesktopExpandedChange,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname() ?? "";
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const currentPath = activeTabId || pathname;

  const { hasPermission } = usePermissions();
  const [isDesktop, setIsDesktop] = useState(false);
  const showLabels = mobileOpen || desktopExpanded;

  const filteredNavigation = navigation.filter((item) =>
    !item.permission || hasPermission(item.permission)
  );

  useEffect(() => {
    onMobileOpenChange(false);
  }, [currentPath, onMobileOpenChange]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktop(desktopQuery.matches);

    updateViewport();
    desktopQuery.addEventListener("change", updateViewport);
    return () => desktopQuery.removeEventListener("change", updateViewport);
  }, []);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation"
          onClick={() => onMobileOpenChange(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-2rem))] -translate-x-full border-r bg-sidebar shadow-xl transition-[width,transform] duration-200 lg:z-40 lg:translate-x-0 lg:shadow-none",
          mobileOpen && "translate-x-0",
          desktopExpanded ? "lg:w-64" : "lg:w-16"
        )}
        aria-label="Application navigation"
        aria-hidden={!isDesktop && !mobileOpen}
      >
        <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {showLabels && (
            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 items-center gap-2 text-xl font-bold text-foreground"
            >
              <Gem className="h-6 w-6 text-primary" />
              <span className="truncate">DiamondFlow</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => onDesktopExpandedChange(!desktopExpanded)}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
            aria-label={
              desktopExpanded ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            {desktopExpanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onMobileOpenChange(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            aria-label="Close navigation"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => (
              <li key={item.title}>
                {item.items ? (
                  <CollapsibleNavItem
                    item={item}
                    pathname={currentPath}
                    open={showLabels}
                    hasPermission={hasPermission}
                    onNavigate={() => onMobileOpenChange(false)}
                  />
                ) : (
                  <NavLink
                    href={item.href}
                    icon={item.icon}
                    label={item.title}
                    isActive={currentPath === item.href}
                    open={showLabels}
                    onNavigate={() => onMobileOpenChange(false)}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t p-3">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              showLabels ? "hover:bg-accent" : "justify-center"
            )}
            onClick={() => onMobileOpenChange(false)}
            aria-label={!showLabels ? "Profile" : undefined}
            title={!showLabels ? "Profile" : undefined}
          >
            <UserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
            {showLabels && <span>Profile</span>}
          </Link>
        </div>
      </div>
      </aside>
    </>
  );
}

interface CollapsibleNavItemProps {
  item: typeof navigation[0];
  pathname: string;
  open: boolean;
  hasPermission: (permission: string) => boolean;
  onNavigate: () => void;
}

function CollapsibleNavItem({
  item,
  pathname,
  open,
  hasPermission,
  onNavigate,
}: CollapsibleNavItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = Boolean(item.items?.some((child) => pathname.startsWith(child.href)));

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  const filteredItems = item.items?.filter((child) => 
    !child.permission || hasPermission(child.permission)
  ) || [];

  if (!filteredItems.length) return null;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          open
            ? "hover:bg-accent"
            : "justify-center hover:bg-accent",
          isActive && "bg-accent text-accent-foreground"
        )}
        aria-expanded={expanded}
        aria-label={item.title}
        title={!open ? item.title : undefined}
      >
        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {open && (
          <>
            <span className="flex-1">{item.title}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </>
        )}
      </button>
      {expanded && open && (
        <ul className="ml-6 space-y-1 border-l border-border pl-2">
          {filteredItems.map((child) => (
            <li key={child.title}>
              <NavLink
                href={child.href}
                label={child.title}
                isActive={pathname === child.href}
                open={true}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  open: boolean;
  onNavigate?: () => void;
}

function NavLink({
  href,
  icon,
  label,
  isActive,
  open,
  onNavigate,
}: NavLinkProps) {
  const Icon = icon;
  const router = useRouter();
  const addTab = useWorkspaceStore((state) => state.addTab);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    addTab({ id: href, title: label });
    router.push(href);
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <a
      href={href}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        open
          ? isActive
            ? "bg-accent text-accent-foreground font-semibold"
            : "hover:bg-accent"
          : "justify-center hover:bg-accent",
        isActive && "font-semibold"
      )}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={!open ? label : undefined}
      title={!open ? label : undefined}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
      {open && <span>{label}</span>}
    </a>
  );
}
