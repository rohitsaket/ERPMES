"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { InventoryLot, Warehouse } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight } from "lucide-react";

export default function TransfersPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryClient = useQueryClient();
  const [lotId, setLotId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [qty, setQty] = useState(0);

  const { data: lots } = useQuery({ queryKey: ["inventory-lots-dropdown"], queryFn: () => api.get<any>("/inventory/lots", { limit: 200 }) });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses-dropdown"], queryFn: () => api.get<any>("/warehouses", { limit: 100 }) });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/transactions/transfer", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["inventory-lots"] }); queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] }); setLotId(""); setToWarehouseId(""); setQty(0); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ lotId, fromWarehouseId: lots?.data?.find((l: InventoryLot) => l.id === lotId)?.warehouseId, toWarehouseId, qty, uom: "PCS" }); };

  const selectedLot = lots?.data?.find((l: InventoryLot) => l.id === lotId);

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center gap-4">
          <ArrowRight className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Inventory Transfers</h1><p className="text-muted-foreground">Move stock between warehouses</p></div>
        </div>
        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader><CardTitle>New Transfer</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-2"><Label>Lot</Label>
                <Select value={lotId} onValueChange={setLotId} required>
                  <SelectTrigger><SelectValue placeholder="Select lot" /></SelectTrigger>
                  <SelectContent>{lots?.data?.map((l: InventoryLot) => <SelectItem key={l.id} value={l.id}>{l.lotNumber} - {l.itemName} ({l.qty} {l.uom})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {selectedLot && <p className="text-sm text-muted-foreground">Available: {selectedLot.qty} {selectedLot.uom} in {selectedLot.warehouse?.name}</p>}
              <div className="space-y-2"><Label>To Warehouse</Label>
                <Select value={toWarehouseId} onValueChange={setToWarehouseId} required>
                  <SelectTrigger><SelectValue placeholder="Destination warehouse" /></SelectTrigger>
                  <SelectContent>{warehouses?.data?.filter((w: Warehouse) => w.id !== selectedLot?.warehouseId).map((w: Warehouse) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={0} step={0.000001} value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 0)} required /></div>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferring...</> : "Transfer"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
