"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { Product, ProductionOrder } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface OperationRow {
  seq: number;
  departmentId: string;
  workCenterId: string;
  setupMin: number;
  runMin: number;
}

export default function NewProductionOrderPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
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
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [operations, setOperations] = useState<OperationRow[]>([
    { seq: 10, departmentId: "", workCenterId: "", setupMin: 0, runMin: 0 },
  ]);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<any>("/products", { limit: 100 }),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<any>("/departments", { limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post<ProductionOrder>("/production-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-orders"] });
      router.push("/planning/production-orders");
    },
  });

  const addOp = () => {
    const maxSeq = operations.reduce((m, o) => Math.max(m, o.seq), 0);
    setOperations([...operations, { seq: maxSeq + 10, departmentId: "", workCenterId: "", setupMin: 0, runMin: 0 }]);
  };

  const removeOp = (index: number) => {
    if (operations.length > 1) setOperations(operations.filter((_, i) => i !== index));
  };

  const updateOp = (index: number, field: keyof OperationRow, value: any) => {
    const updated = [...operations];
    (updated[index] as any)[field] = value;
    setOperations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      companyId: "default",
      productId,
      qty,
      priority,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      operations: operations.filter((o) => o.departmentId),
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/planning/production-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Production Order</h1>
            <p className="text-muted-foreground">Create a new production order</p>
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
                  <Label htmlFor="product">Product</Label>
                  <Select value={productId} onValueChange={setProductId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.data?.map((p: Product) => (
                        <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input id="qty" type="number" min={0.000001} step={0.000001} value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input id="priority" type="number" min={0} value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate}
                    onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Routing / Operations</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addOp}>
                  <Plus className="mr-2 h-4 w-4" /> Add Operation
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operations.map((op, index) => (
                    <div key={index} className="flex items-end gap-3 rounded-lg border p-3">
                      <div className="w-16 space-y-2">
                        <Label>Seq</Label>
                        <Input type="number" value={op.seq}
                          onChange={(e) => updateOp(index, "seq", parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="flex-[2] space-y-2">
                        <Label>Department</Label>
                        <Select value={op.departmentId}
                          onValueChange={(v) => updateOp(index, "departmentId", v)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.data?.map((d: any) => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Setup (min)</Label>
                        <Input type="number" min={0} value={op.setupMin}
                          onChange={(e) => updateOp(index, "setupMin", parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Run (min)</Label>
                        <Input type="number" min={0} value={op.runMin}
                          onChange={(e) => updateOp(index, "runMin", parseInt(e.target.value) || 0)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon"
                        onClick={() => removeOp(index)} disabled={operations.length === 1}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/planning/production-orders">
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
    </>
  );
}
