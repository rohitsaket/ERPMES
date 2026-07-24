"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { InventoryLot, Warehouse } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

export default function NewLotPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryClient = useQueryClient();
  const [itemName, setItemName] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [qty, setQty] = useState(1);
  const [uom, setUom] = useState("PCS");
  const [lotNumber, setLotNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: () => api.get<any>("/warehouses", { limit: 100 }) });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<InventoryLot>("/inventory/lots", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["inventory-lots"] }); router.push("/inventory/lots"); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ companyId: "default", itemId: lotNumber, itemName, warehouseId, qty, uom, lotNumber, expiryDate: expiryDate || undefined });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/inventory/lots"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold tracking-tight">New Inventory Lot</h1><p className="text-muted-foreground">Create a new stock lot</p></div>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle>Lot Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Lot Number</Label><Input value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} required placeholder="e.g. LOT-001" /></div>
              <div className="space-y-2"><Label>Item Name</Label><Input value={itemName} onChange={(e) => setItemName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId} required>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>{warehouses?.data?.map((w: Warehouse) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={0} step={0.000001} value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 0)} required /></div>
              <div className="space-y-2"><Label>UOM</Label><Input value={uom} onChange={(e) => setUom(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3 mt-6">
            <Link href="/inventory/lots"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Lot"}</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
