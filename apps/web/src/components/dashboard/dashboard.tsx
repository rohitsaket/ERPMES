"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Clock,
  FilePlus,
  Gem,
  Package,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ListResponse {
  meta: {
    total: number;
  };
}

interface WipResponse {
  totalWip: number;
}

interface OtdResponse {
  onTimeDeliveryPct: number;
  totalShipments: number;
}

interface OeeResponse {
  overallOEE: number;
}

interface CapacityResponse {
  overallUtilization: number;
}

interface DashboardMetrics {
  productionOrders: number;
  wipItems: number;
  inventoryLots: number;
  onTimeDelivery: number;
  openNcrs: number;
  shipments: number;
  oee: number;
  capacity: number;
}

const quickActions = [
  { label: "Create Quotation", href: "/sales/quotations/new", icon: FilePlus },
  { label: "Create Production Order", href: "/planning/production-orders/new", icon: Package },
  { label: "Transfer Inventory", href: "/inventory/transfers", icon: Package },
  { label: "View Inspections", href: "/quality/inspections", icon: ShieldCheck },
  { label: "View Shipments", href: "/dispatch/shipments", icon: Truck },
  { label: "View Analytics", href: "/analytics", icon: BarChart3 },
] as const;

async function loadDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    productionOrders,
    wip,
    inventoryLots,
    otd,
    ncrs,
    shipments,
    oee,
    capacity,
  ] = await Promise.all([
    api.get<ListResponse>("/production-orders", { page: 1, limit: 1 }),
    api.get<WipResponse>("/analytics/wip-aging"),
    api.get<ListResponse>("/inventory/lots", { page: 1, limit: 1 }),
    api.get<OtdResponse>("/analytics/otd"),
    api.get<ListResponse>("/quality/ncrs", { page: 1, limit: 1 }),
    api.get<ListResponse>("/dispatch/shipments", { page: 1, limit: 1 }),
    api.get<OeeResponse>("/analytics/oee"),
    api.get<CapacityResponse>("/analytics/capacity"),
  ]);

  return {
    productionOrders: productionOrders.meta.total,
    wipItems: wip.totalWip,
    inventoryLots: inventoryLots.meta.total,
    onTimeDelivery: otd.onTimeDeliveryPct,
    openNcrs: ncrs.meta.total,
    shipments: shipments.meta.total,
    oee: oee.overallOEE,
    capacity: capacity.overallUtilization,
  };
}

export function Dashboard() {
  const metricsQuery = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: loadDashboardMetrics,
    staleTime: 30_000,
  });

  const stats = [
    {
      label: "Production Orders",
      value: metricsQuery.data?.productionOrders,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "WIP Operations",
      value: metricsQuery.data?.wipItems,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Inventory Lots",
      value: metricsQuery.data?.inventoryLots,
      icon: Gem,
      color: "text-violet-600",
    },
    {
      label: "On-Time Delivery",
      value:
        metricsQuery.data === undefined
          ? undefined
          : `${metricsQuery.data.onTimeDelivery.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      label: "NCRs",
      value: metricsQuery.data?.openNcrs,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Shipments",
      value: metricsQuery.data?.shipments,
      icon: Truck,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Live overview of manufacturing operations</p>
        </div>
        <Button
          variant="outline"
          onClick={() => metricsQuery.refetch()}
          disabled={metricsQuery.isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${metricsQuery.isFetching ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {metricsQuery.isError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-medium">Dashboard data could not be loaded.</p>
            <p className="text-muted-foreground">
              {metricsQuery.error instanceof Error
                ? metricsQuery.error.message
                : "Check the API connection and try again."}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-busy={metricsQuery.isLoading}>
                {metricsQuery.isLoading ? "…" : stat.value ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground">Current recorded total</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operational Analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/analytics/oee"
              className="rounded-lg border p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-sm text-muted-foreground">Overall OEE</p>
              <p className="mt-1 text-2xl font-semibold">
                {metricsQuery.isLoading
                  ? "…"
                  : `${(metricsQuery.data?.oee ?? 0).toFixed(1)}%`}
              </p>
            </Link>
            <Link
              href="/analytics/capacity"
              className="rounded-lg border p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-sm text-muted-foreground">Capacity utilization</p>
              <p className="mt-1 text-2xl font-semibold">
                {metricsQuery.isLoading
                  ? "…"
                  : `${(metricsQuery.data?.capacity ?? 0).toFixed(1)}%`}
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex min-h-14 items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
