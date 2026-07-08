import { NextResponse } from 'next/server';
import { getAuthUser, getServiceClient } from '@/lib/api-auth';
import { checkRoundCreationLimit } from '@/lib/usage';
import { generateEmail } from '@/lib/deepseek';
import { calcCurrentOverdueDays, computeTier } from '@/lib/tier';
import type { OpponentResponse } from '@/lib/types';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: caseItem, error: caseError } = await supabase
      .from('cases').select('*').eq('id', params.id).single();
    if (caseError || !caseItem) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseItem.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const opponentResponse = body.opponent_response as OpponentResponse;
    const emailContent = body.email_content as string;
    const preview = body.preview as boolean;
    const validResponses: OpponentResponse[] = ['positive', 'neutral', 'negative', 'no_response'];
    if (!opponentResponse || !validResponses.includes(opponentResponse)) {
      return NextResponse.json({ error: 'opponent_response must be one of: ' + validResponses.join(', ') }, { status: 400 });
    }

    const currentOverdue = calcCurrentOverdueDays(caseItem.overdue_days, caseItem.created_at);
    const { count: existingRounds, error: countError } = await supabase
      .from('rounds').select('*', { count: 'exact', head: true }).eq('case_id', params.id);
    if (countError) return NextResponse.json({ error: 'Failed to count rounds' }, { status: 500 });

    const nextRoundNumber = (existingRounds ?? 0) + 1;
    const tier = computeTier(currentOverdue, nextRoundNumber);

    // Preview mode: only generate email, don't save
    if (preview) {
      const generated = await generateEmail({
        customerName: caseItem.opponent_name,
        amountOwed: caseItem.amount,
        currentOverdueDays: currentOverdue,
        roundNumber: nextRoundNumber,
        tier,
        opponentResponse,
      });
      return NextResponse.json({
        preview: true,
        email: generated.email,
        next_round_number: nextRoundNumber,
        current_overdue_days: currentOverdue,
        tier,
      });
    }

    // Confirm mode: use provided email content and save to database
    const usageCheck = await checkRoundCreationLimit(user.id, params.id);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message ?? 'Usage limit reached', error_code: usageCheck.error_code },
        { status: 402 }
      );
    }

    const { data: newRound, error: insertError } = await supabase
      .from('rounds')
      .insert({
        case_id: params.id,
        round_number: nextRoundNumber,
        tier,
        email_content: emailContent,
        opponent_response: opponentResponse,
        opponent_response_type: opponentResponse,
      })
      .select()
      .single();

    if (insertError) return NextResponse.json({ error: 'Failed to create round' }, { status: 500 });

    await supabase.from('cases').update({ current_round: nextRoundNumber }).eq('id', params.id);

    return NextResponse.json({ round: newRound, current_overdue_days: currentOverdue, tier, confirmed: true });
  } catch (err: unknown) {
    console.error('Failed to create round:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}