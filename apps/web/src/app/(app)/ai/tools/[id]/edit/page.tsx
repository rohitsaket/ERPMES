"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function EditToolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<any>(null);
  
  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setTool({ id: params.id, name: `Tool ${params.id}`, description: "Description here" });
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      router.push("/ai/tools");
    }, 500);
  };

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
        <div className="flex items-center gap-4">
          <Link href="/ai/tools">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Tool: {tool?.name}</h1>
            <p className="text-muted-foreground">Modify your AI tool configuration</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Tool Settings</CardTitle>
            <CardDescription>Update the details and settings for this tool.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Tool Name</label>
                <Input 
                  value={tool?.name || ""} 
                  onChange={(e) => setTool({...tool, name: e.target.value})} 
                  placeholder="Enter tool name" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Description</label>
                <Input 
                  value={tool?.description || ""} 
                  onChange={(e) => setTool({...tool, description: e.target.value})} 
                  placeholder="Enter a brief description" 
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
