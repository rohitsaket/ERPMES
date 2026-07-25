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
import { Loader2, Search, Shield, Key, RefreshCw, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Permission {
  id: string;
  action: string;
  subject: string;
  description: string;
  category: string;
  isSystem: boolean;
}

const categoryColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-700",
  role: "bg-purple-100 text-purple-700",
  product: "bg-green-100 text-green-700",
  order: "bg-orange-100 text-orange-700",
  inventory: "bg-teal-100 text-teal-700",
  manufacturing: "bg-indigo-100 text-indigo-700",
  quality: "bg-pink-100 text-pink-700",
  maintenance: "bg-amber-100 text-amber-700",
  finance: "bg-yellow-100 text-yellow-700",
  ai: "bg-red-100 text-red-700",
  admin: "bg-gray-100 text-gray-700",
  default: "bg-gray-100 text-gray-700",
};

export default function PermissionsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions", { search, filterCategory, page, pageSize }],
    queryFn: () => api.get<{ data: Permission[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/admin/permissions", {
      search,
      category: filterCategory === "all" ? undefined : filterCategory,
      page,
      limit: pageSize,
    }),
    placeholderData: (prev) => prev,
    enabled: isLoaded && isSignedIn,
  });

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  if (isLoading && isLoaded) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (error) return <AppShell><div className="text-center py-20 text-red-600">Failed to load permissions</div></AppShell>;

  const permissions = data?.data ?? [];
  const meta = data?.meta;

  const categories = ["all", ...Array.from(new Set(permissions.map(p => p.category))).sort()];

  const filtered = permissions.filter(p =>
    (filterCategory === "all" || p.category === filterCategory) &&
    (p.action.toLowerCase().includes(search.toLowerCase()) || p.subject.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
            <p className="text-muted-foreground">Manage system permissions and access control</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
            <div>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>Complete list of system permissions</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search permissions..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== "all").map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : permissions.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No permissions configured</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto border rounded-md">
                  <table className="w-full text-sm relative">
                    <thead className="sticky top-0 bg-card z-10 shadow-sm">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Action</th>
                        <th className="pb-3 font-medium">Subject</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">System</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.filter(p =>
                        (filterCategory === "all" || p.category === filterCategory) &&
                        (p.action.toLowerCase().includes(search.toLowerCase()) || p.subject.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
                      ).map((perm) => (
                        <tr key={perm.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-mono font-medium">{perm.action}</td>
                          <td className="py-3">{perm.subject}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={categoryColors[perm.category] || categoryColors.default}>
                              {perm.category.charAt(0).toUpperCase() + perm.category.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground max-w-xs truncate">{perm.description || "—"}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={perm.isSystem ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                              {perm.isSystem ? "System" : "Custom"}
                            </Badge>
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
