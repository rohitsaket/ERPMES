"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Customer, Product, SalesOrder } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  Boolean(publishableKey) &&
  !publishableKey?.includes("your_clerk_publishable_key_here");

interface LineItem {
  productId: string;
  qty: number;
  uom: string;
  unitPrice: number;
  dueDate: string;
}

export default function NewSalesOrderPage() {
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
  return <AuthenticatedNewSalesOrderPage />;
}

function AuthenticatedNewSalesOrderPage() {
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

  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { productId: "", qty: 1, uom: "PCS", unitPrice: 0, dueDate: "" },
  ]);

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<any>("/customers", { limit: 100 }),
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<any>("/products", { limit: 100 }),
  });

  const { data: quotations } = useQuery({
    queryKey: ["quotations-dropdown"],
    queryFn: () => api.get<any>("/quotations", { limit: 100, status: "ACCEPTED" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post<SalesOrder>("/sales-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      router.push("/sales/orders");
    },
  });

  const addLine = () => {
    setLines([...lines, { productId: "", qty: 1, uom: "PCS", unitPrice: 0, dueDate: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lines];
    (updated[index] as any)[field] = value;
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      customerId,
      companyId: "default",
      quotationId: quotationId || undefined,
      requiredDate: requiredDate || undefined,
      lines: lines.map((l) => ({
        productId: l.productId,
        qty: l.qty,
        uom: l.uom,
        unitPrice: l.unitPrice,
        dueDate: l.dueDate || undefined,
      })),
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/sales/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Sales Order</h1>
            <p className="text-muted-foreground">Create a new sales order for a customer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={customerId} onValueChange={setCustomerId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.data?.map((c: Customer) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quotation">From Quotation (optional)</Label>
                  <Select value={quotationId} onValueChange={setQuotationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {quotations?.data?.map((q: any) => (
                        <SelectItem key={q.id} value={q.id}>{q.id.slice(0, 8)} - {q.customer?.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredDate">Required Date</Label>
                  <Input
                    id="requiredDate"
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="mr-2 h-4 w-4" /> Add Line
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lines.map((line, index) => (
                    <div key={index} className="flex items-end gap-3 rounded-lg border p-3">
                      <div className="flex-[2] space-y-2">
                        <Label>Product</Label>
                        <Select value={line.productId} onValueChange={(v) => updateLine(index, "productId", v)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.data?.map((p: Product) => (
                              <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20 space-y-2">
                        <Label>Qty</Label>
                        <Input type="number" min={0.000001} step={0.000001} value={line.qty}
                          onChange={(e) => updateLine(index, "qty", parseFloat(e.target.value) || 0)} required />
                      </div>
                      <div className="w-20 space-y-2">
                        <Label>UOM</Label>
                        <Input value={line.uom}
                          onChange={(e) => updateLine(index, "uom", e.target.value)} required />
                      </div>
                      <div className="w-28 space-y-2">
                        <Label>Unit Price</Label>
                        <Input type="number" min={0} step={0.01} value={line.unitPrice}
                          onChange={(e) => updateLine(index, "unitPrice", parseFloat(e.target.value) || 0)} required />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={line.dueDate}
                          onChange={(e) => updateLine(index, "dueDate", e.target.value)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon"
                        onClick={() => removeLine(index)} disabled={lines.length === 1}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/sales/orders">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  "Create Order"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
