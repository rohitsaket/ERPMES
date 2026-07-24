"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email.trim() });
      setStep("reset");
    } catch (caught: any) {
      setError(caught.errors?.[0]?.longMessage ?? "Unable to send a reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    if (!isLoaded || !signIn || !setActive) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/dashboard");
        return;
      }
      setError("Password reset requires another verification step.");
    } catch (caught: any) {
      setError(caught.errors?.[0]?.longMessage ?? "Unable to reset the password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            {step === "request"
              ? "Enter your account email to receive a verification code."
              : `Enter the code sent to ${email} and choose a new password.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {step === "request" ? (
            <form className="space-y-4" onSubmit={requestCode}>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading || !isLoaded}>
                {loading ? "Sending…" : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={resetPassword}>
              <div className="space-y-2">
                <Label htmlFor="reset-code">Verification code</Label>
                <Input
                  id="reset-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading || !isLoaded}>
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
