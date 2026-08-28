-- Supplies.
--
-- The original schema modelled only the entities that had working UI at the
-- time; the Supplies screen was built afterwards, so it has had nothing to read
-- from. Mirrors the ShoppingItem type in shared/types.ts.

create type shopping_category as enum ('groceries', 'toiletries', 'medical', 'household');
create type shopping_status   as enum ('needed', 'assigned', 'purchased');

create table shopping_items (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid not null references households on delete cascade,
  name               text not null,
  category           shopping_category not null default 'groceries',
  status             shopping_status not null default 'needed',
  -- Who said they would get it. The point of the screen: two caretakers
  -- should not buy the same thing.
  assigned_to        uuid references profiles,
  claimed_at         timestamptz,
  purchased_by       uuid references profiles,
  purchased_at       timestamptz,
  notes              text,
  recurring          boolean not null default false,
  recurring_interval int,
  created_at         timestamptz not null default now()
);

create index on shopping_items (household_id, status);

alter table shopping_items enable row level security;

-- Supplies are ordinary shared care data: every member reads and writes them.
-- Nothing here is confidential, so there is no author-based restriction.
create policy "members read supplies" on shopping_items
  for select using (is_household_member(household_id));

create policy "members write supplies" on shopping_items
  for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
