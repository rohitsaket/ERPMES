"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { OTDData } from "@/lib/api/types";
import { dateRangeParams } from "@/lib/api/date-range";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, Target, Download, RefreshCw, Calendar, Truck } from "lucide-react";

interface Shipment {
  id: string;
  trackingNo: string | null;
  customer: string;
  status: string;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  promisedDate: string;
  onTime: boolean;
  carrier: string | null;
}

export default function OTDPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("month");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["otd", timeRange],
    queryFn: () => api.get<OTDData>("/analytics/otd", dateRangeParams(timeRange)),
  });

  const overall = data?.onTimeDeliveryPct ?? 0;
  const totalShipments = data?.totalShipments ?? 0;
  const onTimeShipments = data?.onTimeShipments ?? 0;

  const shipments: Shipment[] = data?.shipments ?? [];

  const filtered = shipments.filter(s => 
    filterStatus === "all" || 
    (filterStatus === "on-time" && s.onTime) || 
    (filterStatus === "late" && !s.onTime)
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">On-Time Delivery</h1>
            <p className="text-muted-foreground">Track shipment delivery performance against promised dates</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{overall.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {overall >= 95 ? "Excellent" : overall >= 90 ? "Good" : overall >= 80 ? "Fair" : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalShipments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">In selected period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{onTimeShipments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Shipments delivered on time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {(totalShipments - onTimeShipments).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Shipments delivered late</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shipments</SelectItem>
              <SelectItem value="on-time">On-Time</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>Individual shipment tracking and delivery status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" disabled title="Delivery export is not implemented yet"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Tracking #</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Carrier</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Promised</th>
                      <th className="pb-3 font-medium">Delivered</th>
                      <th className="pb-3 font-medium">On-Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">No shipments found</td>
                      </tr>
                    ) : (
                      filtered.map((s) => (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-mono text-sm">{s.trackingNo || "—"}</td>
                          <td className="py-3">{s.customer}</td>
                          <td className="py-3">{s.carrier || "—"}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={s.onTime ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                              {s.onTime ? "On-Time" : "Late"}
                            </Badge>
                          </td>
                          <td className="py-3">{new Date(s.promisedDate).toLocaleDateString()}</td>
                          <td className="py-3">{s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString() : "Pending"}</td>
                          <td className="py-3">
                            {s.onTime ? (
                              <span className="text-emerald-600 font-medium">✓</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗</span>
                            )}
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
