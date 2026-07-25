"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Asset, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Wrench, Eye, Plus } from "lucide-react";

const critColors: Record<string, string> = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-amber-100 text-amber-700", LOW: "bg-emerald-100 text-emerald-700" };

export default function AssetsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<Asset>>({
    queryKey: ["maintenance-assets"],
    queryFn: () => api.get("/maintenance/assets", { limit: 50 }),
  });

  const assets = data?.data || [];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Wrench className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Assets</h1><p className="text-muted-foreground">{assets.length} assets</p></div>
          </div>
          <Button disabled title="Asset creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Asset</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : assets.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No assets found</p></CardContent></Card>
        : <div className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-4">
                    <Badge className={critColors[asset.criticality] || "bg-gray-100"}>{asset.criticality}</Badge>
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.type} — {asset.factory?.name || asset.factoryId} ({asset._count?.workOrders || 0} work orders)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/maintenance/assets/${asset.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
