import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkCaseCreationLimit } from '@/lib/usage';

async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { storageKey: 'sb-chasewise-auth-token', storage: { getItem: (key: string) => cookieStore.get(key)?.value ?? null, setItem: () => {}, removeItem: () => {} } } }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await supabase.from('cases').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    return NextResponse.json({ cases: data });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { customer_name, amount_owed, initial_overdue_days } = body;
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) return NextResponse.json({ error: 'customer_name is required' }, { status: 400 });
    if (amount_owed === undefined || amount_owed === null || typeof amount_owed !== 'number' || amount_owed <= 0) return NextResponse.json({ error: 'amount_owed must be a positive number' }, { status: 400 });
    if (initial_overdue_days === undefined || initial_overdue_days === null || typeof initial_overdue_days !== 'number' || initial_overdue_days < 0 || !Number.isInteger(initial_overdue_days)) return NextResponse.json({ error: 'initial_overdue_days must be a non-negative integer' }, { status: 400 });
    const usageCheck = await checkCaseCreationLimit(user.id);
    if (!usageCheck.allowed) return NextResponse.json({ error: usageCheck.message ?? 'Usage limit reached', error_code: usageCheck.error_code }, { status: 402 });
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: newCase, error } = await supabase.from('cases').insert({ user_id: user.id, customer_name: customer_name.trim(), amount_owed, initial_overdue_days }).select().single();
    if (error) return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function PUT() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }