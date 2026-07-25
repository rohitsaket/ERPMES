"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, DiamondPacket } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Package } from "lucide-react";

export default function PacketsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<PaginatedResponse<DiamondPacket>>({
    queryKey: ["packets", page],
    queryFn: () => api.get("/manufacturing/packets", { page, limit: 20 }),
  });

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div><h1 className="text-3xl font-bold tracking-tight">Diamond Packets</h1><p className="text-muted-foreground">Group diamonds for production tracking</p></div>
          <Link href="/manufacturing/packets/new"><Button><Plus className="mr-2 h-4 w-4" />New Packet</Button></Link>
        </div>
        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader><CardTitle>All Packets</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            : !data?.data.length ? <div className="flex flex-col items-center py-12 text-muted-foreground"><Package className="h-12 w-12 mb-4 opacity-50" /><p className="text-lg font-medium">No packets yet</p></div>
            : <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm"><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">ID</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Diamonds</th><th className="pb-3 font-medium">Location</th><th className="pb-3 font-medium">Actions</th></tr></thead>
                  <tbody>
                    {data.data.map((pkt) => (
                      <tr key={pkt.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-xs">{pkt.id.slice(0, 8)}...</td>
                        <td className="py-3"><Badge variant="outline">{pkt.status}</Badge></td>
                        <td className="py-3">{pkt._count?.diamonds ?? 0}</td>
                        <td className="py-3 text-muted-foreground">{pkt.location || "-"}</td>
                        <td className="py-3"><Link href={`/manufacturing/packets/${pkt.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link></td>
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
