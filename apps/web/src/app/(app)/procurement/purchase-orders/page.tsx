"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Eye,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, PurchaseOrder } from "@/lib/api/types";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PLACED: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function StatusBadge({ value }: { value: string }) {
  return (
    <Badge className={statusColors[value] || "bg-gray-100 text-gray-700"}>
      {value}
    </Badge>
  );
}

export default function PurchaseOrdersPage() {
  return <AuthenticatedPurchaseOrdersPage />;
}

function AuthenticatedPurchaseOrdersPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery<
    PaginatedResponse<PurchaseOrder>
  >({
    queryKey: ["purchase-orders", page, search],
    queryFn: () => api.get("/purchase-orders", { page, limit: 20, search }),
    enabled: isLoaded && Boolean(isSignedIn),
  });

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary motion-reduce:animate-none" />
        <span className="sr-only">Loading account</span>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between shrink-0">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Purchase Orders
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
              Manage supplier purchase orders
            </p>
          </div>
          <Button asChild className="h-11 w-full sm:w-auto">
            <Link href="/procurement/purchase-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              New purchase order
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="po-search">
            Search purchase orders
          </label>
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="po-search"
              type="search"
              placeholder="Search by order or vendor"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-11 pl-9 text-base sm:text-sm"
            />
          </div>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="px-4 pb-4 pt-5 sm:px-6 shrink-0">
            <CardTitle className="flex items-center justify-between gap-3 text-lg sm:text-xl">
              <span>All purchase orders</span>
              {data?.meta && (
                <span className="text-sm font-normal tabular-nums text-muted-foreground">
                  {data.meta.total} total
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6 flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div
                className="space-y-3 py-2"
                aria-label="Loading purchase orders"
                role="status"
              >
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-lg bg-muted motion-reduce:animate-none md:h-12"
                  />
                ))}
                <span className="sr-only">Loading purchase orders</span>
              </div>
            ) : isError ? (
              <div
                className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center"
                role="alert"
              >
                <p className="font-medium text-destructive">
                  Purchase orders could not be loaded
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Check your connection, then try loading the list again.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 h-11"
                  disabled={isFetching}
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                  Try again
                </Button>
              </div>
            ) : !data?.data.length ? (
              <div
                className="flex flex-col items-center rounded-lg border border-dashed px-4 py-12 text-center"
                aria-live="polite"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ShoppingCart
                    className="h-6 w-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-lg font-semibold">
                  No purchase orders found
                </p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                  {search
                    ? "No purchase orders match your search. Try a different term."
                    : "Create a purchase order to begin tracking supplier commitments."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden flex-1 overflow-auto border rounded-md md:block">
                  <table className="w-full min-w-[760px] text-sm relative">
                    <thead className="sticky top-0 bg-card z-10 shadow-sm">
                      <tr className="border-b text-left text-muted-foreground">
                        <th scope="col" className="pb-3 font-medium">
                          Order
                        </th>
                        <th scope="col" className="pb-3 font-medium">
                          Vendor
                        </th>
                        <th scope="col" className="pb-3 font-medium">
                          Status
                        </th>
                        <th scope="col" className="pb-3 font-medium">
                          Lines
                        </th>
                        <th scope="col" className="pb-3 font-medium">
                          Order date
                        </th>
                        <th scope="col" className="pb-3 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((purchaseOrder) => (
                        <tr
                          key={purchaseOrder.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 pr-4 font-mono text-xs">
                            {purchaseOrder.id.slice(0, 8)}
                          </td>
                          <td className="py-3 pr-4">
                            {purchaseOrder.vendor?.name ||
                              purchaseOrder.vendorId.slice(0, 8)}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge value={purchaseOrder.status} />
                          </td>
                          <td className="py-3 pr-4 tabular-nums">
                            {purchaseOrder.lines.length}
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                            {new Date(
                              purchaseOrder.orderDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-1 text-right">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11"
                            >
                              <Link
                                href={`/procurement/purchase-orders/${purchaseOrder.id}`}
                                aria-label={`View purchase order ${purchaseOrder.id.slice(
                                  0,
                                  8
                                )}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 md:hidden">
                  {data.data.map((purchaseOrder) => (
                    <article
                      key={purchaseOrder.id}
                      className="rounded-lg border bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold">
                            {purchaseOrder.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {purchaseOrder.vendor?.name ||
                              purchaseOrder.vendorId.slice(0, 8)}
                          </p>
                        </div>
                        <StatusBadge value={purchaseOrder.status} />
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Lines</dt>
                          <dd className="mt-1 font-medium tabular-nums">
                            {purchaseOrder.lines.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Order date</dt>
                          <dd className="mt-1 font-medium tabular-nums">
                            {new Date(
                              purchaseOrder.orderDate
                            ).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
                      <Button
                        asChild
                        variant="outline"
                        className="mt-4 h-11 w-full"
                      >
                        <Link
                          href={`/procurement/purchase-orders/${purchaseOrder.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View purchase order
                        </Link>
                      </Button>
                    </article>
                  ))}
                </div>
              </>
            )}

            {data?.meta && data.meta.totalPages > 1 && (
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
                <p className="text-center text-sm tabular-nums text-muted-foreground sm:text-left">
                  Page {data.meta.page} of {data.meta.totalPages} (
                  {data.meta.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-11 flex-1 sm:flex-none"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 flex-1 sm:flex-none"
                    disabled={page >= data.meta.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
