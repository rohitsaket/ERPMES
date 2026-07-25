"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server configuration error",
    description: "The authentication system is not properly configured.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "You do not have permission to access this resource.",
  },
  Verification: {
    title: "Verification error",
    description: "The verification token has expired or is invalid.",
  },
  Default: {
    title: "Authentication error",
    description: "An error occurred during authentication.",
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Default";
  const errorInfo = errorMessages[error] || errorMessages["Default"] || {
    title: "Authentication error",
    description: "An error occurred during authentication.",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>{errorInfo.title}</CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
