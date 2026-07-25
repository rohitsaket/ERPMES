"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { CapacityData } from "@/lib/api/types";
import { dateRangeParams } from "@/lib/api/date-range";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, Maximize, Minimize, Download, RefreshCw, Gauge } from "lucide-react";
import Link from "next/link";

interface WorkCenterUtil {
  workCenter: string;
  utilization: number;
  plannedMinutes: number;
  actualMinutes: number;
  operations: number;
}

const utilColors: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
};

export default function CapacityPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("month");
  const [view, setView] = useState<"utilization" | "planned-vs-actual">("utilization");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["capacity", timeRange],
    queryFn: () => api.get<CapacityData>("/analytics/capacity", dateRangeParams(timeRange)),
  });

  const overall = data?.overallUtilization ?? 0;
  const byWorkCenter = data?.byWorkCenter ?? [];
  const totalOps = data?.totalOperations ?? 0;

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Capacity Planning</h1>
            <p className="text-muted-foreground">Analyze work center utilization and capacity constraints</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-1 gap-1 rounded-md bg-muted p-1 sm:grid-cols-2">
              <Button variant={view === "utilization" ? "default" : "ghost"} size="sm" onClick={() => setView("utilization")} className="gap-1">
                <Gauge className="h-4 w-4" /> Utilization
              </Button>
              <Button variant={view === "planned-vs-actual" ? "default" : "ghost"} size="sm" onClick={() => setView("planned-vs-actual")} className="gap-1">
                <Maximize className="h-4 w-4" /> <Minimize className="h-4 w-4" /> Plan vs Actual
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-4xl font-bold">{overall.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {overall >= 85 ? "Optimal" : overall >= 70 ? "Good" : overall >= 55 ? "Moderate" : "Underutilized"}
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
              <Maximize className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-3xl font-bold">{totalOps.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Completed in period</p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Work Centers</CardTitle>
              <Maximize className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-3xl font-bold">{byWorkCenter.length}</div>
              <p className="text-xs text-muted-foreground">Active work centers</p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-3xl font-bold">
                {byWorkCenter.length > 0 
                  ? (byWorkCenter.reduce((a, b) => a + b.utilization, 0) / byWorkCenter.length).toFixed(1)
                  : 0}%</div>
              <p className="text-xs text-muted-foreground">Average across centers</p>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle>Work Center Utilization</CardTitle>
              <CardDescription>Individual work center performance</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : byWorkCenter.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No capacity data available</div>
            ) : (
              <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Work Center</th>
                      <th className="pb-3 font-medium">Utilization</th>
                      <th className="pb-3 font-medium text-center">Planned (min)</th>
                      <th className="pb-3 font-medium text-center">Actual (min)</th>
                      <th className="pb-3 font-medium text-center">Variance</th>
                      <th className="pb-3 font-medium text-center">Operations</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byWorkCenter.map((wc) => {
                      const variance = wc.actualMinutes - wc.plannedMinutes;
                      const variancePct = wc.plannedMinutes > 0 ? ((variance / wc.plannedMinutes) * 100).toFixed(1) : "0";
                      const util = wc.utilization;
                      const statusClass = util >= 85 ? "high" : util >= 70 ? "medium" : "low";
                      return (
                        <tr key={wc.workCenter} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{wc.workCenter}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    util >= 85 ? "bg-emerald-500" : util >= 70 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.min(util, 100)}%` }}
                                />
                              </div>
                              <span className="font-mono tabular-nums w-16 text-right">{util.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center tabular-nums">{wc.plannedMinutes.toLocaleString()}</td>
                          <td className="py-3 text-center tabular-nums">{wc.actualMinutes.toLocaleString()}</td>
                          <td className="py-3 text-center tabular-nums">
                            <span className={variance >= 0 ? "text-red-600" : "text-emerald-600"}>
                              {variance >= 0 ? "+" : ""}{variance.toLocaleString()} ({variancePct}%)
                            </span>
                          </td>
                          <td className="py-3 text-center tabular-nums">{wc.operations}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={utilColors[statusClass]}>
                              {util >= 85 ? "High" : util >= 70 ? "Medium" : "Low"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {view === "planned-vs-actual" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Planned vs Actual Analysis</CardTitle>
              <CardDescription>Compare planned vs actual minutes by work center</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Work Center</th>
                      <th className="pb-3 font-medium text-center">Planned</th>
                      <th className="pb-3 font-medium text-center">Actual</th>
                      <th className="pb-3 font-medium text-center">Variance</th>
                      <th className="pb-3 font-medium text-center">Variance %</th>
                      <th className="pb-3 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byWorkCenter.map((wc) => {
                      const variance = wc.actualMinutes - wc.plannedMinutes;
                      const variancePct = wc.plannedMinutes > 0 ? ((variance / wc.plannedMinutes) * 100).toFixed(1) : "0";
                      return (
                        <tr key={wc.workCenter} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{wc.workCenter}</td>
                          <td className="py-3 text-center tabular-nums">{wc.plannedMinutes.toLocaleString()}</td>
                          <td className="py-3 text-center tabular-nums">{wc.actualMinutes.toLocaleString()}</td>
                          <td className="py-3 text-center tabular-nums">
                            <span className={variance >= 0 ? "text-red-600" : "text-emerald-600"}>
                              {variance >= 0 ? "+" : ""}{variance.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 text-center tabular-nums">
                            <span className={parseFloat(variancePct) >= 0 ? "text-red-600" : "text-emerald-600"}>
                              {variancePct}%
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={parseFloat(variancePct) >= 0 ? "text-red-600" : "text-emerald-600"}>
                              {parseFloat(variancePct) >= 0 ? "📈 Over" : "📉 Under"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
