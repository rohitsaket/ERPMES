"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import {
  ClerkAuthProvider,
  DevAuthProvider,
  UnconfiguredAuthProvider,
} from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { setAccessTokenResolver } from "@/lib/api/client";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

function ApiAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAccessTokenResolver(getToken);
    return () => setAccessTokenResolver(undefined);
  }, [getToken]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const devBypass = process.env.NEXT_PUBLIC_FF_BYPASS_AUTH === "true";
  const isClerkConfigured =
    (Boolean(publishableKey) &&
    !publishableKey?.includes("your_clerk_publishable_key_here")) || devBypass;

  const app = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ApiAuthBridge />
        {children}
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );

  if (!isClerkConfigured) {
    return <UnconfiguredAuthProvider>{app}</UnconfiguredAuthProvider>;
  }

  if (devBypass) {
    return <DevAuthProvider>{app}</DevAuthProvider>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/login"
      signUpUrl="/register"
    >
      <ClerkAuthProvider>{app}</ClerkAuthProvider>
    </ClerkProvider>
  );
}
