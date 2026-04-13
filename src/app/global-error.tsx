'use client';

// Root-level error boundary. Catches errors in the root layout itself.
// Must provide its own <html> and <body> because the root layout has already failed.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Portal Error
        </h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          {error.message || 'A critical error occurred. Please try refreshing.'}
        </p>
        <button
          onClick={reset}
          style={{
            background: '#1e3a5f',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
