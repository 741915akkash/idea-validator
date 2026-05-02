ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS phone text;

CREATE INDEX IF NOT EXISTS idx_leads_phone
ON public.leads(phone);
