"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, ManufacturingOperation } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, PlayCircle, PauseCircle, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";

const opColors: Record<string, string> = { QUEUED: "bg-gray-100 text-gray-600", RUNNING: "bg-emerald-100 text-emerald-700", PAUSED: "bg-amber-100 text-amber-700", HELD: "bg-red-100 text-red-700", COMPLETED: "bg-blue-100 text-blue-700" };

export default function OperationsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<ManufacturingOperation>>({
    queryKey: ["manufacturing-operations", page],
    queryFn: () => api.get("/manufacturing/operations", { page, limit: 20 }),
  });

  const invalidate = (id: string) => { queryClient.invalidateQueries({ queryKey: ["manufacturing-operations"] }); };
  const startMut = useMutation({ mutationFn: (id: string) => api.post(`/manufacturing/operations/${id}/start`), onSuccess: () => invalidate("") });
  const pauseMut = useMutation({ mutationFn: (id: string) => api.post(`/manufacturing/operations/${id}/pause`), onSuccess: () => invalidate("") });
  const resumeMut = useMutation({ mutationFn: (id: string) => api.post(`/manufacturing/operations/${id}/resume`), onSuccess: () => invalidate("") });

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div><h1 className="text-3xl font-bold tracking-tight">Operations</h1><p className="text-muted-foreground">Track individual manufacturing operations</p></div>
        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader><CardTitle>All Operations</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            : !data?.data.length ? <p className="text-center py-8 text-muted-foreground">No operations yet</p>
            : <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm"><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Order</th><th className="pb-3 font-medium">Seq</th><th className="pb-3 font-medium">Dept</th><th className="pb-3 font-medium">Work Center</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Qty Good</th><th className="pb-3 font-medium">Actions</th></tr></thead>
                  <tbody>
                    {data.data.map((op) => (
                      <tr key={op.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-xs">{op.productionOrderId.slice(0, 8)}</td>
                        <td className="py-3">{op.seq}</td>
                        <td className="py-3">{op.department?.name || op.departmentId.slice(0, 6)}</td>
                        <td className="py-3 text-muted-foreground">{op.workCenter?.name || "-"}</td>
                        <td className="py-3"><Badge className={opColors[op.status] || "bg-gray-100"}>{op.status}</Badge></td>
                        <td className="py-3">{op.qtyGood}</td>
                        <td className="py-3 flex gap-1">
                          {op.status === "QUEUED" && <Button variant="ghost" size="icon" onClick={() => startMut.mutate(op.id)} title="Start"><PlayCircle className="h-4 w-4 text-emerald-600" /></Button>}
                          {op.status === "RUNNING" && <Button variant="ghost" size="icon" onClick={() => pauseMut.mutate(op.id)} title="Pause"><PauseCircle className="h-4 w-4 text-amber-600" /></Button>}
                          {op.status === "PAUSED" && <Button variant="ghost" size="icon" onClick={() => resumeMut.mutate(op.id)} title="Resume"><RotateCcw className="h-4 w-4 text-blue-600" /></Button>}
                          {op.status === "HELD" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {op.status === "COMPLETED" && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          <Link href={`/manufacturing/operations/${op.id}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                        </td>
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
