"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Customer, Product, SalesOrder } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  productId: string;
  qty: number;
  uom: string;
  unitPrice: number;
  dueDate: string;
}

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewOrderModal({ open, onOpenChange }: NewOrderModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [customerId, setCustomerId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { productId: "", qty: 1, uom: "PCS", unitPrice: 0, dueDate: "" },
  ]);

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<any>("/customers", { limit: 100 }),
    enabled: open,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<any>("/products", { limit: 100 }),
    enabled: open,
  });

  const { data: quotations } = useQuery({
    queryKey: ["quotations-dropdown"],
    queryFn: () => api.get<any>("/quotations", { limit: 100, status: "ACCEPTED" }),
    enabled: open,
  });

  const resetForm = () => {
    setCustomerId("");
    setQuotationId("");
    setRequiredDate("");
    setLines([{ productId: "", qty: 1, uom: "PCS", unitPrice: 0, dueDate: "" }]);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post<SalesOrder>("/sales-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast({
        title: "Sales Order Created",
        description: "New order has been successfully created.",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error Creating Order",
        description: err?.message || "Failed to create sales order. Please try again.",
        variant: "destructive",
      });
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
    if (!customerId) {
      toast({ title: "Customer Required", description: "Please select a customer.", variant: "destructive" });
      return;
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent open={open} onOpenChange={onOpenChange} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Sales Order</DialogTitle>
          <DialogDescription>
            Fill in the customer details and line items to generate a new sales order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Order Details */}
          <div className="grid gap-4 sm:grid-cols-3 bg-muted/30 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="modal-customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId} required>
                <SelectTrigger id="modal-customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.data?.map((c: Customer) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-quotation">Quotation (Optional)</Label>
              <Select value={quotationId} onValueChange={setQuotationId}>
                <SelectTrigger id="modal-quotation">
                  <SelectValue placeholder="Select quotation" />
                </SelectTrigger>
                <SelectContent>
                  {quotations?.data?.map((q: any) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.id.slice(0, 8)} - {q.customer?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-required-date">Required Date</Label>
              <Input
                id="modal-required-date"
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {lines.map((line, index) => (
                <div key={index} className="flex items-end gap-3 rounded-lg border p-3 bg-card shadow-sm">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Product *</Label>
                    <Select
                      value={line.productId}
                      onValueChange={(v) => updateLine(index, "productId", v)}
                      required
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.data?.map((p: Product) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.sku} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-20 space-y-1.5">
                    <Label className="text-xs">Qty *</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      className="h-9"
                      value={line.qty}
                      onChange={(e) => updateLine(index, "qty", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="w-20 space-y-1.5">
                    <Label className="text-xs">UOM</Label>
                    <Input
                      className="h-9"
                      value={line.uom}
                      onChange={(e) => updateLine(index, "uom", e.target.value)}
                      required
                    />
                  </div>

                  <div className="w-24 space-y-1.5">
                    <Label className="text-xs">Unit Price *</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="h-9"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="w-28 space-y-1.5">
                    <Label className="text-xs">Due Date</Label>
                    <Input
                      type="date"
                      className="h-9 text-xs"
                      value={line.dueDate}
                      onChange={(e) => updateLine(index, "dueDate", e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeLine(index)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Sales Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
