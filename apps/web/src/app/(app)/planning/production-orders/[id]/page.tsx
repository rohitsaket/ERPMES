"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { ProductionOrder } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Play, XCircle } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PLANNED: "bg-gray-100 text-gray-700",
  RELEASED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const opStatusColors: Record<string, string> = {
  QUEUED: "bg-gray-100 text-gray-600",
  RUNNING: "bg-blue-100 text-blue-700",
  PAUSED: "bg-amber-100 text-amber-700",
  TRANSFERRED: "bg-violet-100 text-violet-700",
  HELD: "bg-red-100 text-red-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export default function ProductionOrderDetailPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const params = useParams();
  const id = (params?.id as string) ?? "";
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<ProductionOrder>({
    queryKey: ["production-order", id],
    queryFn: () => api.get(`/production-orders/${id}`),
    enabled: !!id,
  });

  const releaseMutation = useMutation({
    mutationFn: () => api.post(`/production-orders/${id}/release`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production-order", id] }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/production-orders/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production-order", id] }),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-lg font-medium">Production order not found</p>
          <Link href="/planning/production-orders">
            <Button variant="link" className="mt-2">Back to orders</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalRunMin = order.operations.reduce((s, o) => s + o.runMin, 0);
  const totalSetupMin = order.operations.reduce((s, o) => s + o.setupMin, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/planning/production-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Production Order {id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors[order.status] || "bg-gray-100 text-sm px-3 py-1"}>
            {order.status}
          </Badge>
        </div>

        <div className="flex gap-2">
          {order.status === "PLANNED" && (
            <Button onClick={() => releaseMutation.mutate()} disabled={releaseMutation.isPending}>
              <Play className="mr-2 h-4 w-4" /> Release
            </Button>
          )}
          {(order.status === "PLANNED" || order.status === "RELEASED") && (
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{order.product?.name || order.productId.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground">Qty: {order.qty}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{order.priority}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {order.startDate ? new Date(order.startDate).toLocaleDateString() : "Not set"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "Not set"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Operations ({order.operations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Seq</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Work Center</th>
                  <th className="pb-3 font-medium">Setup</th>
                  <th className="pb-3 font-medium">Run</th>
                  <th className="pb-3 font-medium">Complete</th>
                  <th className="pb-3 font-medium">Scrap</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.operations.map((op) => (
                  <tr key={op.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-mono text-xs">{op.seq}</td>
                    <td className="py-3">{op.department?.name || op.departmentId.slice(0, 8)}</td>
                    <td className="py-3">{op.workCenter?.name || op.workCenterId?.slice(0, 8) || "-"}</td>
                    <td className="py-3">{op.setupMin}m</td>
                    <td className="py-3">{op.runMin}m</td>
                    <td className="py-3">{op.qtyComplete}</td>
                    <td className="py-3">{op.qtyScrap}</td>
                    <td className="py-3">
                      <Badge className={opStatusColors[op.status] || "bg-gray-100"}>
                        {op.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={3} className="py-3 text-right">Totals</td>
                  <td className="py-3">{totalSetupMin}m</td>
                  <td className="py-3">{totalRunMin}m</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {order.jobCards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Job Cards ({order.jobCards.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Op Seq</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Assigned To</th>
                    <th className="pb-3 font-medium">Issued At</th>
                  </tr>
                </thead>
                <tbody>
                  {order.jobCards.map((jc) => (
                    <tr key={jc.id} className="border-b last:border-0">
                      <td className="py-3">{jc.opSeq}</td>
                      <td className="py-3">
                        <Badge className={opStatusColors[jc.status] || "bg-gray-100"}>
                          {jc.status}
                        </Badge>
                      </td>
                      <td className="py-3">{jc.assignedTo || "-"}</td>
                      <td className="py-3">{jc.issuedAt ? new Date(jc.issuedAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
