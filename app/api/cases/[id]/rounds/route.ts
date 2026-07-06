import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkRoundCreationLimit } from '@/lib/usage';
import { generateEmail } from '@/lib/deepseek';
import { calcCurrentOverdueDays, computeTier } from '@/lib/tier';
import type { OpponentResponse } from '@/lib/types';

async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { storageKey: 'sb-chasewise-auth-token', storage: { getItem: (key: string) => cookieStore.get(key)?.value ?? null, setItem: () => {}, removeItem: () => {} } } });
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: caseItem, error: caseError } = await supabase.from('cases').select('*').eq('id', params.id).single();
    if (caseError || !caseItem) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseItem.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const usageCheck = await checkRoundCreationLimit(user.id, params.id);
    if (!usageCheck.allowed) return NextResponse.json({ error: usageCheck.message ?? 'Usage limit reached', error_code: usageCheck.error_code }, { status: 402 });

    const body = await request.json();
    const opponentResponse = body.opponent_response as OpponentResponse;
    const validResponses: OpponentResponse[] = ['invoice_issue', 'goods_not_arrived', 'boss_on_trip', 'next_week', 'hired_lawyer', 'custom'];
    if (!opponentResponse || !validResponses.includes(opponentResponse)) return NextResponse.json({ error: 'opponent_response is required and must be one of: ' + validResponses.join(', ') }, { status: 400 });
    const opponentResponseCustom = opponentResponse === 'custom' ? body.opponent_response_custom?.trim() || 'Custom response' : null;
    if (opponentResponse === 'custom' && !body.opponent_response_custom?.trim()) return NextResponse.json({ error: 'opponent_response_custom is required when opponent_response is "custom"' }, { status: 400 });

    const currentOverdue = calcCurrentOverdueDays(caseItem.initial_overdue_days, caseItem.created_at);
    const { count: existingRounds, error: countError } = await supabase.from('rounds').select('*', { count: 'exact', head: true }).eq('case_id', params.id);
    if (countError) return NextResponse.json({ error: 'Failed to count rounds' }, { status: 500 });
    const nextRoundNumber = (existingRounds ?? 0) + 1;
    const tier = computeTier(currentOverdue, nextRoundNumber);

    const responseLabels: Record<OpponentResponse, string> = { invoice_issue: 'There is an issue with the invoice', goods_not_arrived: 'The goods have not arrived yet', boss_on_trip: 'The boss is on a business trip', next_week: 'Will pay next week', hired_lawyer: 'We have hired a lawyer', custom: opponentResponseCustom ?? 'Custom response' };
    const generated = await generateEmail({ customerName: caseItem.customer_name, amountOwed: caseItem.amount_owed, currentOverdueDays: currentOverdue, roundNumber: nextRoundNumber, tier, opponentResponse: responseLabels[opponentResponse] });

    const { data: newRound, error: insertError } = await supabase.from('rounds').insert({ case_id: params.id, round_number: nextRoundNumber, tier, opponent_response: opponentResponse, opponent_response_custom: opponentResponseCustom, generated_email_en: generated.email, rebuttals: generated.rebuttals }).select().single();
    if (insertError) return NextResponse.json({ error: 'Failed to create round' }, { status: 500 });

    return NextResponse.json({ round: newRound, current_overdue_days: currentOverdue, tier });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }