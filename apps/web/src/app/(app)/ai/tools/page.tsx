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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Plus, Download, Settings, Zap, Brain, Sparkles, Cpu, Database, Network, Shield, AlertTriangle, CheckCircle, Edit, Trash2, Eye, RefreshCw, PlusCircle } from "lucide-react";
import Link from "next/link";

interface AITool {
  id: string;
  name: string;
  description: string;
  category: "generation" | "analysis" | "automation" | "integration";
  status: "available" | "beta" | "deprecated";
  lastRun: string | null;
  config: Record<string, unknown>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  generation: <Sparkles className="h-5 w-5 text-purple-500" />,
  analysis: <Brain className="h-5 w-5 text-blue-500" />,
  automation: <Zap className="h-5 w-5 text-yellow-500" />,
  integration: <Network className="h-5 w-5 text-green-500" />,
};

const categoryColors: Record<string, string> = {
  generation: "bg-purple-100 text-purple-700",
  analysis: "bg-blue-100 text-blue-700",
  automation: "bg-yellow-100 text-yellow-700",
  integration: "bg-green-100 text-green-700",
};

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  beta: "bg-amber-100 text-amber-700",
  deprecated: "bg-gray-100 text-gray-700",
};

export default function AIToolsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-tools"],
    queryFn: () => api.get<{ data: AITool[] }>("/ai/tools"),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (error) return <AppShell><div className="text-center py-20 text-red-600">Failed to load AI tools</div></AppShell>;

  const tools = data?.data ?? [];
  const filtered = tools.filter(t =>
    (filterCategory === "all" || t.category === filterCategory) &&
    (filterStatus === "all" || t.status === filterStatus) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Tools</h1>
            <p className="text-muted-foreground">Manage and execute AI-powered tools and workflows</p>
          </div>
          <div className="flex gap-2">
            <Link href="/ai/tools/new">
              <Button><PlusCircle className="mr-2 h-4 w-4" />New Tool</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle>Available Tools</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="generation">Generation</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Cpu className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No tools found</p>
                <p>Try adjusting your filters or search</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">{categoryIcons[tool.category]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{tool.name}</h3>
                            <Badge variant="secondary" className={categoryColors[tool.category]}>
                              {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                            </Badge>
                            <Badge variant="secondary" className={statusColors[tool.status]}>
                              {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{tool.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Last run: {tool.lastRun ? new Date(tool.lastRun).toLocaleDateString() : "Never"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link href={`/ai/tools/${tool.id}`}><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View</Button></Link>
                          <Link href={`/ai/tools/${tool.id}/edit`}><Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Edit</Button></Link>
                          <Button variant="outline" size="sm" onClick={() => api.post(`/ai/tools/${tool.id}/run`, {})}><Zap className="mr-2 h-4 w-4" />Run</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
