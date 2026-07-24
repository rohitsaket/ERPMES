"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Dashboard } from "@/components/dashboard/dashboard";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  Boolean(publishableKey) &&
  !publishableKey?.includes("your_clerk_publishable_key_here");

export default function DashboardPage() {
  if (!isClerkConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4">
        <div className="max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Authentication setup required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Configure Clerk in <code>apps/web/.env.local</code> before opening the protected dashboard.
          </p>
        </div>
      </main>
    );
  }

  return <AuthenticatedDashboardPage />;
}

function AuthenticatedDashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
