"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { SalesOrder } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  Boolean(publishableKey) &&
  !publishableKey?.includes("your_clerk_publishable_key_here");

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function SalesOrderDetailPage() {
  if (!isClerkConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4">
        <div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Authentication setup required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Configure Clerk in <code>apps/web/.env.local</code> before opening this page.
          </p>
        </div>
      </main>
    );
  }
  return <AuthenticatedSalesOrderDetailPage />;
}

function AuthenticatedSalesOrderDetailPage() {
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

  const { data: order, isLoading } = useQuery<SalesOrder>({
    queryKey: ["sales-order", id],
    queryFn: () => api.get(`/sales-orders/${id}`),
    enabled: !!id,
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
          <p className="text-lg font-medium">Sales order not found</p>
          <Link href="/sales/orders">
            <Button variant="link" className="mt-2">Back to orders</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const total = order.lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/sales/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Sales Order {id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              Ordered {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors[order.status] || "bg-gray-100 text-sm px-3 py-1"}>
            {order.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{order.customer?.name || "Unknown"}</p>
              {order.customer && (
                <p className="text-sm text-muted-foreground">Code: {order.customer.code}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {order.requiredDate
                  ? new Date(order.requiredDate).toLocaleDateString()
                  : "Not specified"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotation</CardTitle>
            </CardHeader>
            <CardContent>
              {order.quotation ? (
                <Link href={`/sales/quotations/${order.quotationId}`}>
                  <Button variant="link" className="p-0 h-auto">
                    View Quotation
                  </Button>
                </Link>
              ) : (
                <p className="text-muted-foreground">No quotation linked</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">UOM</th>
                  <th className="pb-3 font-medium">Unit Price</th>
                  <th className="pb-3 font-medium">Allocated</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0">
                    <td className="py-3">{line.product?.name || line.productId.slice(0, 8)}</td>
                    <td className="py-3">{line.qty}</td>
                    <td className="py-3">{line.uom}</td>
                    <td className="py-3">${line.unitPrice.toFixed(2)}</td>
                    <td className="py-3">{line.allocatedQty}</td>
                    <td className="py-3 text-right font-medium">
                      ${(line.qty * line.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-bold">
                  <td colSpan={5} className="py-3 text-right">Total</td>
                  <td className="py-3 text-right">${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {order.productionOrders && order.productionOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Production Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.productionOrders.map((po: any) => (
                  <div key={po.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-mono text-sm">{po.orderNo || po.id.slice(0, 8)}</span>
                    <Badge>{po.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
