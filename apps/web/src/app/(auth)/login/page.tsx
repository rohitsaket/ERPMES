"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Gem, KeyRound } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const devBypass = process.env.NEXT_PUBLIC_FF_BYPASS_AUTH === "true";
const isClerkConfigured =
  (Boolean(publishableKey) &&
  !publishableKey?.includes("your_clerk_publishable_key_here")) || devBypass;

export default function SignInPage() {
  const router = useRouter();

  React.useEffect(() => {
    if (devBypass) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (devBypass) {
    return null;
  }

  if (!isClerkConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4 py-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle>Authentication setup required</CardTitle>
            <CardDescription>
              DiamondFlow is running, but Clerk authentication has not been configured for this environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Set a valid <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
              in <code className="rounded bg-muted px-1.5 py-0.5">apps/web/.env.local</code>, then restart the frontend.
            </p>
            <p className="text-muted-foreground">
              The local UI shell is healthy; sign-in actions remain disabled until a real Clerk key is supplied.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <ClerkSignInPage />;
}

function ClerkSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect_url") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoaded || !isSignUpLoaded || !signIn || !signUp || !setActive || !setActiveSignUp) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp.create({
          emailAddress: identifier,
          password,
        });

        if (result.status === "complete") {
          await setActiveSignUp({ session: result.createdSessionId });
          router.push(redirectUrl);
        } else if (result.status === "missing_requirements") {
          setError("Please complete the sign up process");
        }
      } else {
        const result = await signIn.create({
          identifier,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push(redirectUrl);
        } else {
          setError(result.status ?? "Authentication could not be completed");
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (
    strategy: "oauth_google" | "oauth_microsoft" | "oauth_github"
  ) => {
    if (!isLoaded || !isSignUpLoaded || !signIn || !signUp) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      const redirectOptions = {
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectUrl,
      };

      if (isSignUp) {
        await signUp.authenticateWithRedirect(redirectOptions);
      } else {
        await signIn.authenticateWithRedirect(redirectOptions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Gem className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">DiamondFlow</h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{isSignUp ? "Create account" : "Sign in"}</CardTitle>
            <CardDescription>
              {isSignUp
                ? "Enter your details to create an account"
                : "Enter your credentials to access your dashboard"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="you@company.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete={isSignUp ? "email" : "username"}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <a href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  disabled={isLoading}
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : (isSignUp ? "Create account" : "Sign in")}
              </Button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleOAuth("oauth_google")} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuth("oauth_microsoft")} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#00A4EF" d="M12.12 7.79c2.3.01 3.83 4.02 1.24 4.77-1.34.4-2.78.67-4.13.81v3.08h5.25v-2.13c-.01-.01.02-.01.02-.02 1.87-1.35 3.38-3.56 3.76-5.36z" />
                <path fill="#7FBA00" d="M16.39 11.36c-.39-.03-1.17-.12-1.75-.22.7-.39 1.16-1.04 1.16-1.71 0-.58-.3-1.09-.77-1.43l.58-.6c.98.65 1.68 1.67 1.68 2.89 0 2.1-1.56 3.85-3.66 4.33v-2.1h-2.94c.17-.57.28-1.19.31-1.85h4.21zm-7.31 1.56c.13-.78.2-1.73.2-2.68s-.08-1.8-.22-2.47c.57-.3 1.19-.46 1.9-.46 1.8 0 3.4.94 3.4 2.6s-1.6 2.63-3.4 2.64c-.75 0-1.44-.19-2.03-.49v2.6c1.66.35 3.1.75 4.13.8v3.06c-2.61-.45-4.86-1.84-5.97-4.17 1.8-2.52 3.28-5.17 3.28-7.85 0-.02 0-.04 0-.06-.54-3.06-2.58-5.52-5.83-6.59-.51-.16-1.03-.27-1.57-.27-2.57 0-4.82 1.5-5.82 3.88-.69 1.67-1.03 3.62-1.03 5.7 0 4.1 2.66 7.62 6.74 8.23V12H4.8v2.09c.89-.7 2.06-1.46 3.52-2.03z" />
                <path fill="#F25022" d="M4.8 7.79v2.09c2.55 1.07 4.86 2.58 6.59 4.63.58.63 1.1 1.25 1.57 1.87V12H4.8c-.54 2.79 1.71 5.3 4.72 6.53 2.42.98 5.14 1.48 7.85 1.48 4.74 0 7.96-2.56 8.53-6.19h-2.96c-.01.01-.01.01-.02.02-1.72 1.18-3.35 2.72-3.77 4.68h2.92c.82-1.64 1.48-3.47 1.48-5.42 0-3.54-2.34-6.37-6.23-7.17-.54-.13-1.1-.2-1.65-.2-2.41 0-4.44 1.29-5.56 3.39zm14.14 4.91c-.87 1.2-1.95 2.36-3.28 3.39v-2.15h2.94c.02.64.1 1.25.19 1.82h4.19c-.53-2.53-2.23-4.86-4.6-6.6v2.13h-3.02zm-9.3-2.52c0-2.41.94-4.36 2.64-5.83 1.7-1.46 4.12-2.31 7.1-2.31 1.26 0 2.44.16 3.5.4v2.17c-.73-.25-1.5-.46-2.33-.46-2.74 0-5.01 1.8-5.8 4.47-.58 1.89-.88 4.02-.88 6.12 0 2.5 1.1 4.63 3.02 6.03 2.65 1.98 6.2 2.64 8.78 1.58.87-.37 1.71-.78 2.5-1.24V12h-2.9c-.17.57-.28 1.19-.31 1.86h-4.21c-.03-.8-.06-1.6-.07-2.4h4.25c-.44-2.34-2.05-4.5-4.28-6.12-2.12-1.52-4.63-2.4-7.52-2.4-2.64 0-4.83 1.06-6.23 2.77-.33.39-.52.83-.58 1.33h-2.59z" />
              </svg>
              Microsoft
            </Button>
            <Button variant="outline" onClick={() => handleOAuth("oauth_github")} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 4.873-12 10.874 0 4.829 3.163 8.924 7.547 10.38.551.1.754-.232.754-.517 0-.255-.01-0.927-.014-1.818-3.063.669-3.718-1.529-3.718-1.529-.503-1.281-1.231-1.625-1.231-1.625-1.006-.69.076-.678.076-.678 1.112.08 1.701 1.14 1.701 1.14 1 1.665 2.618 1.184 3.253.904.1-.701.387-1.179.707-1.45-2.477-.557-5.078-1.236-5.078-5.495 0-1.212.435-2.199 1.152-2.97-.115-.28-.501-1.41.11-2.93 0 0 .939-.3 3.07 1.15.89-.25 1.82-.38 2.76-.38.94 0 1.87.13 2.76.38 2.13-1.45 3.06-1.15 3.06-1.15.618 1.52.234 2.65.11 2.93.72.77 1.153 1.758 1.153 2.97 0 4.276-2.593 4.964-5.07 5.493.4.342.758 1.019.758 2.05 0 1.468-.012 2.642-.012 3.003 0 .296.203.641.764.51C20.836 20.866 24 16.771 24 11.946c0-6.001-4.874-10.874-10.874-10.874z"/>
              </svg>
              GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Access is governed by your organization&apos;s account policies.
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
