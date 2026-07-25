"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Vendor, PurchaseOrder } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface LineItem {
  itemId: string;
  itemName: string;
  qty: number;
  uom: string;
  unitPrice: number;
  dueDate: string;
}

export default function NewPurchaseOrderPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryClient = useQueryClient();
  const [vendorId, setVendorId] = useState("");
  const [lines, setLines] = useState([{ itemId: "", itemName: "", qty: 1, uom: "PCS", unitPrice: 0, dueDate: "" }]);

  const { data: vendors } = useQuery({ queryKey: ["vendors"], queryFn: () => api.get<any>("/vendors", { limit: 100 }) });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<PurchaseOrder>("/purchase-orders", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }); router.push("/procurement/purchase-orders"); },
  });

  const addLine = () => setLines([...lines, { itemId: "", itemName: "", qty: 1, uom: "PCS", unitPrice: 0, dueDate: "" }]);
  const removeLine = (i: number) => { if (lines.length > 1) setLines(lines.filter((_, idx) => idx !== i)); };
  const updateLine = (i: number, f: string, v: any) => { const u = [...lines]; (u[i] as any)[f] = v; setLines(u); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ companyId: "default", vendorId, lines: lines.filter((l) => l.itemId || l.itemName) });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/procurement/purchase-orders"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold tracking-tight">New Purchase Order</h1><p className="text-muted-foreground">Create a purchase order for a vendor</p></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Vendor</CardTitle></CardHeader>
              <CardContent className="max-w-sm space-y-2">
                <Label>Vendor</Label>
                <Select value={vendorId} onValueChange={setVendorId} required>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors?.data?.map((v: Vendor) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.code})</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="mr-2 h-4 w-4" />Add Line</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lines.map((line, i) => (
                    <div key={i} className="flex items-end gap-3 rounded-lg border p-3 flex-wrap">
                      <div className="flex-1 space-y-2 min-w-[140px]">
                        <Label>Item</Label>
                        <Input value={line.itemName} onChange={(e) => updateLine(i, "itemName", e.target.value)} required placeholder="Item name" />
                      </div>
                      <div className="w-20 space-y-2"><Label>Qty</Label><Input type="number" min={0.000001} step={0.000001} value={line.qty} onChange={(e) => updateLine(i, "qty", parseFloat(e.target.value) || 0)} required /></div>
                      <div className="w-20 space-y-2"><Label>UOM</Label><Input value={line.uom} onChange={(e) => updateLine(i, "uom", e.target.value)} required /></div>
                      <div className="w-28 space-y-2"><Label>Unit Price</Label><Input type="number" min={0} step={0.01} value={line.unitPrice} onChange={(e) => updateLine(i, "unitPrice", parseFloat(e.target.value) || 0)} required /></div>
                      <div className="w-32 space-y-2"><Label>Due Date</Label><Input type="date" value={line.dueDate} onChange={(e) => updateLine(i, "dueDate", e.target.value)} required /></div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)} disabled={lines.length === 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Link href="/procurement/purchase-orders"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create PO"}</Button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
