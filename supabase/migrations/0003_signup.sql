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
