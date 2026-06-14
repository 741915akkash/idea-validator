ALTER TABLE pipelines
DROP CONSTRAINT pipelines_user_id_fkey;

ALTER TABLE pipelines
ADD CONSTRAINT pipelines_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;