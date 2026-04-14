import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

const PastPerformanceSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_type: z.string().optional(),
  contract_number: z.string().optional(),
  period_of_performance_start: z.string().optional(),
  period_of_performance_end: z.string().optional(),
  contract_value: z.number().optional(),
  scope: z.string().optional(),
  outcome: z.string().optional(),
  relevant_naics: z.array(z.string()).optional(),
  poc_name: z.string().optional(),
  poc_email: z.string().optional(),
  poc_phone: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const companyId = params.id;

  const { data: records, error } = await supabase
    .from('past_performance_records')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('period_of_performance_end', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ records: records || [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const companyId = params.id;

  // Verify company exists
  const { data: company } = await supabase.from('companies').select('id').eq('id', companyId).single();
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PastPerformanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: record, error } = await svc
    .from('past_performance_records')
    .insert({
      company_id: companyId,
      ...parsed.data,
      relevant_naics: parsed.data.relevant_naics || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, record });
}
