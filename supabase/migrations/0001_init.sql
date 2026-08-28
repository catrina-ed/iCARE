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
