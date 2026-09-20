CREATE TABLE public.proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL,
  recipient_name text NOT NULL DEFAULT '',
  sender_name text NOT NULL DEFAULT '',
  theme text NOT NULL DEFAULT 'rose',
  music text NOT NULL DEFAULT 'none',
  headline text NOT NULL,
  message text NOT NULL,
  celebration text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.proposals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with the link can view a proposal"
  ON public.proposals FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert their own proposals"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Creators can update their own proposals"
  ON public.proposals FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Creators can delete their own proposals"
  ON public.proposals FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

CREATE TABLE public.proposal_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('opened', 'yes', 'no')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX proposal_events_proposal_id_idx ON public.proposal_events (proposal_id, created_at DESC);

GRANT INSERT ON public.proposal_events TO anon;
GRANT SELECT, INSERT ON public.proposal_events TO authenticated;
GRANT ALL ON public.proposal_events TO service_role;

ALTER TABLE public.proposal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record proposal activity"
  ON public.proposal_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id));

CREATE POLICY "Creators can view activity for their proposals"
  ON public.proposal_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.owner_id = auth.uid()));