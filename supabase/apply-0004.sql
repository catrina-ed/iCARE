-- iCare - role rework + verification.
-- Paste into the Supabase SQL Editor and press Run.
-- The verification rolls itself back; the migration does not.

-- Rework the role model.
--
-- The original enum came from the first prototype (admin / co-caretaker /
-- professional / recipient / network). The care circle is actually:
--
--   master-admin  the circle's owner; the only role that can grant admin
--   admin         granted by the master admin, capped at ADMIN_LIMIT total
--   pa            personal assistants
--   family        family members
--   recipient     the person being cared for
--
-- Catina and Darren moved from paid caregivers to family members, and the
-- notion of a master admin is new.

alter type care_role rename to care_role_old;

create type care_role as enum ('master-admin', 'admin', 'pa', 'family', 'recipient');

alter table household_members
  alter column role type care_role
  using (
    case role::text
      when 'admin'         then 'master-admin'
      when 'co-caretaker'  then 'pa'
      when 'professional'  then 'family'
      when 'network'       then 'family'
      else role::text
    end
  )::care_role;

drop type care_role_old;

-- is_household_admin now covers both admin roles, so a granted admin sees
-- confidential notes exactly as the master admin does.
create or replace function is_household_admin(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid
      and profile_id = auth.uid()
      and role in ('master-admin', 'admin')
  );
$$;

-- Only the master admin may grant or revoke admin, and only up to the cap.
-- Enforced in the database because the UI disabling a button is not a rule.
create or replace function enforce_admin_limit()
returns trigger
language plpgsql
as $$
declare
  admin_count int;
begin
  if new.role in ('master-admin', 'admin') then
    select count(*) into admin_count
    from household_members
    where household_id = new.household_id
      and role in ('master-admin', 'admin')
      and profile_id <> new.profile_id;

    if admin_count >= 2 then
      raise exception 'a household may have at most 2 admins';
    end if;
  end if;

  return new;
end;
$$;

create trigger household_members_admin_limit
  before insert or update on household_members
  for each row execute function enforce_admin_limit();


-- Verifies the access rules actually hold, by simulating signed-in users.
--
-- Runs inside a transaction that is rolled back at the end, so it leaves
-- nothing behind. It raises an exception on the first rule that fails; if you
-- see "Success" with no error, every check passed.
--
-- Necessary because the SQL editor runs as a superuser, which bypasses RLS --
-- so each check switches to the "authenticated" role and sets the JWT claim
-- that auth.uid() reads, the same way a real request arrives.
--
-- Run this AFTER 0004_roles.sql. It uses the current role model:
-- master-admin / admin / pa / family / recipient.

begin;

do $$
declare
  zero     uuid := '00000000-0000-0000-0000-000000000000';
  house_a  uuid;
  house_b  uuid;
  master_u uuid := gen_random_uuid();  -- master admin of household A
  pa_u     uuid := gen_random_uuid();  -- personal assistant in household A
  fam_u    uuid := gen_random_uuid();  -- family member in household A
  out_u    uuid := gen_random_uuid();  -- member of household B only
  seen     int;
begin
  -- Four users. Inserting into auth.users also exercises the signup trigger.
  insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at, raw_user_meta_data)
  values (master_u, zero, 'authenticated', 'authenticated', 'master@verify.local', now(), now(), '{}'::jsonb),
         (pa_u,     zero, 'authenticated', 'authenticated', 'pa@verify.local',     now(), now(), '{}'::jsonb),
         (fam_u,    zero, 'authenticated', 'authenticated', 'fam@verify.local',    now(), now(), '{}'::jsonb),
         (out_u,    zero, 'authenticated', 'authenticated', 'out@verify.local',    now(), now(), '{}'::jsonb);

  select count(*) into seen from profiles where id in (master_u, pa_u, fam_u, out_u);
  if seen <> 4 then
    raise exception 'FAIL: signup trigger created % of 4 profiles', seen;
  end if;

  insert into households (name) values ('Verify A') returning id into house_a;
  insert into households (name) values ('Verify B') returning id into house_b;

  insert into household_members (household_id, profile_id, role) values
    (house_a, master_u, 'master-admin'),
    (house_a, pa_u,     'pa'),
    (house_a, fam_u,    'family'),
    (house_b, out_u,    'master-admin');

  insert into care_log (household_id, author, tag, text, confidential) values
    (house_a, master_u, 'general', 'shared note',     false),
    (house_a, master_u, 'health',  'private note',    true),
    (house_a, pa_u,     'mood',    'pa private note', true),
    (house_b, out_u,    'general', 'other household', false);

  ---------------------------------------------------------------- check 1
  -- A personal assistant sees the shared note and their OWN private note,
  -- but not the master admin's private note.
  perform set_config('request.jwt.claims', json_build_object('sub', pa_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log;
  execute 'reset role';
  if seen <> 2 then
    raise exception 'FAIL: pa sees % care_log rows, expected 2 (shared + own private)', seen;
  end if;

  ---------------------------------------------------------------- check 2
  -- A family member wrote nothing private, so they see only the shared note.
  perform set_config('request.jwt.claims', json_build_object('sub', fam_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log;
  execute 'reset role';
  if seen <> 1 then
    raise exception 'FAIL: family member sees % care_log rows, expected 1', seen;
  end if;

  ---------------------------------------------------------------- check 3
  -- The master admin sees everything in their household, and nothing from
  -- the other one.
  perform set_config('request.jwt.claims', json_build_object('sub', master_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log;
  execute 'reset role';
  if seen <> 3 then
    raise exception 'FAIL: master admin sees % care_log rows, expected 3', seen;
  end if;

  ---------------------------------------------------------------- check 4
  -- Someone outside household A sees none of its data at all.
  perform set_config('request.jwt.claims', json_build_object('sub', out_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log where household_id = house_a;
  execute 'reset role';
  if seen <> 0 then
    raise exception 'FAIL: outsider sees % rows from another household, expected 0', seen;
  end if;

  ---------------------------------------------------------------- check 5
  -- A member cannot post a note under someone else's name.
  perform set_config('request.jwt.claims', json_build_object('sub', pa_u)::text, true);
  execute 'set local role authenticated';
  begin
    insert into care_log (household_id, author, tag, text, confidential)
    values (house_a, master_u, 'general', 'forged note', false);
    execute 'reset role';
    raise exception 'FAIL: a member was able to write a note attributed to someone else';
  exception
    when insufficient_privilege then
      execute 'reset role';   -- expected: the policy refused it
  end;

  ---------------------------------------------------------------- check 6
  -- Promoting the PA to admin makes the master admin's private note visible
  -- to them, which is the whole point of granting admin.
  update household_members set role = 'admin'
   where household_id = house_a and profile_id = pa_u;

  perform set_config('request.jwt.claims', json_build_object('sub', pa_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log;
  execute 'reset role';
  if seen <> 3 then
    raise exception 'FAIL: granted admin sees % care_log rows, expected 3', seen;
  end if;

  ---------------------------------------------------------------- check 7
  -- The cap holds in the database, not just in the UI. Household A already
  -- has a master admin and a granted admin, so a third must be refused.
  begin
    update household_members set role = 'admin'
     where household_id = house_a and profile_id = fam_u;
    raise exception 'FAIL: a third admin was allowed; the cap is not enforced';
  exception
    when raise_exception then
      if sqlerrm like 'FAIL:%' then
        raise;                 -- our own failure, not the trigger's
      end if;
      -- expected: the trigger refused it
  end;

  raise notice 'ALL CHECKS PASSED';
end;
$$;

rollback;
