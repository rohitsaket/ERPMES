"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { OEEData, YieldData, OTDData, WipAgingData, CapacityData } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Plus, Search, Filter, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

interface MRPRun {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt: string | null;
  itemsPlanned: number;
  exceptions: number;
}

interface MRPException {
  id: string;
  itemId: string;
  itemName: string;
  type: "SHORTAGE" | "EXCESS" | "LEAD_TIME" | "SAFETY_STOCK";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  suggestedAction: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  RUNNING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
};

const severityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const typeIcons: Record<string, React.ReactNode> = {
  SHORTAGE: <AlertTriangle className="h-4 w-4 text-red-500" />,
  EXCESS: <TrendingUp className="h-4 w-4 text-blue-500" />,
  LEAD_TIME: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  SAFETY_STOCK: <TrendingDown className="h-4 w-4 text-purple-500" />,
};

export default function MRPPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"runs" | "exceptions">("runs");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data: runs, isLoading: runsLoading, refetch: refetchRuns } = useQuery({
    queryKey: ["mrp-runs"],
    queryFn: () => api.get<{ data: MRPRun[] }>("/planning/mrp/runs"),
  });

  const { data: exceptions, isLoading: excLoading } = useQuery({
    queryKey: ["mrp-exceptions", selectedRun, filterType, filterSeverity, search],
    queryFn: () => api.get<{ data: MRPException[] }>("/planning/mrp/exceptions", {
      runId: selectedRun ?? undefined,
      type: filterType === "all" ? undefined : filterType,
      severity: filterSeverity === "all" ? undefined : filterSeverity,
      search: search || undefined,
    }),
    enabled: !!selectedRun,
  });

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Material Requirements Planning</h1>
            <p className="text-muted-foreground">Run MRP, review exceptions, and manage planned orders</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetchRuns()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="secondary" disabled title="MRP export is not implemented yet">
              <Download className="mr-2 h-4 w-4" /> Export Exceptions
            </Button>
            <Button disabled title="Running MRP requires an organization planning policy">
              <Plus className="mr-2 h-4 w-4" /> Run MRP
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("runs")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "runs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              MRP Runs
            </button>
            <button
              onClick={() => setActiveTab("exceptions")}
              disabled={!selectedRun}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "exceptions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Exceptions
            </button>
          </div>

          {activeTab === "runs" && (
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle>MRP Run History</CardTitle>
                <CardDescription>View and select an MRP run to analyze exceptions</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                {runsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : runs?.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No MRP runs found</div>
                ) : (
                  <div className="flex-1 overflow-auto border rounded-md">
                    <table className="w-full text-sm relative">
                      <thead className="sticky top-0 bg-card z-10 shadow-sm">
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 font-medium">Run ID</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Started</th>
                          <th className="pb-3 font-medium">Completed</th>
                          <th className="pb-3 font-medium">Items Planned</th>
                          <th className="pb-3 font-medium">Exceptions</th>
                          <th className="pb-3 font-medium w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs?.data?.map((run) => (
                          <tr key={run.id} className={`${selectedRun === run.id ? "bg-accent" : "hover:bg-muted/50"} border-b last:border-0`}>
                            <td className="py-3 font-mono text-sm">{run.id.slice(0, 8)}...</td>
                            <td className="py-3">
                              <Badge variant="secondary" className={statusColors[run.status]}>
                                {run.status}
                              </Badge>
                            </td>
                            <td className="py-3">{new Date(run.startedAt).toLocaleString()}</td>
                            <td className="py-3">{run.completedAt ? new Date(run.completedAt).toLocaleString() : "—"}</td>
                            <td className="py-3 tabular-nums">{run.itemsPlanned.toLocaleString()}</td>
                            <td className="py-3">
                              <Badge variant={run.exceptions > 0 ? "destructive" : "secondary"}>
                                {run.exceptions}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Button
                                variant={selectedRun === run.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
                              >
                                {selectedRun === run.id ? "Selected" : "Analyze"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "exceptions" && (
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle>MRP Exceptions</CardTitle>
                <CardDescription>Material issues detected for the selected planning run</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                {!selectedRun ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Filter className="mx-auto mb-4 h-12 w-12" />
                    <p className="text-lg font-medium">Select an MRP run first</p>
                  </div>
                ) : excLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : exceptions?.data?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
                    <p className="text-lg font-medium">No exceptions found</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto border rounded-md">
                    <table className="w-full text-sm relative">
                      <thead className="sticky top-0 bg-card z-10 shadow-sm">
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Item</th>
                          <th className="pb-3 font-medium">Severity</th>
                          <th className="pb-3 font-medium">Message</th>
                          <th className="pb-3 font-medium">Suggested Action</th>
                          <th className="pb-3 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exceptions?.data?.map((exception) => (
                          <tr key={exception.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3">{typeIcons[exception.type]} {exception.type}</td>
                            <td className="py-3 font-medium">{exception.itemName}</td>
                            <td className="py-3"><Badge variant="secondary" className={severityColors[exception.severity]}>{exception.severity}</Badge></td>
                            <td className="max-w-xs truncate py-3">{exception.message}</td>
                            <td className="max-w-xs truncate py-3">{exception.suggestedAction}</td>
                            <td className="py-3 text-muted-foreground">{new Date(exception.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
