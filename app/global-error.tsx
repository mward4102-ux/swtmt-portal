"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#11355a" }}>Something went wrong</h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>A critical error occurred.{error?.digest ? ` (${error.digest})` : ""}</p>
          <button onClick={reset} style={{ marginTop: 16, background: "#125a9e", color: "#fff", border: 0, borderRadius: 10, padding: "10px 18px", fontWeight: 600 }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
