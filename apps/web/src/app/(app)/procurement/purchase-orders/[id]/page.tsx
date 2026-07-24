"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PurchaseOrder } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send, PackageCheck, XCircle } from "lucide-react";
import Link from "next/link";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-700", PLACED: "bg-blue-100 text-blue-700", RECEIVED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-700" };

export default function PurchaseOrderDetailPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const params = useParams();
  const id = (params?.id as string) ?? "";
  const queryClient = useQueryClient();

  const { data: po, isLoading } = useQuery<PurchaseOrder>({ queryKey: ["purchase-order", id], queryFn: () => api.get(`/purchase-orders/${id}`), enabled: !!id });

  const placeMutation = useMutation({ mutationFn: () => api.post(`/purchase-orders/${id}/place`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-order", id] }) });
  const receiveMutation = useMutation({ mutationFn: () => api.post(`/purchase-orders/${id}/receive`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-order", id] }) });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!po) return <AppShell><div className="text-center py-20"><p className="text-lg font-medium">Purchase order not found</p><Link href="/procurement/purchase-orders"><Button variant="link">Back</Button></Link></div></AppShell>;

  const total = po.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/procurement/purchase-orders"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">PO {id.slice(0, 8)}</h1></div>
          <Badge className={statusColors[po.status] || "bg-gray-100 text-sm px-3 py-1"}>{po.status}</Badge>
        </div>
        <div className="flex gap-2">
          {po.status === "DRAFT" && <Button onClick={() => placeMutation.mutate()} disabled={placeMutation.isPending}><Send className="mr-2 h-4 w-4" />Place Order</Button>}
          {po.status === "PLACED" && <Button onClick={() => receiveMutation.mutate()} disabled={receiveMutation.isPending}><PackageCheck className="mr-2 h-4 w-4" />Receive</Button>}
        </div>
        <Card>
          <CardHeader><CardTitle>Vendor</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-medium">{po.vendor?.name || po.vendorId.slice(0, 8)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Line Items ({po.lines.length})</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Item</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">UOM</th><th className="pb-3 font-medium">Unit Price</th><th className="pb-3 font-medium">Received</th><th className="pb-3 font-medium text-right">Total</th><th className="pb-3 font-medium">Due</th></tr></thead>
              <tbody>
                {po.lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0">
                    <td className="py-3">{line.itemName}</td><td className="py-3">{line.qty}</td><td className="py-3">{line.uom}</td>
                    <td className="py-3">${line.unitPrice.toFixed(2)}</td><td className="py-3">{line.receivedQty}</td>
                    <td className="py-3 text-right font-medium">${(line.qty * line.unitPrice).toFixed(2)}</td>
                    <td className="py-3 text-muted-foreground">{new Date(line.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t font-bold"><td colSpan={5} className="py-3 text-right">Total</td><td className="py-3 text-right">${total.toFixed(2)}</td><td /></tr></tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
