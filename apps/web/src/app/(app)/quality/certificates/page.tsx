"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import type { Certificate, PaginatedResponse } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Eye, Plus } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(publishableKey) && !publishableKey?.includes("your_clerk_publishable_key_here");

export default function CertificatesPage() {
  if (!isClerkConfigured) return <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4"><div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">Authentication setup required</h1></div></main>;
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  const { data, isLoading } = useQuery<PaginatedResponse<Certificate>>({
    queryKey: ["quality-certificates"],
    queryFn: () => api.get("/quality/certificates", { limit: 50 }),
  });

  const certificates = data?.data || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div><h1 className="text-3xl font-bold tracking-tight">Certificates</h1><p className="text-muted-foreground">{certificates.length} certificates</p></div>
          </div>
          <Button disabled title="Certificate creation is not implemented yet"><Plus className="mr-2 h-4 w-4" />New Certificate</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        : certificates.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><p>No certificates found</p></CardContent></Card>
        : <div className="grid gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Badge className={cert.validatedAt ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{cert.validatedAt ? "Validated" : "Pending"}</Badge>
                    <div>
                      <p className="font-medium">{cert.certificateNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {cert.diamond ? `${cert.diamond.carat}ct ${cert.diamond.shape} ${cert.diamond.color}/${cert.diamond.clarity}` : cert.diamondId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/quality/certificates/${cert.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
      </div>
    </AppShell>
  );
}
