"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ToggleRight, ToggleLeft, RefreshCw, Eye, Edit, Trash2, Plus, Shield, Zap } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
  targetUsers: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FeatureFlagsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterEnabled, setFilterEnabled] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["feature-flags", { search, filterEnabled, page, pageSize }],
    queryFn: () => api.get<{ data: FeatureFlag[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/admin/feature-flags", {
      search,
      enabled: filterEnabled === "all" ? undefined : filterEnabled,
      page,
      limit: pageSize,
    }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (error) return <AppShell><div className="text-center py-20 text-red-600">Failed to load feature flags</div></AppShell>;

  const flags = data?.data ?? [];
  const meta = data?.meta;

  const filtered = flags.filter(f =>
    (filterEnabled === "all" || (filterEnabled === "enabled" ? f.enabled : !f.enabled)) &&
    (f.key.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
            <p className="text-muted-foreground">Control feature rollouts and access</p>
          </div>
          <Button disabled title="Feature-flag management is not connected to a backend endpoint yet">
            <Plus className="mr-2 h-4 w-4" />New Flag
          </Button>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
            <CardTitle>All Feature Flags</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search flags..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={filterEnabled} onValueChange={v => { setFilterEnabled(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : flags.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No feature flags yet</p>
                <Button className="mt-4" disabled title="Feature-flag creation is not implemented yet">
                  <Plus className="mr-2 h-4 w-4" />Create Flag
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto border rounded-md">
                  <table className="w-full text-sm relative">
                    <thead className="sticky top-0 bg-card z-10 shadow-sm">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Flag</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Rollout</th>
                        <th className="pb-3 font-medium">Targets</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Updated</th>
                        <th className="pb-3 font-medium w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((flag) => (
                        <tr key={flag.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-mono font-medium">{flag.key}</td>
                          <td className="py-3 text-muted-foreground max-w-xs truncate">{flag.description || "—"}</td>
                          <td className="py-3">
                            <Badge variant="secondary">
                              {flag.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    flag.enabled ? "bg-primary" : "bg-muted-foreground/30"
                                  }`}
                                  style={{ width: `${flag.rolloutPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{flag.rolloutPercentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground text-sm">
                            {flag.targetRoles.length > 0 && <Badge variant="secondary" className="bg-purple-100 text-purple-700">{flag.targetRoles.length} roles</Badge>}
                            {flag.targetUsers.length > 0 && <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-1">{flag.targetUsers.length} users</Badge>}
                            {flag.targetRoles.length === 0 && flag.targetUsers.length === 0 && <span className="text-muted-foreground">All users</span>}
                          </td>
                          <td className="py-3">
                            <Badge variant="secondary" className={flag.isSystem ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                              {flag.isSystem ? "System" : "Custom"}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">{new Date(flag.updatedAt).toLocaleDateString()}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" aria-label="View" disabled><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" aria-label="Edit" disabled><Edit className="h-4 w-4" /></Button>
                              {!flag.isSystem && <Button variant="ghost" size="icon" aria-label="Delete" disabled className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                          </td>
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
                      <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                      <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
