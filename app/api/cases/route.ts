import { NextResponse } from 'next/server';
import { getAuthUser, getServiceClient } from '@/lib/api-auth';
import { checkCaseCreationLimit } from '@/lib/usage';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    return NextResponse.json({ cases: data });
  } catch (err: unknown) {
    console.error('Failed to create case:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { opponent_name, opponent_email, customer_type, amount, currency, overdue_days, description } = body;

    if (!opponent_name || typeof opponent_name !== 'string' || !opponent_name.trim()) {
      return NextResponse.json({ error: 'opponent_name is required' }, { status: 400 });
    }
    if (!opponent_email || typeof opponent_email !== 'string' || !opponent_email.trim()) {
      return NextResponse.json({ error: 'opponent_email is required' }, { status: 400 });
    }
    if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }

    const usageCheck = await checkCaseCreationLimit(user.id);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message ?? 'Usage limit reached' },
        { status: 402 }
      );
    }

    const supabase = getServiceClient();
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        opponent_name: opponent_name.trim(),
        opponent_email: opponent_email.trim(),
        customer_type: customer_type || 'other',
        amount,
        currency: currency || 'USD',
        overdue_days: overdue_days ?? 0,
        description: description || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (err: unknown) {
    console.error('Failed to create case:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}