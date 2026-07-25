"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { Bag, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Eye, Plus } from "lucide-react";

export default function BaggingPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<Bag>>({
    queryKey: ["dispatch-bags"],
    queryFn: () => api.get("/dispatch/bags", { limit: 50 }),
  });

  const bags = data?.data || [];

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Bagging</h1><p className="text-muted-foreground">{bags.length} bags</p></div>
          </div>
          <Button disabled title="Bag creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Bag</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : bags.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No bags found</p></CardContent></Card>
        : <div className="grid gap-4">
            {bags.map((bag) => (
              <Card key={bag.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-4">
                    <Badge className={bag.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100"}>{bag.status}</Badge>
                    <div>
                      <p className="font-medium">{bag.sealNo}</p>
                      <p className="text-sm text-muted-foreground">{bag.weight} g | {bag._count?.diamonds || 0} diamonds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dispatch/bagging/${bag.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </>
  );
}
