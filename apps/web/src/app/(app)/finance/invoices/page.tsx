"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { Invoice, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Eye, Plus } from "lucide-react";

const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-600", SENT: "bg-blue-100 text-blue-700", PAID: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-700" };

export default function InvoicesPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<Invoice>>({
    queryKey: ["finance-invoices"],
    queryFn: () => api.get("/finance/invoices", { limit: 50 }),
  });

  const invoices = data?.data || [];

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <CreditCard className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Invoices</h1><p className="text-muted-foreground">{invoices.length} invoices</p></div>
          </div>
          <Button disabled title="Invoice creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Invoice</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : invoices.length === 0 ? <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="py-12 text-center text-muted-foreground flex-1 flex flex-col min-h-0"><p>No invoices found</p></CardContent></Card>
        : <div className="grid gap-4">
            {invoices.map((inv) => (
              <Card key={inv.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[inv.status] || "bg-gray-100"}>{inv.status}</Badge>
                    <div>
                      <p className="font-medium">{inv.customer?.name || inv.customerId}</p>
                      <p className="text-sm text-muted-foreground">{inv.currency} {inv.amount.toLocaleString()} | Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/finance/invoices/${inv.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </>
  );
}
