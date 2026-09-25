-- Database for letsplayot.com (Supabase). Safe to run again. In the project: SQL Editor → New query → paste → Run.
-- Every table is private to the signed-in user (row level security), except published CMS content,
-- which everyone may read. The shapes match the requests in src/lib/cloud-data.js,
-- src/lib/session-board-cloud.js, src/lib/cms-content.js and public/therapist/my-patients/patients.js.

-- Favorites, folders and saved treatment plans. Ids are made in the browser (storage.js uid()).
create table if not exists public.user_folders (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  activity_id text not null,
  folder_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.treatment_plans (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text,
  items jsonb not null default '[]',
  params jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clients of a therapist (first name only) and their daily session boards.
create table if not exists public.therapist_patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_meeting_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  patient_id uuid not null references public.therapist_patients on delete cascade,
  board_date date not null,
  items jsonb not null default '[]',
  drawing_data jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  unique (user_id, patient_id, board_date)
);

-- Site content edited on /admin/cms. Only users listed in cms_admins may edit.
create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users on delete cascade
);

create table if not exists public.cms_content (
  content_type text not null,
  content_id text not null,
  payload jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_by uuid references auth.users on delete set null,
  updated_at timestamptz not null default now(),
  primary key (content_type, content_id)
);

-- Row level security: each user sees and changes only their own rows.
alter table public.user_folders enable row level security;
alter table public.user_favorites enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.therapist_patients enable row level security;
alter table public.daily_meeting_boards enable row level security;
alter table public.cms_admins enable row level security;
alter table public.cms_content enable row level security;

drop policy if exists "own folders" on public.user_folders;
create policy "own folders" on public.user_folders for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own favorites" on public.user_favorites;
create policy "own favorites" on public.user_favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own plans" on public.treatment_plans;
create policy "own plans" on public.treatment_plans for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own patients" on public.therapist_patients;
create policy "own patients" on public.therapist_patients for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own boards" on public.daily_meeting_boards;
create policy "own boards" on public.daily_meeting_boards for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.therapist_patients p where p.id = patient_id and p.user_id = auth.uid())
  );

drop policy if exists "admins see themselves" on public.cms_admins;
create policy "admins see themselves" on public.cms_admins for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "everyone reads published content" on public.cms_content;
create policy "everyone reads published content" on public.cms_content for select to anon, authenticated
  using (status = 'published' or exists (select 1 from public.cms_admins a where a.user_id = auth.uid()));
drop policy if exists "admins edit content" on public.cms_content;
create policy "admins edit content" on public.cms_content for all to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.cms_admins a where a.user_id = auth.uid()));

-- Calendar: which client comes on which day (optionally at a time, optionally every week).
-- Only a client reference, a date and a time are kept; no notes or summaries.
create table if not exists public.diary_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  patient_id uuid not null references public.therapist_patients on delete cascade,
  start_date date not null,
  start_time text,
  weekly boolean not null default false,
  end_date date,
  skipped_dates date[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.diary_appointments enable row level security;
drop policy if exists "own appointments" on public.diary_appointments;
create policy "own appointments" on public.diary_appointments for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.therapist_patients p where p.id = patient_id and p.user_id = auth.uid())
  );
