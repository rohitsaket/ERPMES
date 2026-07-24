"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";

interface RecordDetailPageProps {
  title: string;
  endpoint: string;
  backHref: string;
  backLabel: string;
}

function formatLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">Not provided</span>;
  }
  if (typeof value === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf())) return <>{date.toLocaleString()}</>;
  }
  return <>{String(value)}</>;
}

export function RecordDetailPage({
  title,
  endpoint,
  backHref,
  backLabel,
}: RecordDetailPageProps) {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const query = useQuery({
    queryKey: ["record-detail", endpoint, id],
    queryFn: () => api.get<Record<string, unknown>>(`${endpoint}/${id}`),
    enabled: Boolean(id),
    retry: 1,
  });

  const entries = Object.entries(query.data ?? {});
  const primitiveEntries = entries.filter(([, value]) => value === null || typeof value !== "object");
  const relatedEntries = entries.filter(([, value]) => value !== null && typeof value === "object");

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href={backHref} aria-label={`Back to ${backLabel}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="truncate text-sm text-muted-foreground">Record {id}</p>
          </div>
        </div>

        {query.isPending && (
          <Card aria-live="polite">
            <CardContent className="p-6 text-sm text-muted-foreground">Loading record…</CardContent>
          </Card>
        )}

        {query.isError && (
          <Card className="border-destructive/40">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-destructive">Unable to load this record</p>
                <p className="text-sm text-muted-foreground">{query.error.message}</p>
              </div>
              <Button variant="outline" onClick={() => query.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {query.data && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {primitiveEntries.map(([key, value]) => (
                    <div key={key} className="min-w-0 border-b pb-3">
                      <dt className="text-sm font-medium text-muted-foreground">{formatLabel(key)}</dt>
                      <dd className="mt-1 break-words text-sm"><PrimitiveValue value={value} /></dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {relatedEntries.map(([key, value]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{formatLabel(key)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}
