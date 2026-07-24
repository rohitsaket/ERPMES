"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { InventoryLot } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

const statusColors: Record<string, string> = { AVAILABLE: "bg-emerald-100 text-emerald-700", RESERVED: "bg-blue-100 text-blue-700", QUARANTINED: "bg-amber-100 text-amber-700", BLOCKED: "bg-red-100 text-red-700", EXPIRED: "bg-gray-100 text-gray-500" };

export default function LotDetailPage() {
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

  const { data: lot, isLoading } = useQuery<InventoryLot>({ queryKey: ["inventory-lot", id], queryFn: () => api.get(`/inventory/lots/${id}`), enabled: !!id });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!lot) return <AppShell><div className="text-center py-20"><p className="text-lg font-medium">Lot not found</p><Link href="/inventory/lots"><Button variant="link">Back</Button></Link></div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/inventory/lots"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">Lot {lot.lotNumber}</h1></div>
          <Badge className={statusColors[lot.status] || "bg-gray-100 text-sm px-3 py-1"}>{lot.status}</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Item</CardTitle></CardHeader><CardContent><p className="text-lg font-medium">{lot.itemName}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Quantity</CardTitle></CardHeader><CardContent><p className="text-lg font-medium">{lot.qty} {lot.uom}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Warehouse</CardTitle></CardHeader><CardContent><p className="text-lg font-medium">{lot.warehouse?.name || lot.warehouseId.slice(0, 8)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Lot Number</CardTitle></CardHeader><CardContent><p className="font-mono">{lot.lotNumber}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Expiry</CardTitle></CardHeader><CardContent><p>{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : "No expiry"}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Certificate</CardTitle></CardHeader><CardContent><p>{lot.certificateId ? lot.certificateId.slice(0, 8) : "None"}</p></CardContent></Card>
        </div>
        {lot.transactions && lot.transactions.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">Ref</th><th className="pb-3 font-medium">Timestamp</th></tr></thead>
                <tbody>
                  {lot.transactions.map((txn) => (
                    <tr key={txn.id} className="border-b last:border-0">
                      <td className="py-3"><Badge variant="outline">{txn.type}</Badge></td>
                      <td className="py-3">{txn.qty} {txn.uom}</td>
                      <td className="py-3 text-muted-foreground">{txn.refType ? `${txn.refType}:${txn.refId?.slice(0, 8)}` : "-"}</td>
                      <td className="py-3 text-muted-foreground">{new Date(txn.timestamp).toLocaleString()}</td>
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
