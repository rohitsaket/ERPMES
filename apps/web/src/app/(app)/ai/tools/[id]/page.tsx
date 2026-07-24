"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Edit, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";

export default function ToolPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<any>(null);
  
  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setTool({ 
        id: params.id, 
        name: `Tool ${params.id}`, 
        description: "This is a detailed description of the AI tool.",
        category: "generation",
        status: "available",
      });
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/ai/tools">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{tool?.name}</h1>
              <p className="text-muted-foreground">{tool?.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/ai/tools/${tool?.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button>
              <Play className="mr-2 h-4 w-4" /> Run Tool
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Tool settings and parameters.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p className="mt-1">{tool?.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <p className="mt-1">{tool?.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>Recent executions of this tool.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No recent executions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
