"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FileSearch, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, RequestForQuotation } from "@/lib/api/types";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  responded: "bg-amber-100 text-amber-700",
  awarded: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

function getRfqLabel(rfq: RequestForQuotation) {
  return "number" in rfq && typeof rfq.number === "string"
    ? rfq.number
    : rfq.id.slice(0, 8);
}

function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      className={
        statusColors[value.toLowerCase()] || "bg-gray-100 text-gray-700"
      }
    >
      {value}
    </Badge>
  );
}

export default function RfqsPage() {
  return <AuthenticatedRfqsPage />;
}

function AuthenticatedRfqsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery<
    PaginatedResponse<RequestForQuotation>
  >({
    queryKey: ["rfqs", page, status],
    queryFn: () =>
      api.get("/rfqs", {
        page,
        limit: 20,
        status: status || undefined,
      }),
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
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Requests for Quotation
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
            Track vendor quote requests and response deadlines
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium" htmlFor="rfq-status">
            Status
          </label>
          <select
            id="rfq-status"
            className="h-11 w-full rounded-md border bg-background px-3 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring sm:w-56 sm:text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="responded">Responded</option>
            <option value="awarded">Awarded</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="px-4 pb-4 pt-5 sm:px-6 shrink-0">
            <CardTitle className="flex items-center justify-between gap-3 text-lg sm:text-xl">
              <span>All RFQs</span>
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
                aria-label="Loading RFQs"
                role="status"
              >
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-lg bg-muted motion-reduce:animate-none md:h-12"
                  />
                ))}
                <span className="sr-only">Loading RFQs</span>
              </div>
            ) : isError ? (
              <div
                className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center"
                role="alert"
              >
                <p className="font-medium text-destructive">
                  RFQs could not be loaded
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
                  <FileSearch
                    className="h-6 w-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-lg font-semibold">No RFQs found</p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                  {status
                    ? "No RFQs match this status. Choose another status to continue."
                    : "RFQs will appear here after a vendor quote request is created."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden flex-1 overflow-auto border rounded-md md:block">
                  <table className="w-full min-w-[760px] text-sm relative">
                    <thead className="sticky top-0 bg-card z-10 shadow-sm">
                      <tr className="border-b text-left text-muted-foreground">
                        <th scope="col" className="pb-3 font-medium">
                          RFQ
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
                          Due date
                        </th>
                        <th scope="col" className="pb-3 font-medium">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((rfq) => (
                        <tr
                          key={rfq.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 pr-4 font-medium">
                            {getRfqLabel(rfq)}
                          </td>
                          <td className="py-3 pr-4">
                            {rfq.vendor?.name || rfq.vendorId.slice(0, 8)}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge value={rfq.status} />
                          </td>
                          <td className="py-3 pr-4 tabular-nums">
                            {rfq.lines.length}
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                            {new Date(rfq.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 tabular-nums text-muted-foreground">
                            {new Date(rfq.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 md:hidden">
                  {data.data.map((rfq) => (
                    <article
                      key={rfq.id}
                      className="rounded-lg border bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {getRfqLabel(rfq)}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {rfq.vendor?.name || rfq.vendorId.slice(0, 8)}
                          </p>
                        </div>
                        <StatusBadge value={rfq.status} />
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Lines</dt>
                          <dd className="mt-1 font-medium tabular-nums">
                            {rfq.lines.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Due date</dt>
                          <dd className="mt-1 font-medium tabular-nums">
                            {new Date(rfq.dueDate).toLocaleDateString()}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-muted-foreground">Created</dt>
                          <dd className="mt-1 font-medium tabular-nums">
                            {new Date(rfq.createdAt).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
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
