"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function PhysicalCountPage() {
  return <AuthenticatedPage />;
}

function AuthenticatedPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!isSignedIn) return null;

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex items-center gap-4">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          <div><h1 className="text-3xl font-bold tracking-tight">Physical Count</h1><p className="text-muted-foreground">Schedule and reconcile physical inventory counts</p></div>
        </div>
        <Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
          <CardHeader><CardTitle>Coming Soon</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <p className="text-muted-foreground">Physical count functionality is under development. This will allow you to create count sheets, record actual quantities, and reconcile differences.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
