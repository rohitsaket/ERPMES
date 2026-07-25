"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return <AuthenticatedDashboardPage />;
}

function AuthenticatedDashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
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
    <div className="h-full flex flex-col min-w-0">
      <Dashboard />
    </div>
  );
}