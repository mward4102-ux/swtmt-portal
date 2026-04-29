import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
}
