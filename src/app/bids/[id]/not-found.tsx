import Link from 'next/link';

export default function BidNotFound() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <h1 className="text-4xl font-bold text-navy mb-2">404</h1>
      <p className="text-slate-600 mb-4">
        This bid doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/bids"
        className="text-sm text-navy hover:text-gold underline"
      >
        Back to pipeline
      </Link>
    </div>
  );
}
