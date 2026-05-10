SELECT *
FROM public.sources
WHERE user_id IS NULL;

DELETE FROM public.sources
WHERE user_id IS NULL;