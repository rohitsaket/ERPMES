"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Download, AlertTriangle, RefreshCw, Activity, BarChart3 } from "lucide-react";

interface AIAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: "chat" | "tool_execution" | "model_call" | "data_access" | "configuration_change";
  resource: string;
  status: "success" | "error" | "pending" | "cancelled";
  duration: number;
  tokensUsed: number;
  cost: number;
  metadata: Record<string, unknown>;
  errorMessage?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  chat: <Activity className="h-4 w-4 text-blue-500" />,
  tool_execution: <Activity className="h-4 w-4 text-purple-500" />,
  model_call: <Activity className="h-4 w-4 text-green-500" />,
  data_access: <Activity className="h-4 w-4 text-orange-500" />,
  configuration_change: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function AIAuditLogPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("entries");

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></>;
  if (!isSignedIn) return null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-audit-log", page, search, filterAction, filterStatus, dateRange],
    queryFn: () => api.get<{ data: AIAuditEntry[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/ai/audit-log", {
      page,
      limit: 20,
      search,
      action: filterAction === "all" ? undefined : filterAction,
      status: filterStatus === "all" ? undefined : filterStatus,
      range: dateRange,
    }),
    enabled: true,
  });

  if (error) return <><div className="text-center py-20 text-red-600">Failed to load audit log</div></>;

  const auditEntries = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Audit Log</h1>
            <p className="text-muted-foreground">Monitor and review all AI system activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
            <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          </div>
        </div>

        <div className="border-b">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("entries")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "entries" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              AI Activities
            </button>
            <button
              onClick={() => setActiveTab("models")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "models" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Model Usage
            </button>
          </div>
        </div>

        {activeTab === "entries" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
              <div>
                <CardTitle>AI Activity Log</CardTitle>
                <CardDescription>All AI system activities and user interactions</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value="7d" onValueChange={() => {}}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Last 7 days" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value="all" onValueChange={() => {}}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="tool_execution">Tool Execution</SelectItem>
                    <SelectItem value="model_call">Model Call</SelectItem>
                    <SelectItem value="data_access">Data Access</SelectItem>
                    <SelectItem value="configuration_change">Config Change</SelectItem>
                  </SelectContent>
                </Select>
                <Select value="all" onValueChange={() => {}}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Action</th>
                        <th className="text-left py-3 px-4 font-medium">Resource</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-center py-3 px-4 font-medium">Duration</th>
                        <th className="text-center py-3 px-4 font-medium">Tokens</th>
                        <th className="text-center py-3 px-4 font-medium">Cost</th>
                        <th className="text-left py-3 px-4 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEntries.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-muted-foreground">
                            Audit log data loads from API. Add mock data to see entries.
                          </td>
                        </tr>
                      ) : (
                        auditEntries.map((entry) => (
                          <tr key={entry.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{new Date(entry.timestamp).toLocaleString()}</td>
                            <td className="py-3 px-4">{entry.userName}</td>
                            <td className="py-3 px-4">
                              <span className="flex items-center gap-2">
                                {actionIcons[entry.action]}
                                <span className="capitalize">{entry.action.replace(/_/g, " ")}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-[200px] truncate">{entry.resource}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={statusColors[entry.status]}>{entry.status}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center font-mono">{entry.duration}ms</td>
                            <td className="py-3 px-4 text-center font-mono">{entry.tokensUsed.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center font-mono">${entry.cost.toFixed(4)}</td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 shrink-0 mt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "models" && (
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Model Usage Statistics</CardTitle>
              <CardDescription>Token usage and costs by model</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Model usage data loads from API</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}