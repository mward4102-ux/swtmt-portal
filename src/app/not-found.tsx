import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <h1 className="text-4xl font-bold text-navy mb-2">404</h1>
      <p className="text-slate-600 mb-4">Page not found.</p>
      <Link
        href="/"
        className="text-sm text-navy hover:text-gold underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
