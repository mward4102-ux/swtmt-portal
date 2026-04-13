import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Chatbot } from '@/components/Chatbot';
import { createServerClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'SWTMT Portal',
  description: 'SDVOSB intake, bid lifecycle, and document automation'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="bg-navy text-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-wide">
              SWTMT <span className="text-gold">Portal</span>
            </Link>
            {user && (
              <nav className="flex gap-5 text-sm">
                <Link href="/bids" className="hover:text-gold">Bids</Link>
                <Link href="/intake" className="hover:text-gold">Intake</Link>
                <Link href="/companies" className="hover:text-gold">Companies</Link>
                <Link href="/api/auth/signout" className="hover:text-gold">Sign out</Link>
              </nav>
            )}
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        {user && <Chatbot />}
      </body>
    </html>
  );
}
