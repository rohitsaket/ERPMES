"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { WipAgingData } from "@/lib/api/types";
import { dateRangeParams } from "@/lib/api/date-range";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, Clock, AlertTriangle, Download, RefreshCw, BarChart3 } from "lucide-react";
import Link from "next/link";

interface WipOperation {
  operationId: string;
  productionOrderId: string;
  seq: number;
  department: string | null;
  workCenter: string | null;
  status: string;
  ageDays: number;
  ageHours: number;
}

const statusColors: Record<string, string> = {
  RUNNING: "bg-blue-100 text-blue-700",
  QUEUED: "bg-amber-100 text-amber-700",
  WAITING: "bg-gray-100 text-gray-700",
  BLOCKED: "bg-red-100 text-red-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export default function WipAgingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("all");
  const [filterBucket, setFilterBucket] = useState("all");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["wip-aging", timeRange],
    queryFn: () => api.get<WipAgingData>("/analytics/wip-aging", dateRangeParams(timeRange)),
  });

  const buckets = data?.buckets ?? { "0-24h": 0, "24-48h": 0, "48-72h": 0, "72h+": 0 };
  const aging = data?.aging ?? [];
  const totalWip = data?.totalWip ?? 0;

  const filtered = aging.filter(op => 
    filterBucket === "all" || 
    (filterBucket === "0-24h" && op.ageHours <= 24) ||
    (filterBucket === "24-48h" && op.ageHours > 24 && op.ageHours <= 48) ||
    (filterBucket === "48-72h" && op.ageHours > 48 && op.ageHours <= 72) ||
    (filterBucket === "72h+" && op.ageHours > 72)
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WIP Aging Analysis</h1>
            <p className="text-muted-foreground">Monitor work-in-progress aging across operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBucket} onValueChange={setFilterBucket}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Bucket" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buckets</SelectItem>
                <SelectItem value="0-24h">0-24 Hours</SelectItem>
                <SelectItem value="24-48h">24-48 Hours</SelectItem>
                <SelectItem value="48-72h">48-72 Hours</SelectItem>
                <SelectItem value="72h+">72+ Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total WIP</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalWip}</div>
              <p className="text-xs text-muted-foreground">Active operations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">0-24h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{buckets["0-24h"] || 0}</div>
              <p className="text-xs text-muted-foreground">Fresh operations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24-48h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{buckets["24-48h"] || 0}</div>
              <p className="text-xs text-muted-foreground">Aging 1-2 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">48-72h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{buckets["48-72h"] || 0}</div>
              <p className="text-xs text-muted-foreground">Aging 2-3 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">72h+</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{buckets["72h+"] || 0}</div>
              <p className="text-xs text-muted-foreground">Critical aging</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>WIP Aging Detail</CardTitle>
              <CardDescription>Operations sorted by age - oldest first</CardDescription>
            </div>
            <Select value={filterBucket} onValueChange={setFilterBucket}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter Bucket" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buckets</SelectItem>
                <SelectItem value="0-24h">0-24 Hours</SelectItem>
                <SelectItem value="24-48h">24-48 Hours</SelectItem>
                <SelectItem value="48-72h">48-72 Hours</SelectItem>
                <SelectItem value="72h+">72+ Hours</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operation</TableHead>
                      <TableHead>Production Order</TableHead>
                      <TableHead>Seq</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Work Center</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Age (Days)</TableHead>
                      <TableHead className="text-center">Age (Hours)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No operations match filter</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((op) => (
                        <TableRow key={op.operationId}>
                          <TableCell className="font-mono text-sm">{op.operationId.slice(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-sm">{op.productionOrderId.slice(0, 8)}...</TableCell>
                          <TableCell className="text-center">{op.seq}</TableCell>
                          <TableCell>{op.department || "—"}</TableCell>
                          <TableCell>{op.workCenter || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[op.status] || "bg-gray-100 text-gray-700"}>
                              {op.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums font-mono">{op.ageDays}</TableCell>
                          <TableCell className="text-center tabular-nums font-mono">{op.ageHours}</TableCell>
                        </TableRow>
                      )))}
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
