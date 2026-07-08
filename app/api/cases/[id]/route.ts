import { NextResponse } from 'next/server';
import { getAuthUser, getServiceClient } from '@/lib/api-auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: caseItem, error: caseError } = await supabase
      .from('cases').select('*').eq('id', params.id).single();
    if (caseError || !caseItem) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseItem.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: rounds, error: roundsError } = await supabase
      .from('rounds').select('*').eq('case_id', params.id).order('round_number', { ascending: true });
    if (roundsError) return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 });

    const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single();
    return NextResponse.json({ case: caseItem, rounds: rounds || [], profile: { is_pro: profile?.is_pro ?? false } });
  } catch (err: unknown) { console.error('Failed to get case:', err); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: caseItem, error: caseError } = await supabase
      .from('cases').select('id, user_id').eq('id', params.id).single();
    if (caseError || !caseItem) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseItem.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { error: deleteError } = await supabase.from('cases').delete().eq('id', params.id);
    if (deleteError) return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) { console.error('Failed to get case:', err); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}