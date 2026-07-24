"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { YieldData } from "@/lib/api/types";
import { dateRangeParams } from "@/lib/api/date-range";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, BarChart3, Download, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface DepartmentYield {
  department: string;
  yieldPct: number;
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
  GOOD: <TrendingUp className="h-4 w-4 text-blue-500" />,
  FAIR: <TrendingUp className="h-4 w-4 text-amber-500" />,
  POOR: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

export default function YieldPage() {
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
    queryKey: ["yield", timeRange],
    queryFn: () => api.get<YieldData>("/analytics/yield", dateRangeParams(timeRange)),
  });

  const overall = data?.overallYield ?? 0;
  const departments: DepartmentYield[] = (data?.byDepartment ?? []).map((department) => ({
    ...department,
    status:
      department.yieldPct >= 99 ? "EXCELLENT" :
      department.yieldPct >= 97 ? "GOOD" :
      department.yieldPct >= 95 ? "FAIR" : "POOR",
  }));

  const filtered = departments.filter(d => filterStatus === "all" || d.status === filterStatus);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Yield Analysis</h1>
            <p className="text-muted-foreground">Track production yield by department and operation</p>
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
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="FAIR">Fair</SelectItem>
                <SelectItem value="POOR">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" disabled title="Yield export is not implemented yet"><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Yield</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overall.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                {overall >= 99 ? "Excellent" : overall >= 97 ? "Good" : overall >= 95 ? "Fair" : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Reporting departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Below Target</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {departments.filter(d => d.yieldPct < 97).length}
              </div>
              <p className="text-xs text-muted-foreground">Departments &lt; 97%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {departments.filter(d => d.yieldPct < 95).length}
              </div>
              <p className="text-xs text-muted-foreground">Departments &lt; 95%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Yield by Department</CardTitle>
              <CardDescription>Production yield percentage with trend indicators</CardDescription>
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
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Yield %</TableHead>
                      <TableHead className="text-center">Operations</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No departments match filter</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell className="text-center font-mono text-lg font-semibold">{dept.yieldPct.toFixed(2)}%</TableCell>
                          <TableCell className="text-center tabular-nums">{dept.operations}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {statusIcons[dept.status]}
                              <Badge variant="secondary" className={statusColors[dept.status]}>
                                {dept.status}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
