"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { Quotation } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-700",
  CONVERTED: "bg-violet-100 text-violet-700",
};

export default function QuotationDetailPage() {
  return <AuthenticatedQuotationDetailPage />;
}

function AuthenticatedQuotationDetailPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const params = useParams();
  const id = (params?.id as string) ?? "";

  const { data: quotation, isLoading } = useQuery<Quotation>({
    queryKey: ["quotation", id],
    queryFn: () => api.get(`/quotations/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!quotation) {
    return (
      <>
        <div className="text-center py-20">
          <p className="text-lg font-medium">Quotation not found</p>
          <Link href="/sales/quotations">
            <Button variant="link" className="mt-2">Back to quotations</Button>
          </Link>
        </div>
      </>
    );
  }

  const total = quotation.lines.reduce(
    (sum, line) => sum + line.qty * line.unitPrice * (1 - line.discountPct / 100), 0
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/sales/quotations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Quotation {id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(quotation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors[quotation.status] || "bg-gray-100 text-sm px-3 py-1"}>
            {quotation.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{quotation.customer?.name || "Unknown"}</p>
              {quotation.customer && (
                <p className="text-sm text-muted-foreground">Code: {quotation.customer.code}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {quotation.validUntil
                  ? new Date(quotation.validUntil).toLocaleDateString()
                  : "No expiry"}
              </p>
              <p className="text-sm text-muted-foreground">Version {quotation.version}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">UOM</th>
                  <th className="pb-3 font-medium">Unit Price</th>
                  <th className="pb-3 font-medium">Disc %</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0">
                    <td className="py-3">{line.product?.name || line.productId.slice(0, 8)}</td>
                    <td className="py-3">{line.qty}</td>
                    <td className="py-3">{line.uom}</td>
                    <td className="py-3">${line.unitPrice.toFixed(2)}</td>
                    <td className="py-3">{line.discountPct}%</td>
                    <td className="py-3 text-right font-medium">
                      ${(line.qty * line.unitPrice * (1 - line.discountPct / 100)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-bold">
                  <td colSpan={5} className="py-3 text-right">Total</td>
                  <td className="py-3 text-right">${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
