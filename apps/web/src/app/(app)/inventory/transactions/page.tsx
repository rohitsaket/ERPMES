"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, InventoryTransaction } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const typeColors: Record<string, string> = { RECEIPT: "bg-emerald-100 text-emerald-700", ISSUE: "bg-red-100 text-red-700", TRANSFER_IN: "bg-blue-100 text-blue-700", TRANSFER_OUT: "bg-amber-100 text-amber-700", ADJUSTMENT: "bg-purple-100 text-purple-700" };

export default function TransactionsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<PaginatedResponse<InventoryTransaction>>({
    queryKey: ["inventory-transactions", page],
    queryFn: () => api.get("/inventory/transactions", { page, limit: 30 }),
  });

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center gap-4">
          <ArrowUpDown className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Transactions</h1><p className="text-muted-foreground">Inventory movement history</p></div>
        </div>
        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            : !data?.data.length ? <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
            : <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm"><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Lot</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">From/To</th><th className="pb-3 font-medium">Ref</th><th className="pb-3 font-medium">Timestamp</th></tr></thead>
                  <tbody>
                    {data.data.map((txn) => (
                      <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3"><Badge className={typeColors[txn.type] || "bg-gray-100"}>{txn.type}</Badge></td>
                        <td className="py-3 font-mono text-xs">{txn.lot?.lotNumber || txn.lotId.slice(0, 8)}</td>
                        <td className="py-3">{txn.qty} {txn.uom}</td>
                        <td className="py-3 text-muted-foreground">{txn.fromLocation ? `${txn.fromLocation.slice(0, 6)} → ${txn.toLocation?.slice(0, 6) || "-"}` : txn.toLocation?.slice(0, 6) || "-"}</td>
                        <td className="py-3 text-muted-foreground">{txn.refType || "-"}</td>
                        <td className="py-3 text-muted-foreground">{new Date(txn.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 shrink-0 mt-4 border-t">
                <p className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
