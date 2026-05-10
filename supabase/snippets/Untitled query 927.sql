WITH latest_quiz_per_user AS (
  SELECT DISTINCT ON (q.user_id)
    q.user_id,
    q.id AS quiz_id
  FROM public.quizzes q
  WHERE q.user_id IS NOT NULL
  ORDER BY q.user_id, q.started_at DESC NULLS LAST, q.id DESC
)
UPDATE public.sources s
SET quiz_id = lu.quiz_id
FROM latest_quiz_per_user lu
WHERE s.user_id = lu.user_id
  AND s.quiz_id IS NULL;