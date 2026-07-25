"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { CapacityData } from "@/lib/api/types";
import { dateRangeParams } from "@/lib/api/date-range";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Loader2, TrendingUp, TrendingDown, BarChart3, Download, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface WorkCenterCapacity {
  workCenter: string;
  type: string;
  plannedMinutes: number;
  actualMinutes: number;
  utilization: number;
  operations: number;
  status: "UNDER" | "OPTIMAL" | "OVER" | "CRITICAL";
}

const statusColors: Record<string, string> = {
  UNDER: "bg-blue-100 text-blue-700",
  OPTIMAL: "bg-emerald-100 text-emerald-700",
  OVER: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  UNDER: <TrendingDown className="h-4 w-4 text-blue-500" />,
  OPTIMAL: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  OVER: <TrendingUp className="h-4 w-4 text-amber-500" />,
  CRITICAL: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

export default function CapacityPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("week");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["capacity", timeRange],
    queryFn: () => api.get<CapacityData>("/analytics/capacity", dateRangeParams(timeRange)),
  });

  const overall = data?.overallUtilization ?? 0;
  const workCenters: WorkCenterCapacity[] = (data?.byWorkCenter ?? []).map((workCenter) => ({
    ...workCenter,
    type: "work-center",
    status:
      workCenter.utilization >= 100 ? "CRITICAL" :
      workCenter.utilization >= 85 ? "OVER" :
      workCenter.utilization >= 65 ? "OPTIMAL" : "UNDER",
  }));

  const filtered = workCenters.filter(wc => filterStatus === "all" || wc.status === filterStatus);

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Capacity Planning</h1>
            <p className="text-muted-foreground">Monitor work center utilization and identify bottlenecks</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="OPTIMAL">Optimal</SelectItem>
                <SelectItem value="UNDER">Underutilized</SelectItem>
                <SelectItem value="OVER">Overutilized</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary"><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-2xl font-bold">{overall.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {overall > 90 ? "Critical - Immediate action needed" : overall > 80 ? "High - Monitor closely" : overall > 60 ? "Optimal range" : "Underutilized"}
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Total Work Centers</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-2xl font-bold">{workCenters.length}</div>
              <p className="text-xs text-muted-foreground">Active work centers</p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Over Capacity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-2xl font-bold text-amber-600">
                {workCenters.filter(wc => ["OVER", "CRITICAL"].includes(wc.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle className="text-sm font-medium">Underutilized</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-2xl font-bold text-blue-600">
                {workCenters.filter(wc => wc.status === "UNDER").length}
              </div>
              <p className="text-xs text-muted-foreground">Available capacity</p>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle>Work Center Utilization</CardTitle>
              <CardDescription>Detailed breakdown by work center</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="OPTIMAL">Optimal</SelectItem>
                  <SelectItem value="UNDER">Underutilized</SelectItem>
                  <SelectItem value="OVER">Overutilized</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm relative">
                  <thead className="sticky top-0 bg-card z-10 shadow-sm">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Work Center</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Planned (hrs)</th>
                      <th className="pb-3 font-medium">Actual (hrs)</th>
                      <th className="pb-3 font-medium">Utilization</th>
                      <th className="pb-3 font-medium">Operations</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">No work centers match filter</td>
                      </tr>
                    ) : (
                      filtered.map((wc) => (
                        <tr key={wc.workCenter} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{wc.workCenter}</td>
                          <td className="py-3"><Badge variant="secondary">{wc.type}</Badge></td>
                          <td className="py-3 tabular-nums">{(wc.plannedMinutes / 60).toFixed(1)}</td>
                          <td className="py-3 tabular-nums">{(wc.actualMinutes / 60).toFixed(1)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    wc.utilization > 90 ? "bg-red-500" : wc.utilization > 80 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(wc.utilization, 100)}%` }}
                                />
                              </div>
                              <span className="tabular-nums font-medium w-16">{wc.utilization.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 tabular-nums">{wc.operations}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {statusIcons[wc.status]}
                              <Badge variant="secondary" className={statusColors[wc.status]}>
                                {wc.status}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
