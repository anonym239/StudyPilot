create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  description text not null default '',
  exam_date date,
  color text not null default 'violet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/pdf',
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  extracted_text text not null default '',
  status text not null default 'processing' check (status in ('processing','ready','failed')),
  error_message text,
  created_at timestamptz not null default now()
);
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  title text not null,
  content text not null,
  key_points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  question text not null,
  answer text not null,
  difficulty text not null default 'medium',
  created_at timestamptz not null default now()
);
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  question text not null,
  options jsonb not null,
  answer text not null,
  explanation text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  title text not null,
  type text not null default 'review',
  scheduled_for date not null,
  duration_minutes integer not null default 15 check (duration_minutes > 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes > 0),
  completed_at timestamptz not null default now()
);

create index if not exists documents_course_idx on public.documents(course_id);
create index if not exists learning_user_idx on public.summaries(user_id);
create index if not exists flashcards_document_idx on public.flashcards(document_id);
create index if not exists quizzes_document_idx on public.quizzes(document_id);
create index if not exists plan_user_date_idx on public.study_plan_items(user_id, scheduled_for);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email)); return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

do $$ declare t text; begin
  foreach t in array array['profiles','courses','documents','summaries','flashcards','quizzes','study_plan_items','study_sessions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format('drop policy if exists "owner_delete" on public.%I', t);
    if t = 'profiles' then
      execute 'create policy "owner_select" on public.profiles for select to authenticated using (auth.uid() = id)';
      execute 'create policy "owner_insert" on public.profiles for insert to authenticated with check (auth.uid() = id)';
      execute 'create policy "owner_update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id)';
      execute 'create policy "owner_delete" on public.profiles for delete to authenticated using (auth.uid() = id)';
    else
      execute format('create policy "owner_select" on public.%I for select to authenticated using (auth.uid() = user_id)', t);
      execute format('create policy "owner_insert" on public.%I for insert to authenticated with check (auth.uid() = user_id)', t);
      execute format('create policy "owner_update" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
      execute format('create policy "owner_delete" on public.%I for delete to authenticated using (auth.uid() = user_id)', t);
    end if;
  end loop;
end $$;

insert into storage.buckets (id, name, public) values ('course-documents','course-documents',false) on conflict (id) do update set public=false;
drop policy if exists "course documents read own" on storage.objects;
drop policy if exists "course documents write own" on storage.objects;
drop policy if exists "course documents delete own" on storage.objects;
create policy "course documents read own" on storage.objects for select to authenticated using (bucket_id = 'course-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "course documents write own" on storage.objects for insert to authenticated with check (bucket_id = 'course-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "course documents delete own" on storage.objects for delete to authenticated using (bucket_id = 'course-documents' and (storage.foldername(name))[1] = auth.uid()::text);