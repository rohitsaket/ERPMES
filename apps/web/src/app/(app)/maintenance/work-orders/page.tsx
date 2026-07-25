"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { WorkOrder, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, Eye, Plus } from "lucide-react";

const statusColors: Record<string, string> = { OPEN: "bg-blue-100 text-blue-700", IN_PROGRESS: "bg-amber-100 text-amber-700", COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-gray-100 text-gray-600" };
const priColors: Record<string, string> = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-amber-100 text-amber-700", LOW: "bg-emerald-100 text-emerald-700" };

export default function WorkOrdersPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<WorkOrder>>({
    queryKey: ["maintenance-work-orders"],
    queryFn: () => api.get("/maintenance/work-orders", { limit: 50 }),
  });

  const orders = data?.data || [];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Work Orders</h1><p className="text-muted-foreground">{orders.length} orders</p></div>
          </div>
          <Button disabled title="Work-order creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Work Order</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : orders.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No work orders found</p></CardContent></Card>
        : <div className="grid gap-4">
            {orders.map((wo) => (
              <Card key={wo.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[wo.status] || "bg-gray-100"}>{wo.status}</Badge>
                    <Badge className={priColors[wo.priority] || "bg-gray-100"}>{wo.priority}</Badge>
                    <div>
                      <p className="font-medium">{wo.asset?.name || wo.assetId} — {wo.type}</p>
                      <p className="text-sm text-muted-foreground">{wo.assignedTo ? `Assigned to: ${wo.assignedTo}` : "Unassigned"} {wo.dueDate ? `| Due: ${new Date(wo.dueDate).toLocaleDateString()}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/maintenance/work-orders/${wo.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
