'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <h2 className="text-xl font-bold text-ink mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-600 mb-4">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="bg-navy hover:bg-ink text-white px-4 py-2 rounded text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
