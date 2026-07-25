"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PurchaseRequisition } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewRequisitionPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryClient = useQueryClient();
  const [lines, setLines] = useState([{ itemId: "", itemName: "", qty: 1, uom: "PCS", neededBy: "" }]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<PurchaseRequisition>("/purchase-requisitions", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["purchase-requisitions"] }); router.push("/procurement/purchase-requisitions"); },
  });

  const addLine = () => setLines([...lines, { itemId: "", itemName: "", qty: 1, uom: "PCS", neededBy: "" }]);
  const removeLine = (i: number) => { if (lines.length > 1) setLines(lines.filter((_, idx) => idx !== i)); };
  const updateLine = (i: number, f: string, v: any) => { const u = [...lines]; (u[i] as any)[f] = v; setLines(u); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ companyId: "default", lines: lines.filter((l) => l.itemId || l.itemName) });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/procurement/purchase-requisitions"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold tracking-tight">New Purchase Requisition</h1><p className="text-muted-foreground">Create a purchase request for materials or services</p></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="mr-2 h-4 w-4" />Add Line</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lines.map((line, i) => (
                    <div key={i} className="flex items-end gap-3 rounded-lg border p-3">
                      <div className="flex-[2] space-y-2">
                        <Label>Item Name</Label>
                        <Input value={line.itemName} onChange={(e) => updateLine(i, "itemName", e.target.value)} required placeholder="e.g. Raw diamond rough" />
                      </div>
                      <div className="w-20 space-y-2">
                        <Label>Qty</Label>
                        <Input type="number" min={0.000001} step={0.000001} value={line.qty} onChange={(e) => updateLine(i, "qty", parseFloat(e.target.value) || 0)} required />
                      </div>
                      <div className="w-20 space-y-2">
                        <Label>UOM</Label>
                        <Input value={line.uom} onChange={(e) => updateLine(i, "uom", e.target.value)} required />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Needed By</Label>
                        <Input type="date" value={line.neededBy} onChange={(e) => updateLine(i, "neededBy", e.target.value)} required />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)} disabled={lines.length === 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Link href="/procurement/purchase-requisitions"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Requisition"}</Button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
