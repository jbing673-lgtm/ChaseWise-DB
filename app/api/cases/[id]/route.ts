import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { storageKey: 'sb-chasewise-auth-token', storage: { getItem: (key: string) => cookieStore.get(key)?.value ?? null, setItem: () => {}, removeItem: () => {} } } });
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: caseItem, error: caseError } = await supabase.from('cases').select('*').eq('id', params.id).single();
    if (caseError || !caseItem) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseItem.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { data: rounds, error: roundsError } = await supabase.from('rounds').select('*').eq('case_id', params.id).order('round_number', { ascending: true });
    if (roundsError) return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 });
    const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single();
    return NextResponse.json({ case: caseItem, rounds: rounds || [], profile: { is_pro: profile?.is_pro ?? false } });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: caseItem, error: caseError } = await supabase.from('cases').select('id, user_id').eq('id', params.id).single();
    if (caseError || !caseItem) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseItem.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { error: deleteError } = await supabase.from('cases').delete().eq('id', params.id);
    if (deleteError) return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
    return new NextResponse(null, { status: 204 });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }