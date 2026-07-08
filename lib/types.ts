export type Tier = 'R1' | 'R2' | 'R3';

export type OpponentResponse = 'positive' | 'neutral' | 'negative' | 'no_response';

export const OPPONENT_RESPONSE_LABELS: Record<OpponentResponse, string> = {
  positive: 'Positive — they agreed to pay',
  neutral: 'Neutral — they acknowledged but no commitment',
  negative: 'Negative — they refused or disputed',
  no_response: 'No Response — they ignored the message',
};

export interface Profile {
  id: string;
  email: string;
  is_pro: boolean;
  monthly_case_count: number;
  last_case_reset: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  opponent_name: string;
  opponent_email: string;
  customer_type: 'wholesaler' | 'agent' | 'service_provider' | 'other';
  amount: number;
  currency: string;
  overdue_days: number;
  description: string | null;
  current_round: number;
  status: 'active' | 'resolved' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Round {
  id: string;
  case_id: string;
  round_number: number;
  tier: Tier;
  email_content: string;
  opponent_response: string | null;
  opponent_response_type: OpponentResponse | null;
  created_at: string;
}

export interface CaseWithRounds extends Case {
  rounds: Round[];
}

export interface UsageCheckResult {
  allowed: boolean;
  error_code?: 'case_limit_reached' | 'round_limit_reached';
  message?: string;
}