"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Nonconformance, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Eye } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

const severityColors: Record<string, string> = { MINOR: "bg-amber-100 text-amber-700", MAJOR: "bg-orange-100 text-orange-700", CRITICAL: "bg-red-100 text-red-700" };
const statusColors: Record<string, string> = { OPEN: "bg-red-100 text-red-700", DISPOSITIONED: "bg-blue-100 text-blue-700", CLOSED: "bg-emerald-100 text-emerald-700" };

export default function NcrsPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<Nonconformance>>({
    queryKey: ["quality-ncrs"],
    queryFn: () => api.get("/quality/ncrs", { limit: 50 }),
  });

  const ncrs = data?.data || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div><h1 className="text-3xl font-bold tracking-tight">Nonconformances (NCRs)</h1><p className="text-muted-foreground">{ncrs.length} records</p></div>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : ncrs.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><p>No nonconformances found</p></CardContent></Card>
        : <div className="grid gap-4">
            {ncrs.map((ncr) => (
              <Card key={ncr.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Badge className={severityColors[ncr.severity] || "bg-gray-100"}>{ncr.severity}</Badge>
                    <Badge className={statusColors[ncr.status] || "bg-gray-100"}>{ncr.status}</Badge>
                    <div>
                      <p className="font-medium">{ncr.type} — {ncr.inspection?.step?.name || ncr.inspectionId?.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{ncr.disposition || "No disposition"} {ncr.rootCause ? `| Root: ${ncr.rootCause}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/quality/ncrs/${ncr.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
