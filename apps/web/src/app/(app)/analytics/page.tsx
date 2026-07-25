"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Package, Truck, Clock, Factory, AlertTriangle, Sparkles, Send, Bot, User, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("oee");
  const [filters, setFilters] = useState({ factoryId: "", dateFrom: "", dateTo: "" });

  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryParams = { ...filters, limit: 100 };
  const oeeQuery = useState({ data: null, isLoading: true, error: null });
  // Using useQuery pattern but simplified for now
  const [oee, setOee] = useState<any>(null);
  const [yieldData, setYieldData] = useState<any>(null);
  const [otd, setOtd] = useState<any>(null);
  const [wip, setWip] = useState<any>(null);
  const [capacity, setCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simplified data fetching
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [oeeRes, yieldRes, otdRes, wipRes, capRes] = await Promise.all([
          api.get("/analytics/oee", queryParams),
          api.get("/analytics/yield", queryParams),
          api.get("/analytics/otd", queryParams),
          api.get("/analytics/wip-aging", queryParams),
          api.get("/analytics/capacity", queryParams),
        ]);
        setOee(oeeRes);
        setYieldData(yieldRes);
        setOtd(otdRes);
        setWip(wipRes);
        setCapacity(capRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [filters]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Analytics</h1><p className="text-muted-foreground">Operational metrics and performance insights</p></div>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 shrink-0"><CardTitle className="text-sm font-medium">Filters</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4 flex-1 flex flex-col min-h-0">
            <div className="flex gap-2">
              <label className="text-sm font-medium">Factory</label>
              <select className="border rounded-md px-3 py-2 text-sm" value={filters.factoryId} onChange={(e) => setFilters({...filters, factoryId: e.target.value})}>
                <option value="">All</option>
              </select>
            </div>
            <div className="flex gap-2">
              <label className="text-sm font-medium">From</label>
              <input type="date" className="border rounded-md px-3 py-2 text-sm" value={filters.dateFrom} onChange={(e) => setFilters({...filters, dateFrom: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <label className="text-sm font-medium">To</label>
              <input type="date" className="border rounded-md px-3 py-2 text-sm" value={filters.dateTo} onChange={(e) => setFilters({...filters, dateTo: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 border-b pb-2">
          {[
            { id: "oee", label: "OEE", icon: TrendingUp },
            { id: "yield", label: "Yield", icon: Package },
            { id: "otd", label: "On-Time Delivery", icon: Truck },
            { id: "wip", label: "WIP Aging", icon: Clock },
            { id: "capacity", label: "Capacity", icon: Factory },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
            >
              <tab.icon className="mr-2 h-4 w-4 inline" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "oee" && (
          <div className="grid gap-4 md:grid-cols-4 mt-4">
            <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader className="pb-2 shrink-0"><CardTitle className="text-sm font-medium text-muted-foreground">Overall OEE</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0"><div className="text-4xl font-bold">{oee?.overallOEE?.toFixed(1) || 0}%</div><p className="text-sm text-muted-foreground">A: {oee?.availability?.toFixed(1) || 0}% P: {oee?.performance?.toFixed(1) || 0}% Q: {oee?.quality?.toFixed(1) || 0}%</p></CardContent></Card>
            {oee?.byDepartment?.map((d: any) => (
              <Card key={d.department}><CardContent className="flex-1 flex flex-col min-h-0"><div className="font-medium">{d.department}</div><div className="text-2xl font-bold">{d.oee.toFixed(1)}%</div><div className="text-xs text-muted-foreground">A:{d.availability.toFixed(1)}% P:{d.performance.toFixed(1)}% Q:{d.quality.toFixed(1)}%</div></CardContent></Card>
            ))}
          </div>
        )}

        {activeTab === "yield" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>Yield Analysis</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0">
            <div className="text-3xl font-bold mb-4">Overall Yield: {yieldData?.overallYield?.toFixed(1) || 0}%</div>
            <div className="grid gap-4 md:grid-cols-3">
              {yieldData?.byDepartment?.map((d: any) => (
                <Card key={d.department}><CardContent className="flex-1 flex flex-col min-h-0"><div className="font-medium">{d.department}</div><div className="text-2xl font-bold">{d.yieldPct.toFixed(1)}%</div><div className="text-xs text-muted-foreground">{d.operations} operations</div></CardContent></Card>
              ))}
            </div>
          </CardContent></Card>
        )}

        {activeTab === "otd" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>On-Time Delivery</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="flex-1 flex flex-col min-h-0"><div className="text-sm text-muted-foreground">On-Time %</div><div className="text-3xl font-bold">{otd?.onTimeDeliveryPct?.toFixed(1) || 100}%</div></CardContent></Card>
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="flex-1 flex flex-col min-h-0"><div className="text-sm text-muted-foreground">Total Shipments</div><div className="text-3xl font-bold">{otd?.totalShipments || 0}</div></CardContent></Card>
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="flex-1 flex flex-col min-h-0"><div className="text-sm text-muted-foreground">On-Time</div><div className="text-3xl font-bold text-emerald-600">{otd?.onTimeShipments || 0}</div></CardContent></Card>
            </div>
          </CardContent></Card>
        )}

        {activeTab === "wip" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>WIP Aging</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0">
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="text-center flex-1 flex flex-col min-h-0"><div className="text-3xl font-bold text-emerald-600">{wip?.buckets?.['0-24h'] || 0}</div><div className="text-sm text-muted-foreground">0-24h</div></CardContent></Card>
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="text-center flex-1 flex flex-col min-h-0"><div className="text-3xl font-bold text-blue-600">{wip?.buckets?.['24-48h'] || 0}</div><div className="text-sm text-muted-foreground">24-48h</div></CardContent></Card>
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="text-center flex-1 flex flex-col min-h-0"><div className="text-3xl font-bold text-amber-600">{wip?.buckets?.['48-72h'] || 0}</div><div className="text-sm text-muted-foreground">48-72h</div></CardContent></Card>
              <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardContent className="text-center flex-1 flex flex-col min-h-0"><div className="text-3xl font-bold text-red-600">{wip?.buckets?.['72h+'] || 0}</div><div className="text-sm text-muted-foreground">72h+</div></CardContent></Card>
            </div>
            <div className="text-sm text-muted-foreground">Total WIP: {wip?.totalWip || 0} operations</div>
          </CardContent></Card>
        )}

        {activeTab === "capacity" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden"><CardHeader><CardTitle>Capacity Utilization</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col min-h-0">
            <div className="text-3xl font-bold mb-4">Overall: {capacity?.overallUtilization?.toFixed(1) || 0}%</div>
            <div className="grid gap-4 md:grid-cols-3">
              {capacity?.byWorkCenter?.map((wc: any) => (
                <Card key={wc.workCenter}><CardContent className="flex-1 flex flex-col min-h-0"><div className="font-medium">{wc.workCenter}</div><div className="text-2xl font-bold">{wc.utilization.toFixed(1)}%</div><div className="text-xs text-muted-foreground">{wc.operations} ops | {wc.actualMinutes}/{wc.plannedMinutes} min</div></CardContent></Card>
              ))}
            </div>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
