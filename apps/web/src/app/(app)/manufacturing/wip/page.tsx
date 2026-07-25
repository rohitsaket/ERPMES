"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { ManufacturingOperation } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export default function WipPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data: ops } = useQuery<any>({ queryKey: ["manufacturing-operations-wip"], queryFn: () => api.get("/manufacturing/operations", { limit: 200 }) });
  const wip = ops?.data?.filter((o: ManufacturingOperation) => !["COMPLETED", "QUEUED"].includes(o.status)) || [];
  const totalWip = wip.filter((o: ManufacturingOperation) => o.status === "RUNNING").length;

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center gap-4">
          <Layers className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Work In Progress</h1><p className="text-muted-foreground">{totalWip} operations currently running</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>Running</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0"><p className="text-3xl font-bold">{wip.filter((o: ManufacturingOperation) => o.status === "RUNNING").length}</p></CardContent></Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>Paused</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0"><p className="text-3xl font-bold">{wip.filter((o: ManufacturingOperation) => o.status === "PAUSED").length}</p></CardContent></Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>Held</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0"><p className="text-3xl font-bold">{wip.filter((o: ManufacturingOperation) => o.status === "HELD").length}</p></CardContent></Card>
        </div>
      </div>
    </AppShell>
  );
}
