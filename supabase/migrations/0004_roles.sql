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
