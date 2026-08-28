-- Verifies the access rules actually hold, by simulating two signed-in users.
--
-- Runs inside a transaction that is rolled back at the end, so it leaves
-- nothing behind. It raises an exception on the first rule that fails; if you
-- see "ALL CHECKS PASSED" the policies behave as intended.
--
-- Necessary because the SQL editor runs as a superuser, which bypasses RLS —
-- so each check switches to the "authenticated" role and sets the JWT claim
-- that auth.uid() reads, the same way a real request arrives.

begin;

do $$
declare
  zero    uuid := '00000000-0000-0000-0000-000000000000';
  house_a uuid;
  house_b uuid;
  admin_u uuid := gen_random_uuid();  -- admin of household A
  pro_u   uuid := gen_random_uuid();  -- professional in household A
  out_u   uuid := gen_random_uuid();  -- member of household B only
  seen    int;
begin
  -- Three users. Inserting into auth.users also exercises the signup trigger.
  insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at, raw_user_meta_data)
  values (admin_u, zero, 'authenticated', 'authenticated', 'admin@verify.local', now(), now(), '{}'::jsonb),
         (pro_u,   zero, 'authenticated', 'authenticated', 'pro@verify.local',   now(), now(), '{}'::jsonb),
         (out_u,   zero, 'authenticated', 'authenticated', 'out@verify.local',   now(), now(), '{}'::jsonb);

  -- The trigger should have mirrored all three into profiles.
  select count(*) into seen from profiles where id in (admin_u, pro_u, out_u);
  if seen <> 3 then
    raise exception 'FAIL: signup trigger created % of 3 profiles', seen;
  end if;

  insert into households (name) values ('Verify A') returning id into house_a;
  insert into households (name) values ('Verify B') returning id into house_b;

  insert into household_members (household_id, profile_id, role) values
    (house_a, admin_u, 'admin'),
    (house_a, pro_u,   'professional'),
    (house_b, out_u,   'admin');

  insert into care_log (household_id, author, tag, text, confidential) values
    (house_a, admin_u, 'general', 'shared note',     false),
    (house_a, admin_u, 'health',  'private note',    true),
    (house_b, out_u,   'general', 'other household', false);

  ---------------------------------------------------------------- check 1
  -- A professional in the household sees the shared note but NOT the
  -- confidential one, and nothing from the other household.
  perform set_config('request.jwt.claims', json_build_object('sub', pro_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log;
  execute 'reset role';
  if seen <> 1 then
    raise exception 'FAIL: professional sees % care_log rows, expected exactly 1 (the shared note)', seen;
  end if;

  ---------------------------------------------------------------- check 2
  -- The admin sees both notes in their own household, and still nothing
  -- from the other one.
  perform set_config('request.jwt.claims', json_build_object('sub', admin_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log;
  execute 'reset role';
  if seen <> 2 then
    raise exception 'FAIL: admin sees % care_log rows, expected 2', seen;
  end if;

  ---------------------------------------------------------------- check 3
  -- Someone outside household A sees none of its data at all.
  perform set_config('request.jwt.claims', json_build_object('sub', out_u)::text, true);
  execute 'set local role authenticated';
  select count(*) into seen from care_log where household_id = house_a;
  execute 'reset role';
  if seen <> 0 then
    raise exception 'FAIL: outsider sees % rows from another household, expected 0', seen;
  end if;

  ---------------------------------------------------------------- check 4
  -- A member cannot post a note under someone else's name.
  perform set_config('request.jwt.claims', json_build_object('sub', pro_u)::text, true);
  execute 'set local role authenticated';
  begin
    insert into care_log (household_id, author, tag, text, confidential)
    values (house_a, admin_u, 'general', 'forged note', false);
    execute 'reset role';
    raise exception 'FAIL: a member was able to write a note attributed to someone else';
  exception
    when insufficient_privilege then
      execute 'reset role';   -- expected: the policy refused it
  end;

  raise notice 'ALL CHECKS PASSED';
end;
$$;

rollback;
