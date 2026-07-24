"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { CustomReport } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, FileText, Download, Edit, Trash2, Eye, RefreshCw, Calendar, BarChart3 } from "lucide-react";

export default function CustomReportsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newReport, setNewReport] = useState({ name: "", description: "", queryConfig: {} });

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["custom-reports"],
    queryFn: () => api.get<{ data: CustomReport[] }>("/analytics/custom-reports"),
  });

  const reports = data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/analytics/custom-reports", newReport);
      setShowCreate(false);
      setNewReport({ name: "", description: "", queryConfig: {} });
      window.location.reload();
    } catch (err) {
      alert("Failed to create report");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
            <p className="text-muted-foreground">Create and manage custom analytics reports</p>
          </div>
          <Button disabled title="Persistent custom reports are not implemented yet">
            <Plus className="mr-2 h-4 w-4" />New Report
          </Button>
        </div>

        {showCreate && (
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-1">Report Name</label>
                  <Input value={newReport.name} onChange={e => setNewReport({...newReport, name: e.target.value})} placeholder="Enter report name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} placeholder="Optional description" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit"><Plus className="mr-2 h-4 w-4" />Create</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Your custom analytics reports</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No reports yet</p>
                <p>Create your first custom report</p>
                <Button disabled title="Persistent custom reports are not implemented yet" className="mt-4"><Plus className="mr-2 h-4 w-4" />Create Report</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium w-48">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports
                      .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
                      .map((report) => (
                        <tr key={report.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{report.name}</td>
                          <td className="py-3 text-muted-foreground max-w-xs truncate">{report.description || "—"}</td>
                          <td className="py-3 text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button disabled variant="ghost" size="icon" aria-label="View unavailable"><Eye className="h-4 w-4" /></Button>
                              <Button disabled variant="ghost" size="icon" aria-label="Edit unavailable"><Edit className="h-4 w-4" /></Button>
                              <Button disabled variant="ghost" size="icon" aria-label="Download unavailable"><Download className="h-4 w-4" /></Button>
                              <Button disabled variant="ghost" size="icon" aria-label="Delete unavailable"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
