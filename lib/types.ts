export type Tier = 'R1' | 'R2' | 'R3';

export type OpponentResponse =
  | 'invoice_issue'
  | 'goods_not_arrived'
  | 'boss_on_trip'
  | 'next_week'
  | 'hired_lawyer'
  | 'custom';

export const OPPONENT_RESPONSE_LABELS: Record<OpponentResponse, string> = {
  invoice_issue: 'Invoice issue',
  goods_not_arrived: 'Goods not arrived',
  boss_on_trip: 'Boss on trip',
  next_week: 'Next week',
  hired_lawyer: 'Hired lawyer',
  custom: 'Custom',
};

export interface Profile {
  id: string;
  email: string;
  is_pro: boolean;
  created_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  customer_name: string;
  amount_owed: number;
  initial_overdue_days: number;
  created_at: string;
}

export interface Round {
  id: string;
  case_id: string;
  round_number: number;
  tier: Tier;
  opponent_response: string;
  opponent_response_custom: string | null;
  generated_email_en: string;
  rebuttals: string[];
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