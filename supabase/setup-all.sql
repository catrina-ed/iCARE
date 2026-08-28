-- iCare - full schema setup.
-- Paste this whole file into the Supabase SQL Editor and press Run.
-- Safe to run once, on an empty project.

-- ============================================================
-- 0001_init.sql
-- ============================================================
-- iCare initial schema
--
-- Model: a household is one care circle (Gail + the people caring for her).
-- Every row belongs to a household, and access is decided by whether the
-- signed-in user is a member of that household and what role they hold.

create type care_role as enum ('admin', 'co-caretaker', 'professional', 'recipient', 'network');
create type dose_status  as enum ('given', 'upcoming', 'due', 'missed', 'skipped');
create type care_log_tag as enum ('general', 'meds', 'health', 'mood', 'nutrition', 'mobility', 'sleep');
create type task_category as enum ('personal-care', 'household', 'medical', 'errand', 'social');
create type medication_form as enum ('tablet', 'capsule', 'liquid', 'gummy', 'patch');

-- ---------------------------------------------------------------- households

create table households (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- One row per signed-in person. Mirrors auth.users, which we cannot query
-- directly from the client.
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  full_name  text,
  name       text not null,
  initials   text,
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households on delete cascade,
  profile_id   uuid not null references profiles on delete cascade,
  role         care_role not null,
  relationship text,
  created_at   timestamptz not null default now(),
  primary key (household_id, profile_id)
);

create table care_recipients (
  id                   uuid primary key default gen_random_uuid(),
  household_id         uuid not null references households on delete cascade,
  name                 text not null,
  nickname             text,
  age                  int,
  pronouns             text,
  conditions           text[] not null default '{}',
  allergies            text[] not null default '{}',
  blood_type           text,
  primary_care_provider text,
  specialist           text,
  pharmacy             text,
  insurance            text
);

-- ------------------------------------------------------------------ care data

create table medications (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households on delete cascade,
  name          text not null,
  dose          text not null,
  form          medication_form not null default 'tablet',
  instructions  text,
  prescribed_by text,
  pharmacy      text,
  refill_due    int,
  stock         int,
  created_at    timestamptz not null default now()
);

create table doses (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households on delete cascade,
  medication_id uuid not null references medications on delete cascade,
  scheduled_on  date not null default current_date,
  time          text not null,               -- HH:MM, matches the shared Dose type
  status        dose_status not null default 'upcoming',
  confirmed_by  uuid references profiles,
  confirmed_at  timestamptz,
  notes         text,
  created_at    timestamptz not null default now()
);

create table care_log (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  author       uuid not null references profiles,
  tag          care_log_tag not null default 'general',
  text         text not null,
  confidential boolean not null default false,
  created_at   timestamptz not null default now()
);

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  title        text not null,
  category     task_category not null default 'household',
  due_time     text,                          -- HH:MM
  assigned_to  uuid references profiles,
  done         boolean not null default false,
  completed_by uuid references profiles,
  completed_at timestamptz,
  notes        text,
  recurring    boolean not null default false,
  scheduled_on date not null default current_date,
  created_at   timestamptz not null default now()
);

create index on household_members (profile_id);
create index on doses      (household_id, scheduled_on);
create index on care_log   (household_id, created_at desc);
create index on tasks      (household_id, scheduled_on);
create index on medications(household_id);

-- ============================================================
-- 0002_rls.sql
-- ============================================================
-- Row-level security for iCare.
--
-- Everything hangs off two questions: is the signed-in user a member of this
-- household, and are they an admin of it. Both are answered by security-definer
-- functions rather than inline subqueries, because a policy on
-- household_members that reads household_members recurses infinitely.

create or replace function is_household_member(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and profile_id = auth.uid()
  );
$$;

create or replace function is_household_admin(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and profile_id = auth.uid() and role = 'admin'
  );
$$;

alter table households        enable row level security;
alter table profiles          enable row level security;
alter table household_members enable row level security;
alter table care_recipients   enable row level security;
alter table medications       enable row level security;
alter table doses             enable row level security;
alter table care_log          enable row level security;
alter table tasks             enable row level security;

-- ------------------------------------------------------------------ identity

create policy "read own profile or those sharing a household" on profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from household_members mine
      join household_members theirs on theirs.household_id = mine.household_id
      where mine.profile_id = auth.uid() and theirs.profile_id = profiles.id
    )
  );

create policy "insert own profile"  on profiles for insert with check (id = auth.uid());
create policy "update own profile"  on profiles for update using      (id = auth.uid());

create policy "read own households"   on households for select using (is_household_member(id));
create policy "admins update household" on households for update using (is_household_admin(id));

create policy "read membership of own households" on household_members
  for select using (is_household_member(household_id));
create policy "admins manage membership" on household_members
  for all using (is_household_admin(household_id))
  with check (is_household_admin(household_id));

-- ----------------------------------------------------------------- care data
-- Every member of a household can read and write its care data. Roles are not
-- yet used to narrow write access; the one access rule that matters today is
-- confidentiality on care_log, below.

create policy "members read recipients"  on care_recipients for select using (is_household_member(household_id));
create policy "admins write recipients"  on care_recipients for all
  using (is_household_admin(household_id)) with check (is_household_admin(household_id));

create policy "members read meds"  on medications for select using (is_household_member(household_id));
create policy "members write meds" on medications for all
  using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "members read doses"  on doses for select using (is_household_member(household_id));
create policy "members write doses" on doses for all
  using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "members read tasks"  on tasks for select using (is_household_member(household_id));
create policy "members write tasks" on tasks for all
  using (is_household_member(household_id)) with check (is_household_member(household_id));

-- A confidential note is visible only to household admins and to whoever wrote
-- it. Everyone else in the household never sees the row at all.
create policy "read non-confidential notes, own notes, or all as admin" on care_log
  for select using (
    is_household_member(household_id)
    and (not confidential or author = auth.uid() or is_household_admin(household_id))
  );

create policy "members write notes as themselves" on care_log
  for insert with check (is_household_member(household_id) and author = auth.uid());

create policy "authors edit own notes" on care_log
  for update using (author = auth.uid()) with check (author = auth.uid());

create policy "authors and admins delete notes" on care_log
  for delete using (author = auth.uid() or is_household_admin(household_id));

-- ============================================================
-- 0003_signup.sql
-- ============================================================
-- Signup plumbing.
--
-- Supabase creates rows in auth.users, which the client cannot read. This
-- mirrors each new user into public.profiles so the app has a name to show
-- against a dose or a note.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, full_name)
  values (
    new.id,
    new.email,
    -- Magic-link signup carries no name, so fall back to the local part of the
    -- email until the person sets one.
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Creates a household and makes the caller its admin, in one step, so the
-- first person in does not hit the chicken-and-egg problem where the
-- membership policies require a membership that does not exist yet.
create or replace function create_household(household_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;

  insert into households (name) values (household_name) returning id into new_id;

  insert into household_members (household_id, profile_id, role, relationship)
  values (new_id, auth.uid(), 'admin', 'Primary caretaker');

  return new_id;
end;
$$;

