"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, Diamond } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Gem } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

const statusColors: Record<string, string> = { ROUGH: "bg-gray-100 text-gray-700", IN_PROCESS: "bg-blue-100 text-blue-700", POLISHED: "bg-cyan-100 text-cyan-700", CERTIFIED: "bg-emerald-100 text-emerald-700", BAGGED: "bg-amber-100 text-amber-700", DISPATCHED: "bg-violet-100 text-violet-700", SOLD: "bg-green-100 text-green-700" };

export default function DiamondsPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Diamond>>({
    queryKey: ["diamonds", page, search],
    queryFn: () => api.get("/manufacturing/diamonds", { page, limit: 20, search }),
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold tracking-tight">Diamonds</h1><p className="text-muted-foreground">Track individual diamonds through production</p></div>
          <Link href="/manufacturing/diamonds/new"><Button><Plus className="mr-2 h-4 w-4" />New Diamond</Button></Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by certificate..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>All Diamonds</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            : !data?.data.length ? <div className="flex flex-col items-center py-12 text-muted-foreground"><Gem className="h-12 w-12 mb-4 opacity-50" /><p className="text-lg font-medium">No diamonds yet</p></div>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Cert #</th><th className="pb-3 font-medium">Carat</th><th className="pb-3 font-medium">Color</th><th className="pb-3 font-medium">Clarity</th><th className="pb-3 font-medium">Cut</th><th className="pb-3 font-medium">Shape</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Actions</th></tr></thead>
                  <tbody>
                    {data.data.map((d) => (
                      <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-xs">{d.certificateNo}</td>
                        <td className="py-3">{d.carat}</td>
                        <td className="py-3">{d.color}</td>
                        <td className="py-3">{d.clarity}</td>
                        <td className="py-3">{d.cut}</td>
                        <td className="py-3">{d.shape}</td>
                        <td className="py-3"><Badge className={statusColors[d.status] || "bg-gray-100"}>{d.status}</Badge></td>
                        <td className="py-3"><Link href={`/manufacturing/diamonds/${d.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
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
