"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { OEEData } from "@/lib/api/types";
import { dateRangeParams } from "@/lib/api/date-range";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Loader2, TrendingUp, TrendingDown, BarChart3, Download, RefreshCw, Activity, CheckCircle, AlertTriangle, MinusCircle } from "lucide-react";
import Link from "next/link";

interface DepartmentOEE {
  department: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  operations: number;
  status: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
}

const statusColors: Record<string, string> = {
  EXCELLENT: "bg-emerald-100 text-emerald-700",
  GOOD: "bg-blue-100 text-blue-700",
  FAIR: "bg-amber-100 text-amber-700",
  POOR: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  EXCELLENT: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  GOOD: <Activity className="h-4 w-4 text-blue-500" />,
  FAIR: <TrendingUp className="h-4 w-4 text-amber-500" />,
  POOR: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

export default function OEEPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("week");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["oee", timeRange],
    queryFn: () => api.get<OEEData>("/analytics/oee", dateRangeParams(timeRange)),
  });

  const overall = data;
  const departments: DepartmentOEE[] = (data?.byDepartment ?? []).map((department) => ({
    ...department,
    status:
      department.oee >= 85 ? "EXCELLENT" :
      department.oee >= 75 ? "GOOD" :
      department.oee >= 65 ? "FAIR" : "POOR",
  }));

  const filtered = departments.filter(d => filterStatus === "all" || d.status === filterStatus);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overall Equipment Effectiveness (OEE)</h1>
            <p className="text-muted-foreground">Track availability, performance, and quality metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shift">Current Shift</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="FAIR">Fair</SelectItem>
                <SelectItem value="POOR">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" disabled title="OEE export is not implemented yet"><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        </div>

        {overall && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <CardTitle className="text-sm font-medium">OEE</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="text-3xl font-bold">{overall.overallOEE.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {overall.overallOEE >= 85 ? "World Class" : overall.overallOEE >= 75 ? "Good" : overall.overallOEE >= 65 ? "Fair" : "Needs Improvement"}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <CardTitle className="text-sm font-medium">Availability</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="text-3xl font-bold">{overall.availability.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Uptime / Scheduled Time</p>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="text-3xl font-bold">{overall.performance.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Actual / Theoretical Speed</p>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <CardTitle className="text-sm font-medium">Quality</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="text-3xl font-bold">{overall.quality.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Good Units / Total Units</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle>OEE by Department</CardTitle>
              <CardDescription>Breakdown of availability, performance, and quality</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
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
                      <th className="pb-3 font-medium">Department</th>
                      <th className="pb-3 font-medium text-center">OEE</th>
                      <th className="pb-3 font-medium text-center">Availability</th>
                      <th className="pb-3 font-medium text-center">Performance</th>
                      <th className="pb-3 font-medium text-center">Quality</th>
                      <th className="pb-3 font-medium text-center">Operations</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">No departments match filter</td>
                      </tr>
                    ) : (
                      filtered.map((dept) => (
                        <tr key={dept.department} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{dept.department}</td>
                          <td className="py-3 text-center font-mono text-lg font-semibold">{dept.oee.toFixed(1)}%</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    dept.availability >= 90 ? "bg-emerald-500" : dept.availability >= 80 ? "bg-blue-500" : dept.availability >= 70 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${dept.availability}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-12">{dept.availability.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    dept.performance >= 90 ? "bg-emerald-500" : dept.performance >= 80 ? "bg-blue-500" : dept.performance >= 70 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${dept.performance}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-12">{dept.performance.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    dept.quality >= 99 ? "bg-emerald-500" : dept.quality >= 95 ? "bg-blue-500" : dept.quality >= 90 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${dept.quality}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-12">{dept.quality.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center tabular-nums">{dept.operations}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {statusIcons[dept.status]}
                              <Badge variant="secondary" className={statusColors[dept.status]}>
                                {dept.status}
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
    </AppShell>
  );
}
