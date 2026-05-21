CREATE TABLE IF NOT EXISTS public.knowledge_base_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NULL,
  content text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  source text NOT NULL DEFAULT 'quick_capture',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT knowledge_base_notes_source_check
    CHECK (source = ANY (ARRAY['quick_capture'::text, 'question_note'::text, 'imported'::text]))
);

CREATE INDEX IF NOT EXISTS idx_kb_notes_quiz_created
  ON public.knowledge_base_notes (quiz_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kb_notes_user_created
  ON public.knowledge_base_notes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kb_notes_tags_gin
  ON public.knowledge_base_notes USING gin (tags);
