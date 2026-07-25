"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Vendor } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewVendorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [rating, setRating] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<Vendor>("/vendors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      router.push("/master-data/vendors");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { name, code, companyId: "default" };
    if (contactInfo.trim()) {
      try { body.contactInfo = JSON.parse(contactInfo); } catch { body.contactInfo = contactInfo; }
    }
    if (rating) body.rating = parseFloat(rating);
    mutation.mutate(body);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/master-data/vendors"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold tracking-tight">New Vendor</h1><p className="text-muted-foreground">Add a new vendor to your network</p></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 max-w-2xl">
            <Card>
              <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vendor Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Diamond World Ltd." />
                </div>
                <div className="space-y-2">
                  <Label>Vendor Code *</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="e.g. DW-LTD" maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Info (JSON)</Label>
                  <Input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder='e.g. {"email":"contact@example.com","phone":"+1-234-567-8900"}' />
                </div>
                <div className="space-y-2">
                  <Label>Rating (0–5)</Label>
                  <Input type="number" min={0} max={5} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} placeholder="e.g. 4.5" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/master-data/vendors"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Vendor"}
              </Button>
            </div>
          </div>
        </form>

        {mutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 max-w-2xl">
            {mutation.error instanceof Error ? mutation.error.message : "Failed to create vendor"}
          </div>
        )}
      </div>
    </>
  );
}
