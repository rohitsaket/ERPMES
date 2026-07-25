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
import { Loader2, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Download, Calendar, AlertTriangle, CheckCircle, Info, FileText, User } from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  severity: "info" | "warning" | "error" | "critical";
}

const severityColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  critical: "bg-red-900 text-red-100",
};

const severityIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <AlertTriangle className="h-4 w-4 text-red-500" />,
  critical: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

export default function AdminAuditLogPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></>;
  if (!isSignedIn) return null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-log", { search, filterSeverity, filterAction, page, pageSize }],
    queryFn: () => api.get<{ data: AuditLogEntry[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/admin/audit-log", {
      search,
      severity: filterSeverity === "all" ? undefined : filterSeverity,
      action: filterAction === "all" ? undefined : filterAction,
      page,
      limit: pageSize,
    }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></>;
  if (error) return <><div className="text-center py-20 text-red-600">Failed to load audit log</div></>;

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const actions = Array.from(new Set(logs.map(l => l.action))).sort();

  const filtered = logs.filter(l =>
    (filterSeverity === "all" || l.severity === filterSeverity) &&
    (filterAction === "all" || l.action === filterAction) &&
    (l.userName.toLowerCase().includes(search.toLowerCase()) ||
     l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
     l.action.toLowerCase().includes(search.toLowerCase()) ||
     l.resource.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
            <p className="text-muted-foreground">Track all system activities and changes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary"><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
            <CardTitle>Audit Entries</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={filterSeverity} onValueChange={v => { setFilterSeverity(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAction} onValueChange={v => { setFilterAction(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No audit entries found</p>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto border rounded-md">
                  <table className="w-full text-sm relative">
                    <thead className="sticky top-0 bg-card z-10 shadow-sm">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">User</th>
                        <th className="pb-3 font-medium">Action</th>
                        <th className="pb-3 font-medium">Resource</th>
                        <th className="pb-3 font-medium">Severity</th>
                        <th className="pb-3 font-medium">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((log) => (
                        <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{log.userName}</div>
                              <div className="text-muted-foreground text-xs">{log.userEmail}</div>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-sm">{log.action}</td>
                          <td className="py-3 text-muted-foreground">
                            {log.resource} {log.resourceId && <span className="font-mono ml-1">({log.resourceId.slice(0, 8)}...)</span>}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {severityIcons[log.severity]}
                              <Badge variant="secondary" className={severityColors[log.severity]}>
                                {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 shrink-0 mt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.totalPages} ({meta.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
