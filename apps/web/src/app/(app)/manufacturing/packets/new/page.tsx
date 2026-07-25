"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { api } from "@/lib/api/client";
import type { DiamondPacket } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewPacketPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const queryClient = useQueryClient();
  const [location, setLocation] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<DiamondPacket>("/manufacturing/packets", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["packets"] }); router.push("/manufacturing/packets"); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ factoryId: "default", location: location || undefined }); };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/manufacturing/packets"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold tracking-tight">New Diamond Packet</h1></div>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle>Packet Details</CardTitle></CardHeader>
            <CardContent className="max-w-sm space-y-4">
              <div className="space-y-2"><Label>Location (optional)</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Vault A-12" /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3 mt-6">
            <Link href="/manufacturing/packets"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Packet"}</Button>
          </div>
        </form>
      </div>
    </>
  );
}
