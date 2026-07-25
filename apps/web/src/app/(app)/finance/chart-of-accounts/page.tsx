"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { ChartOfAccount, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const typeColors: Record<string, string> = { ASSET: "bg-emerald-100 text-emerald-700", LIABILITY: "bg-blue-100 text-blue-700", EQUITY: "bg-purple-100 text-purple-700", REVENUE: "bg-green-100 text-green-700", EXPENSE: "bg-red-100 text-red-700" };

export default function ChartOfAccountsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<ChartOfAccount>>({
    queryKey: ["finance-accounts"],
    queryFn: () => api.get("/finance/chart-of-accounts", { limit: 100 }),
  });

  const accounts = data?.data || [];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center gap-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1><p className="text-muted-foreground">{accounts.length} accounts</p></div>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : accounts.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No accounts found</p></CardContent></Card>
        : <div className="grid gap-2">
            {accounts.map((acct) => (
              <Card key={acct.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4 flex-1 flex flex-col min-h-0">
                  <Badge className={typeColors[acct.type] || "bg-gray-100"}>{acct.type}</Badge>
                  <div>
                    <p className="font-medium"><span className="text-muted-foreground">{acct.code}</span> {acct.name}</p>
                    <p className="text-sm text-muted-foreground">{acct.parent ? `→ ${acct.parent.name}` : "Root account"}{acct.children?.length ? ` | ${acct.children.length} children` : ""}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
