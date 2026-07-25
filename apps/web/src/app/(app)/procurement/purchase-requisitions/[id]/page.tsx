"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { PurchaseRequisition } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700", APPROVED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };

export default function RequisitionDetailPage() {
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
  const queryClient = useQueryClient();

  const { data: pr, isLoading } = useQuery<PurchaseRequisition>({ queryKey: ["purchase-requisition", id], queryFn: () => api.get(`/purchase-requisitions/${id}`), enabled: !!id });

  const submitMutation = useMutation({ mutationFn: () => api.post(`/purchase-requisitions/${id}/submit`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-requisition", id] }) });
  const approveMutation = useMutation({ mutationFn: () => api.post(`/purchase-requisitions/${id}/approve`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-requisition", id] }) });

  if (isLoading) return <><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></>;
  if (!pr) return <><div className="text-center py-20"><p className="text-lg font-medium">Requisition not found</p><Link href="/procurement/purchase-requisitions"><Button variant="link">Back</Button></Link></div></>;

  const totalQty = pr.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/procurement/purchase-requisitions"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">Requisition {id.slice(0, 8)}</h1></div>
          <Badge className={statusColors[pr.status] || "bg-gray-100 text-sm px-3 py-1"}>{pr.status}</Badge>
        </div>
        <div className="flex gap-2">
          {pr.status === "DRAFT" && <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}><Send className="mr-2 h-4 w-4" />Submit</Button>}
          {pr.status === "SUBMITTED" && <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>}
        </div>
        <Card>
          <CardHeader><CardTitle>Line Items ({pr.lines.length})</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Item</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">UOM</th><th className="pb-3 font-medium">Needed By</th></tr></thead>
              <tbody>
                {pr.lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0"><td className="py-3">{line.itemName}</td><td className="py-3">{line.qty}</td><td className="py-3">{line.uom}</td><td className="py-3 text-muted-foreground">{new Date(line.neededBy).toLocaleDateString()}</td></tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t font-medium"><td className="py-3 text-right">Total</td><td className="py-3">{totalQty}</td><td colSpan={2} /></tr></tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
