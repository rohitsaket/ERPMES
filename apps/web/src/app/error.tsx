"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-muted-foreground">Something went wrong</p>
      <button onClick={() => reset()} className="text-sm text-primary underline-offset-4 hover:underline">
        Try again
      </button>
    </div>
  );
}
