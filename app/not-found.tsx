import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="h-12 w-12" />
      <h1 className="text-3xl font-extrabold text-brand-950">Page not found</h1>
      <p className="max-w-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link href="/" className="btn-primary mt-2">Go home</Link>
    </main>
  );
}
