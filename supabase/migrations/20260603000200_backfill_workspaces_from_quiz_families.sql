-- =====================================================
-- BACKFILL WORKSPACES FROM EXISTING QUIZ FAMILIES
--
-- Assumptions:
--
-- Root Quiz:
--   parent_quiz_id IS NULL
--
-- Revision:
--   parent_quiz_id = root quiz id
--
-- One Workspace per Root Quiz Family
--
-- All quizzes in the family receive the same workspace_id
-- =====================================================

begin;

-- =====================================================
-- TEMP MAPPING TABLE
-- =====================================================

create temporary table workspace_migration_map (
    root_quiz_id uuid primary key,
    workspace_id uuid not null
);

-- =====================================================
-- CREATE ONE WORKSPACE PER ROOT QUIZ
-- =====================================================

insert into public.workspaces (
    user_id,
    name,
    status
)
select
    q.user_id,
    coalesce(
        nullif(trim(q.name), ''),
        'Untitled Startup'
    ),
    'active'
from public.quizzes q
where q.parent_quiz_id is null;

-- =====================================================
-- BUILD ROOT QUIZ -> WORKSPACE MAPPING
--
-- We rely on insertion order:
-- root quizzes ordered by id
-- workspaces ordered by created_at/id
--
-- Run this migration only once on a fresh
-- workspaces table.
-- =====================================================

insert into workspace_migration_map (
    root_quiz_id,
    workspace_id
)
select
    rq.id,
    w.id
from (
    select
        id,
        row_number() over (order by id) as rn
    from public.quizzes
    where parent_quiz_id is null
) rq
join (
    select
        id,
        row_number() over (order by created_at, id) as rn
    from public.workspaces
) w
on rq.rn = w.rn;

-- =====================================================
-- UPDATE ROOT QUIZZES
-- =====================================================

update public.quizzes q
set workspace_id = m.workspace_id
from workspace_migration_map m
where q.id = m.root_quiz_id;

-- =====================================================
-- UPDATE REVISIONS
-- =====================================================

update public.quizzes revision
set workspace_id = m.workspace_id
from workspace_migration_map m
where revision.parent_quiz_id = m.root_quiz_id;

-- =====================================================
-- VALIDATION
-- =====================================================

do $$
declare
    missing_workspace_count integer;
begin

    select count(*)
    into missing_workspace_count
    from public.quizzes
    where workspace_id is null;

    if missing_workspace_count > 0 then
        raise exception
            'Backfill failed: % quizzes still have null workspace_id',
            missing_workspace_count;
    end if;

end $$;

-- =====================================================
-- VALIDATION
-- ONE WORKSPACE PER FAMILY
-- =====================================================

do $$
declare
    invalid_family_count integer;
begin

    with families as (
        select
            coalesce(parent_quiz_id, id) as root_quiz_id,
            count(distinct workspace_id) as workspace_count
        from public.quizzes
        group by 1
    )
    select count(*)
    into invalid_family_count
    from families
    where workspace_count > 1;

    if invalid_family_count > 0 then
        raise exception
            'Backfill failed: % quiz families mapped to multiple workspaces',
            invalid_family_count;
    end if;

end $$;

commit;