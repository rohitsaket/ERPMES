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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Factory } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

const opColors: Record<string, string> = { QUEUED: "bg-gray-100 text-gray-600", RUNNING: "bg-emerald-100 text-emerald-700", PAUSED: "bg-amber-100 text-amber-700", HELD: "bg-red-100 text-red-700", COMPLETED: "bg-blue-100 text-blue-700" };

export default function ShopFloorPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data: ops, isLoading } = useQuery<any>({ queryKey: ["manufacturing-operations"], queryFn: () => api.get("/manufacturing/operations", { limit: 50 }) });

  const activeOps = ops?.data?.filter((o: ManufacturingOperation) => o.status !== "COMPLETED") || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Factory className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Shop Floor</h1><p className="text-muted-foreground">{activeOps.length} active operations</p></div>
        </div>
        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : activeOps.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><p>No active operations</p></CardContent></Card>
        : <div className="grid gap-4">
            {activeOps.map((op: ManufacturingOperation) => (
              <Card key={op.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Badge className={opColors[op.status] || "bg-gray-100"}>{op.status}</Badge>
                    <div>
                      <p className="font-medium">{op.productionOrder?.id?.slice(0, 8)} - Seq {op.seq}</p>
                      <p className="text-sm text-muted-foreground">{op.department?.name} / {op.workCenter?.name || "Unassigned"}</p>
                    </div>
                  </div>
                  <Link href={`/manufacturing/operations/${op.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
