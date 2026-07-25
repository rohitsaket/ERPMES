"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, InventoryLot } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  RESERVED: "bg-blue-100 text-blue-700",
  QUARANTINED: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default function LotsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<InventoryLot>>({
    queryKey: ["inventory-lots", page, search],
    queryFn: () => api.get("/inventory/lots", { page, limit: 20, search }),
  });

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div><h1 className="text-3xl font-bold tracking-tight">Inventory Lots</h1><p className="text-muted-foreground">Track stock by lot number</p></div>
          <Link href="/inventory/lots/new"><Button><Plus className="mr-2 h-4 w-4" />New Lot</Button></Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search lots..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
        </div>
        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader><CardTitle>All Lots</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            : !data?.data.length ? <div className="flex flex-col items-center py-12 text-muted-foreground"><Package className="h-12 w-12 mb-4 opacity-50" /><p className="text-lg font-medium">No lots yet</p></div>
            : <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm"><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Lot #</th><th className="pb-3 font-medium">Item</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">Warehouse</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Expiry</th><th className="pb-3 font-medium">Actions</th></tr></thead>
                  <tbody>
                    {data.data.map((lot) => (
                      <tr key={lot.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-xs">{lot.lotNumber}</td>
                        <td className="py-3">{lot.itemName}</td>
                        <td className="py-3">{lot.qty} {lot.uom}</td>
                        <td className="py-3 text-muted-foreground">{lot.warehouse?.name || lot.warehouseId.slice(0, 8)}</td>
                        <td className="py-3"><Badge className={statusColors[lot.status] || "bg-gray-100"}>{lot.status}</Badge></td>
                        <td className="py-3 text-muted-foreground">{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : "-"}</td>
                        <td className="py-3"><Link href={`/inventory/lots/${lot.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 shrink-0 mt-4 border-t">
                <p className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)</p>
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
