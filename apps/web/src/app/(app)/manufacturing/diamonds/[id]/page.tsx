"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Diamond } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = { ROUGH: "bg-gray-100 text-gray-700", IN_PROCESS: "bg-blue-100 text-blue-700", POLISHED: "bg-cyan-100 text-cyan-700", CERTIFIED: "bg-emerald-100 text-emerald-700", BAGGED: "bg-amber-100 text-amber-700", DISPATCHED: "bg-violet-100 text-violet-700", SOLD: "bg-green-100 text-green-700" };

export default function DiamondDetailPage() {
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

  const { data: diamond, isLoading } = useQuery<Diamond>({ queryKey: ["diamond", id], queryFn: () => api.get(`/manufacturing/diamonds/${id}`), enabled: !!id });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!diamond) return <AppShell><div className="text-center py-20"><p>Diamond not found</p><Link href="/manufacturing/diamonds"><Button variant="link">Back</Button></Link></div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/manufacturing/diamonds"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">Diamond {diamond.certificateNo}</h1></div>
          <Badge className={statusColors[diamond.status] || "bg-gray-100 text-sm px-3 py-1"}>{diamond.status}</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Carat</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{diamond.carat}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Shape</CardTitle></CardHeader><CardContent><p className="text-lg font-medium">{diamond.shape}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Origin</CardTitle></CardHeader><CardContent><p>{diamond.origin || "Unknown"}</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>4Cs</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div><p className="text-sm text-muted-foreground">Color</p><p className="text-lg font-medium">{diamond.color}</p></div>
            <div><p className="text-sm text-muted-foreground">Clarity</p><p className="text-lg font-medium">{diamond.clarity}</p></div>
            <div><p className="text-sm text-muted-foreground">Cut</p><p className="text-lg font-medium">{diamond.cut}</p></div>
          </CardContent>
        </Card>
        {diamond.events && diamond.events.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Event History ({diamond.events.length})</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Event</th><th className="pb-3 font-medium">From → To</th><th className="pb-3 font-medium">Wt Before</th><th className="pb-3 font-medium">Wt After</th><th className="pb-3 font-medium">Loss %</th><th className="pb-3 font-medium">Timestamp</th></tr></thead>
                <tbody>
                  {diamond.events.map((ev) => (
                    <tr key={ev.id} className="border-b last:border-0">
                      <td className="py-3"><Badge variant="outline">{ev.eventType}</Badge></td>
                      <td className="py-3 text-muted-foreground">{ev.fromDeptId?.slice(0, 6) || "-"} → {ev.toDeptId?.slice(0, 6) || "-"}</td>
                      <td className="py-3">{ev.weightBefore}</td>
                      <td className="py-3">{ev.weightAfter}</td>
                      <td className="py-3">{ev.lossPct}%</td>
                      <td className="py-3 text-muted-foreground">{new Date(ev.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
        {diamond.certificate && (
          <Card>
            <CardHeader><CardTitle>Certificate</CardTitle></CardHeader>
            <CardContent><p>Lab: {diamond.certificate.labId} | No: {diamond.certificate.certificateNo} | Issued: {new Date(diamond.certificate.issueDate).toLocaleDateString()}</p></CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
