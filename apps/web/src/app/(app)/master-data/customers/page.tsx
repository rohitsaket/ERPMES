"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Customer } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  BLOCKED: "bg-red-100 text-red-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
};

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["customers", { search, page, pageSize }],
    queryFn: () => api.get<{ data: Customer[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/customers", { search, page, limit: pageSize }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (error) return <AppShell><div className="text-center py-20 text-red-600">Failed to load customers</div></AppShell>;

  const customers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your customer accounts</p>
          </div>
          <Button disabled title="Customer creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Customer</Button>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
            <CardTitle>Customers List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No customers found</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto border rounded-md">
                  <table className="w-full text-sm relative">
                    <thead className="sticky top-0 bg-card z-10 shadow-sm">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Code</th>
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium tabular-nums">Credit Limit</th>
                        <th className="pb-3 font-medium">Payment Terms</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-mono">{customer.code}</td>
                          <td className="py-3 font-medium">{customer.name}</td>
                          <td className="py-3 tabular-nums">{customer.creditLimit?.toLocaleString?.() || "0"}</td>
                          <td className="py-3">{customer.paymentTerms || "—"}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={statusColors[customer.status?.toUpperCase?.() ?? "ACTIVE"] || "bg-gray-100 text-gray-700"}>
                              {customer.status || "ACTIVE"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Link href={`/master-data/customers/${customer.id}`}>
                              <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 shrink-0 mt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.totalPages} ({meta.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
