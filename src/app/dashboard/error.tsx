"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-serif text-3xl font-bold text-maroon">
        Oops! Something went wrong.
      </h1>
      <p className="mt-4 text-ink-soft">
        We encountered an error while loading your dashboard. This might be a temporary network issue.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </div>
    </div>
  );
}
