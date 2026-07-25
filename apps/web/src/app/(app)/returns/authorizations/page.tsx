"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { ReturnAuthorization, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RotateCcw, Eye, Plus } from "lucide-react";

const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-600", SUBMITTED: "bg-blue-100 text-blue-700", APPROVED: "bg-emerald-100 text-emerald-700", RECEIVED: "bg-amber-100 text-amber-700", CLOSED: "bg-slate-100 text-slate-600" };

export default function AuthorizationsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<ReturnAuthorization>>({
    queryKey: ["returns-authorizations"],
    queryFn: () => api.get("/returns/authorizations", { limit: 50 }),
  });

  const auths = data?.data || [];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <RotateCcw className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Return Authorizations</h1><p className="text-muted-foreground">{auths.length} authorizations</p></div>
          </div>
          <Button disabled title="Return authorization creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Authorization</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : auths.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No return authorizations found</p></CardContent></Card>
        : <div className="grid gap-4">
            {auths.map((ra) => (
              <Card key={ra.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[ra.status] || "bg-gray-100"}>{ra.status}</Badge>
                    <div>
                      <p className="font-medium">{ra.customer?.name || ra.customerId}</p>
                      <p className="text-sm text-muted-foreground">{ra._count?.lines || 0} lines | {ra.disposition || "Pending disposition"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/returns/authorizations/${ra.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
