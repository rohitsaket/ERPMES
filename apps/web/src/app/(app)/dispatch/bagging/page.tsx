"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Bag, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Eye, Plus } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

export default function BaggingPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
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
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Bagging</h1><p className="text-muted-foreground">{bags.length} bags</p></div>
          </div>
          <Button disabled title="Bag creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Bag</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : bags.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><p>No bags found</p></CardContent></Card>
        : <div className="grid gap-4">
            {bags.map((bag) => (
              <Card key={bag.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
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
    </AppShell>
  );
}
