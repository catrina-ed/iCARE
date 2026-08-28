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
