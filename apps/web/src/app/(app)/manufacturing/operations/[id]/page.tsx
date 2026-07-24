"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { ManufacturingOperation } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

const opColors: Record<string, string> = { QUEUED: "bg-gray-100 text-gray-600", RUNNING: "bg-emerald-100 text-emerald-700", PAUSED: "bg-amber-100 text-amber-700", HELD: "bg-red-100 text-red-700", COMPLETED: "bg-blue-100 text-blue-700" };

export default function OperationDetailPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const params = useParams();
  const id = (params?.id as string) ?? "";
  const queryClient = useQueryClient();
  const [qtyGood, setQtyGood] = useState(0);
  const [qtyScrap, setQtyScrap] = useState(0);
  const [weightIn, setWeightIn] = useState(0);
  const [weightOut, setWeightOut] = useState(0);

  const { data: op, isLoading } = useQuery<ManufacturingOperation>({ queryKey: ["manufacturing-operation", id], queryFn: () => api.get(`/manufacturing/operations/${id}`), enabled: !!id });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["manufacturing-operation", id] });
  const startMut = useMutation({ mutationFn: () => api.post(`/manufacturing/operations/${id}/start`), onSuccess: invalidate });
  const pauseMut = useMutation({ mutationFn: () => api.post(`/manufacturing/operations/${id}/pause`), onSuccess: invalidate });
  const resumeMut = useMutation({ mutationFn: () => api.post(`/manufacturing/operations/${id}/resume`), onSuccess: invalidate });
  const holdMut = useMutation({ mutationFn: () => api.post(`/manufacturing/operations/${id}/hold`), onSuccess: invalidate });
  const completeMut = useMutation({ mutationFn: () => api.post(`/manufacturing/operations/${id}/complete`, { qtyGood, qtyScrap, weightIn, weightOut }), onSuccess: invalidate });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!op) return <AppShell><div className="text-center py-20"><p>Operation not found</p><Link href="/manufacturing/operations"><Button variant="link">Back</Button></Link></div></AppShell>;

  const isRunning = op.status === "RUNNING";
  const isPaused = op.status === "PAUSED";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/manufacturing/operations"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">Operation {id.slice(0, 8)}</h1></div>
          <Badge className={opColors[op.status] || "bg-gray-100 text-sm px-3 py-1"}>{op.status}</Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          {op.status === "QUEUED" && <Button onClick={() => startMut.mutate()}><Play className="mr-2 h-4 w-4" />Start</Button>}
          {isRunning && <Button variant="outline" onClick={() => pauseMut.mutate()}><Pause className="mr-2 h-4 w-4" />Pause</Button>}
          {isPaused && <Button variant="outline" onClick={() => resumeMut.mutate()}><RotateCcw className="mr-2 h-4 w-4" />Resume</Button>}
          {(isRunning || isPaused) && <Button variant="destructive" onClick={() => holdMut.mutate()}><AlertTriangle className="mr-2 h-4 w-4" />Hold</Button>}
          {(isRunning || isPaused) && (
            <div className="flex items-end gap-2 ml-4 p-2 border rounded-lg">
              <div><Label className="text-xs">Good</Label><Input type="number" className="w-20 h-8" value={qtyGood} onChange={(e) => setQtyGood(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Scrap</Label><Input type="number" className="w-20 h-8" value={qtyScrap} onChange={(e) => setQtyScrap(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Wt In</Label><Input type="number" className="w-20 h-8" step={0.001} value={weightIn} onChange={(e) => setWeightIn(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Wt Out</Label><Input type="number" className="w-20 h-8" step={0.001} value={weightOut} onChange={(e) => setWeightOut(Number(e.target.value))} /></div>
              <Button size="sm" onClick={() => completeMut.mutate()} disabled={completeMut.isPending}><CheckCircle className="mr-1 h-4 w-4" />Complete</Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card><CardHeader><CardTitle>Order</CardTitle></CardHeader><CardContent><p className="font-mono text-sm">{op.productionOrderId.slice(0, 8)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Sequence</CardTitle></CardHeader><CardContent><p className="text-lg font-medium">{op.seq}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Department</CardTitle></CardHeader><CardContent><p>{op.department?.name || op.departmentId.slice(0, 8)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Work Center</CardTitle></CardHeader><CardContent><p>{op.workCenter?.name || "Unassigned"}</p></CardContent></Card>
        </div>
        {op.status === "COMPLETED" && (
          <Card>
            <CardHeader><CardTitle>Completion Data</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div><Label>Qty Good</Label><p className="text-lg font-medium">{op.qtyGood}</p></div>
              <div><Label>Qty Scrap</Label><p className="text-lg font-medium">{op.qtyScrap}</p></div>
              <div><Label>Yield</Label><p className="text-lg font-medium">{op.weightIn && op.weightOut ? `${((op.weightOut / op.weightIn) * 100).toFixed(1)}%` : "-"}</p></div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
