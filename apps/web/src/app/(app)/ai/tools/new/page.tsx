"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function NewToolPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState({
    name: "",
    description: "",
    category: "generation",
    status: "beta"
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      router.push("/ai/tools");
    }, 500);
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Create New Tool</h1>
            <p className="text-muted-foreground">Add a new AI tool to the platform</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Tool Details</CardTitle>
            <CardDescription>Configure the settings for your new AI tool.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Tool Name</label>
                <Input 
                  value={tool.name} 
                  onChange={(e) => setTool({...tool, name: e.target.value})} 
                  placeholder="Enter tool name" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Description</label>
                <Input 
                  value={tool.description} 
                  onChange={(e) => setTool({...tool, description: e.target.value})} 
                  placeholder="Enter a brief description" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Category</label>
                  <Select value={tool.category} onValueChange={(v) => setTool({...tool, category: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generation">Generation</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Status</label>
                  <Select value={tool.status} onValueChange={(v) => setTool({...tool, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Create Tool
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
