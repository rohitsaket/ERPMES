"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { Diamond } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const shapes = ["ROUND", "PRINCESS", "EMERALD", "OVAL", "MARQUISE", "PEAR", "CUSHION", "ASSCHER", "RADIANT", "HEART"];
const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];
const cuts = ["EXCELLENT", "VERY_GOOD", "GOOD", "FAIR", "POOR"];

export default function NewDiamondPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryClient = useQueryClient();
  const [form, setForm] = useState({ certificateNo: "", carat: 0, color: "", clarity: "", cut: "", shape: "", origin: "" });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<Diamond>("/manufacturing/diamonds", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["diamonds"] }); router.push("/manufacturing/diamonds"); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ ...form, companyId: "default" }); };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/manufacturing/diamonds"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold tracking-tight">New Diamond</h1></div>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle>Diamond Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Certificate No</Label><Input value={form.certificateNo} onChange={(e) => setForm({ ...form, certificateNo: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Carat</Label><Input type="number" min={0} step={0.001} value={form.carat} onChange={(e) => setForm({ ...form, carat: parseFloat(e.target.value) || 0 })} required /></div>
              <div className="space-y-2"><Label>Shape</Label><Select value={form.shape} onValueChange={(v) => setForm({ ...form, shape: v })} required><SelectTrigger><SelectValue placeholder="Select shape" /></SelectTrigger><SelectContent>{shapes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Color</Label><Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })} required><SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger><SelectContent>{colors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Clarity</Label><Select value={form.clarity} onValueChange={(v) => setForm({ ...form, clarity: v })} required><SelectTrigger><SelectValue placeholder="Select clarity" /></SelectTrigger><SelectContent>{clarities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Cut</Label><Select value={form.cut} onValueChange={(v) => setForm({ ...form, cut: v })} required><SelectTrigger><SelectValue placeholder="Select cut" /></SelectTrigger><SelectContent>{cuts.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Origin</Label><Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3 mt-6">
            <Link href="/manufacturing/diamonds"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Diamond"}</Button>
          </div>
        </form>
      </div>
    </>
  );
}
