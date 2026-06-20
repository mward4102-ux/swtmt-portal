"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-extrabold text-brand-950">Something went wrong</h1>
      <p className="max-w-sm text-slate-500">An unexpected error occurred. You can try again.</p>
      <button className="btn-primary mt-2" onClick={reset}>Try again</button>
    </main>
  );
}
