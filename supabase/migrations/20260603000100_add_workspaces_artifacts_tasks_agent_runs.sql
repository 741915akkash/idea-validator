-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- WORKSPACES
-- =====================================================

create table if not exists public.workspaces (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.users(id)
        on delete cascade,

    name text not null,

    description text,

    status text not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_workspaces_user_id
on public.workspaces(user_id);

create index if not exists idx_workspaces_status
on public.workspaces(status);

-- =====================================================
-- QUIZZES -> WORKSPACES
-- =====================================================

alter table public.quizzes
add column if not exists workspace_id uuid;

do $$
begin
    if not exists (
        select 1
        from information_schema.table_constraints
        where constraint_name = 'quizzes_workspace_id_fkey'
    ) then
        alter table public.quizzes
        add constraint quizzes_workspace_id_fkey
        foreign key (workspace_id)
        references public.workspaces(id)
        on delete cascade;
    end if;
end $$;

create index if not exists idx_quizzes_workspace_id
on public.quizzes(workspace_id);

-- =====================================================
-- TASKS
-- =====================================================

create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),

    workspace_id uuid not null
        references public.workspaces(id)
        on delete cascade,

    parent_task_id uuid
        references public.tasks(id)
        on delete cascade,

    title text not null,

    description text,

    status text not null default 'pending',

    priority text not null default 'medium',

    task_type text not null default 'human',

    owner_type text not null default 'user',

    owner_id text,

    source_agent text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_workspace_id
on public.tasks(workspace_id);

create index if not exists idx_tasks_parent_task_id
on public.tasks(parent_task_id);

create index if not exists idx_tasks_status
on public.tasks(status);

create index if not exists idx_tasks_workspace_status
on public.tasks(workspace_id, status);

-- =====================================================
-- ARTIFACTS
-- =====================================================

create table if not exists public.artifacts (
    id uuid primary key default gen_random_uuid(),

    workspace_id uuid not null
        references public.workspaces(id)
        on delete cascade,

    quiz_id uuid
        references public.quizzes(id)
        on delete set null,

    task_id uuid,

    type text not null,

    title text,

    summary text,

    content_json jsonb not null default '{}'::jsonb,

    source_agent text,

    created_by uuid
        references public.users(id)
        on delete set null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_artifacts_workspace_id
on public.artifacts(workspace_id);

create index if not exists idx_artifacts_quiz_id
on public.artifacts(quiz_id);

create index if not exists idx_artifacts_type
on public.artifacts(type);

create index if not exists idx_artifacts_workspace_type
on public.artifacts(workspace_id, type);

-- =====================================================
-- ARTIFACTS -> TASKS FK
-- =====================================================

do $$
begin
    if not exists (
        select 1
        from information_schema.table_constraints
        where constraint_name = 'artifacts_task_id_fkey'
    ) then
        alter table public.artifacts
        add constraint artifacts_task_id_fkey
        foreign key (task_id)
        references public.tasks(id)
        on delete set null;
    end if;
end $$;

-- =====================================================
-- AGENT RUNS
-- =====================================================

create table if not exists public.agent_runs (
    id uuid primary key default gen_random_uuid(),

    workspace_id uuid not null
        references public.workspaces(id)
        on delete cascade,

    agent_name text not null,

    status text not null default 'running',

    input_summary jsonb,

    output_summary jsonb,

    started_at timestamptz not null default now(),

    completed_at timestamptz
);

create index if not exists idx_agent_runs_workspace_id
on public.agent_runs(workspace_id);

create index if not exists idx_agent_runs_agent_name
on public.agent_runs(agent_name);

create index if not exists idx_agent_runs_status
on public.agent_runs(status);