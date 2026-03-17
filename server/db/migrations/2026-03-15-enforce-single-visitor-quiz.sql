-- Enforce one quiz per anonymous visitor.
CREATE UNIQUE INDEX IF NOT EXISTS idx_quizzes_visitor_id_unique
  ON public.quizzes (visitor_id)
  WHERE visitor_id IS NOT NULL;
