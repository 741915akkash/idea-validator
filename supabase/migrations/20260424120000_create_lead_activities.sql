-- Create lead_activities table

CREATE TABLE public.lead_activities (
  id BIGSERIAL PRIMARY KEY,
  lead_id INT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'email', 'call')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes

CREATE INDEX idx_lead_activities_lead_id
  ON public.lead_activities (lead_id);

CREATE INDEX idx_lead_activities_created_at
  ON public.lead_activities (created_at DESC);