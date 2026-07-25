import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Lazy load actual pages so we don't block the main thread and keep the bundle small.
const DashboardPage = dynamic(() => import("@/app/(app)/dashboard/page"));
const VendorsPage = dynamic(() => import("@/app/(app)/master-data/vendors/page"));
// Fallback empty page for unmapped routes
const FallbackPage = () => <div className="p-6 text-muted-foreground">Module not yet configured for tabs.</div>;

export function getComponentForUrl(url: string): ComponentType<any> {
  if (url === "/dashboard") return DashboardPage;
  if (url.startsWith("/master-data/vendors")) return VendorsPage;
  
  // You can add more mappings here as you migrate pages:
  // if (url.startsWith("/sales/customers")) return CustomersPage;
  
  return FallbackPage;
}
