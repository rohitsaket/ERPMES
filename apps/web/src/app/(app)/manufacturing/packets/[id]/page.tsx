"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { DiamondPacket } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Gem } from "lucide-react";
import Link from "next/link";

export default function PacketDetailPage() {
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

  const { data: packet, isLoading } = useQuery<DiamondPacket>({ queryKey: ["packet", id], queryFn: () => api.get(`/manufacturing/packets/${id}`), enabled: !!id });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!packet) return <AppShell><div className="text-center py-20"><p>Packet not found</p><Link href="/manufacturing/packets"><Button variant="link">Back</Button></Link></div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/manufacturing/packets"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">Packet {id.slice(0, 8)}</h1></div>
          <Badge variant="outline">{packet.status}</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardHeader><CardTitle>Location</CardTitle></CardHeader><CardContent><p>{packet.location || "Not specified"}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Diamonds</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{packet.diamonds?.length || 0}</p></CardContent></Card>
        </div>
        {packet.diamonds && packet.diamonds.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Diamonds in Packet</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Cert #</th><th className="pb-3 font-medium">Carat</th><th className="pb-3 font-medium">Color</th><th className="pb-3 font-medium">Clarity</th><th className="pb-3 font-medium">Status</th></tr></thead>
                <tbody>
                  {packet.diamonds.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-mono text-xs">{d.certificateNo}</td>
                      <td className="py-3">{d.carat}</td>
                      <td className="py-3">{d.color}</td>
                      <td className="py-3">{d.clarity}</td>
                      <td className="py-3"><Badge variant="outline">{d.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
