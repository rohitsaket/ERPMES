"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { Shipment, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Truck, Eye, Plus } from "lucide-react";

const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-600", DISPATCHED: "bg-blue-100 text-blue-700", DELIVERED: "bg-emerald-100 text-emerald-700" };

export default function ShipmentsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<Shipment>>({
    queryKey: ["dispatch-shipments"],
    queryFn: () => api.get("/dispatch/shipments", { limit: 50 }),
  });

  const shipments = data?.data || [];

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Shipments</h1><p className="text-muted-foreground">{shipments.length} shipments</p></div>
          </div>
          <Button disabled title="Shipment creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Shipment</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : shipments.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No shipments found</p></CardContent></Card>
        : <div className="grid gap-4">
            {shipments.map((s) => (
              <Card key={s.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[s.status] || "bg-gray-100"}>{s.status}</Badge>
                    <div>
                      <p className="font-medium">{s.trackingNo || s.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{s.customer?.name || s.customerId} | {s.carrier?.name || "No carrier"} | {s._count?.bags || 0} bags</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dispatch/shipments/${s.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </>
  );
}
