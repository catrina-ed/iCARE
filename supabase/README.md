# iCare database

Postgres schema for the Supabase project backing the web app.

## Applying migrations

There is no Supabase CLI in this project yet, so run these by hand in the
Supabase dashboard under **SQL Editor**, in order:

1. `migrations/0001_init.sql` — tables, enums, indexes
2. `migrations/0002_rls.sql` — row-level security policies
3. `migrations/0003_signup.sql` — profile-on-signup trigger, `create_household()`
4. `migrations/0004_roles.sql` — the reworked role model and the admin cap
5. `migrations/0005_shopping.sql` — supplies

## Model

A **household** is one care circle. Every care row belongs to a household, and
access is decided by membership in that household plus the member's role.

Access rules worth knowing:

- Members of a household can read and write its medications, doses, and tasks.
- A **confidential** care-log note is readable only by its author and by
  household admins. Other members do not see the row at all.
- Only admins can change household membership or the care recipient's record.

Both checks run through `is_household_member()` and `is_household_admin()`,
which are `security definer` so that a policy on `household_members` does not
recurse into itself.

## Roles

`master-admin` owns the circle and is the only role that can grant or revoke
`admin`. At most two people may hold admin at once, enforced by a trigger in
`0004_roles.sql` rather than trusted to the UI. `pa` and `family` are
day-to-day care roles with identical access; `recipient` is the person being
cared for.

## Not yet modelled

Appointments, bills, and handoffs. Types for these exist in `shared/types.ts`
but they have no UI, so they have no tables yet.
