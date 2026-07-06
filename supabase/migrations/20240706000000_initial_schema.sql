-- ============================================================
-- PROFILES TABLE (extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_pro BOOLEAN DEFAULT false,
  monthly_case_count INTEGER DEFAULT 0,
  last_case_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CASES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  opponent_email TEXT NOT NULL,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('wholesaler', 'agent', 'service_provider', 'other')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  overdue_days INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  current_round INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROUNDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('R1', 'R2', 'R3')),
  email_content TEXT NOT NULL,
  opponent_response TEXT,
  opponent_response_type TEXT CHECK (opponent_response_type IN ('positive', 'neutral', 'negative', 'no_response')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- WEBHOOK_EVENTS TABLE (idempotency for Creem)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON public.cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_rounds_case_id ON public.rounds(case_id);
CREATE INDEX IF NOT EXISTS idx_rounds_round_number ON public.rounds(case_id, round_number);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);

-- ============================================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS: PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS: CASES
-- ============================================================
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cases" ON public.cases;
CREATE POLICY "Users can view own cases" ON public.cases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own cases" ON public.cases;
CREATE POLICY "Users can create own cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
CREATE POLICY "Users can update own cases" ON public.cases
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;
CREATE POLICY "Users can delete own cases" ON public.cases
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on cases" ON public.cases;
CREATE POLICY "Service role full access on cases" ON public.cases
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS: ROUNDS
-- ============================================================
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view rounds of own cases" ON public.rounds;
CREATE POLICY "Users can view rounds of own cases" ON public.rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = rounds.case_id AND cases.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create rounds for own cases" ON public.rounds;
CREATE POLICY "Users can create rounds for own cases" ON public.rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = rounds.case_id AND cases.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access on rounds" ON public.rounds;
CREATE POLICY "Service role full access on rounds" ON public.rounds
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS: WEBHOOK_EVENTS
-- ============================================================
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on webhook_events" ON public.webhook_events;
CREATE POLICY "Service role full access on webhook_events" ON public.webhook_events
  FOR ALL USING (true)
  WITH CHECK (true);