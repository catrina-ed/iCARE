# iCare backlog

Ordered by when it has to be handled, not by size. The trigger column matters
more than the ordering: some of these are harmless today and become urgent the
moment a specific thing changes.

Last reviewed: 2026-08-28

---

## P0 — before any real family member uses this

**This is a running list.** Items get added here as they surface and moved to
"Cleared" below when they are genuinely done — not when they are started, and
not when a workaround exists.

Everything here is fine while the data is fictional. All of it becomes a real
problem the day a real note about Mom's health is entered.

| # | Item | Trigger | Status |
|---|------|---------|--------|
| 1 | Split Supabase into dev and prod | Before inviting anyone real | Open |
| 2 | Make the app use the database | Blocked on #3, or on a dev user | Paused |
| 3 | Real SMTP for magic links | Hit 2026-08-27; deferred by choice to build screens first | Deferred |
| 4 | Invite flow for the care team | Before anyone but Trina signs in | Open |
| 5 | Make the repo private, move deploy to Netlify | Decided 2026-08-28; Catrina actioning | Open |
| 6 | Finish the auth flow end to end | After the 2026-08-28 presentation | Open |
| 7 | Apply migration 0004 (role rework) | Before the app reads from the database | Open |
| 8 | Gate demo affordances behind VITE_DEMO_MODE | Before production auth goes live | Open |
| 9 | Rotate the Supabase publishable key | It reached git history on 2026-08-27 | Open |

### 1. Split Supabase into separate dev and prod projects
**Trigger: before inviting anyone real.**
There is currently one project (`gmhzpbvgttxfqhsbhhkm`) serving as both the
development database and the family's live database. Testing a schema change
locally means running experiments against real health records, and a mistaken
`delete` or migration is unrecoverable.

Fix: create `icare-dev` and `icare-prod`. Localhost and `.env.local` point at
dev; the deployed site points at prod. Migrations get applied to dev first,
then prod once they work.

### 2. Make the app actually use the database
**Trigger: now — this is the current work.**
Auth is wired up, but the dashboard still reads and writes `localStorage`, so
every phone holds its own private copy. Until this lands, the app cannot
coordinate anything between two people, which is the entire point of it.

### 3. Real email delivery for magic links
**Trigger: hit on 2026-08-27, during the first sign-in test.**
Supabase's built-in sender is rate-limited to a couple of messages per hour on
the free tier. Two test sign-ins exhausted it and further attempts return
"email rate limit exceeded" — which is exactly how it would fail for five
family members signing in on the same evening, except they would read it as
the app being broken.

Note the rate limit for the built-in sender cannot be raised; configuring
custom SMTP is what unlocks the Auth rate-limit settings.

Fix: connect an SMTP provider (Resend and Postmark both have free tiers).

### 4. Invite flow for the care team
**Trigger: before anyone but Trina signs in.**
`create_household()` makes the first person an admin, but there is no way for
Markyaah, Destiny, Catina, or Darren to join a household. Right now a second
person signing in lands in an empty app with no route in.

### 5. Make the repo private and move the deploy to Netlify
**Decided 2026-08-28. Catrina is actioning this.**
`catrina-ed/iCARE` is public, which is what makes GitHub Pages free. Going
private means Pages needs a paid plan — but Netlify deploys private repos on
its free tier, and Catrina already has an account there.

Note what this does and does not fix: the surnames are gone from the current
files and the live bundle, but they remain in git history for every commit
before `defeef1`. Private is the practical answer; a history rewrite would be
disruptive and would not have helped the already-public deploy.

Real care data must live only in the database regardless — no seed files with
real notes, no screenshots with real health details in the README.

### 6. Finish the auth flow end to end
**Trigger: after the 2026-08-28 presentation.**
Magic-link sign-in is built and the email sends, but the flow is not complete:

- Redirect URL config is unverified — the first attempt landed on an
  unreachable page, most likely Supabase's default `localhost:3000` Site URL.
- Sign-in cannot be tested repeatedly until #3 (SMTP) is done. A dev-only
  password login against a user created by hand in the dashboard would unblock
  this without touching email.
- `currentUser` is still hardcoded to `'trina'`; it should come from the
  session, which is also what makes the confidential-notes rule observable in
  the UI.
- No profile setup — magic-link signup carries no name, so people land with
  the local part of their email as their display name.
- Auth is deliberately NOT enabled on the deployed site, so the demo needs no
  login. Turning it on requires build-time env vars in the Actions workflow.

### 7. Apply migration 0004, the role rework
**Trigger: before the app reads from the database.**
The role model changed on 2026-08-27 — master-admin / admin / pa / family /
recipient, with admin capped at two people and only the master admin able to
grant it. `supabase/migrations/0004_roles.sql` rewrites the enum, widens
`is_household_admin` to cover both admin roles, and adds a trigger enforcing
the cap in the database rather than trusting the UI.

It has NOT been run, and `verify-rls.sql` has not been re-run against it. Both
should happen together, since the RLS test inserts `'professional'`, a role
that no longer exists.

### 8. Gate the demo affordances behind a build-time flag
**Trigger: before production auth goes live, and before any real person signs in.**
The role switcher, the "Reset demo data" button, and the seed data must not
exist in a production bundle. A runtime check is not enough — it leaves the
switcher in the shipped JavaScript where devtools can reach it and grant
someone admin. A build-time `VITE_DEMO_MODE` flag lets Vite eliminate the
branch, so the code is not in the file at all.

Proven to work in this project: with `VITE_SUPABASE_URL` unset, Vite already
drops the whole Supabase SDK, taking the bundle from 137KB gzipped to 85KB.

See `ARCHITECTURE.md`.

### 9. Rotate the Supabase publishable key
**Trigger: it reached git history on 2026-08-27.**
Renaming `.env.local` to `.env.local.disabled` took it out of the `*.local`
ignore rule and it was committed in `ef0ee12` with the project URL and
publishable key. Untracked again in `9e4a84e`, and the ignore rule widened to
`.env.local*`.

The key is designed to be public and is guarded by RLS, so this is tidiness
rather than an incident — but rotating is two clicks in Project Settings > API
and removes the loose end. Update `web/.env.local.off` afterwards.

### Cleared

- **Surnames removed from published data** (2026-08-28, `defeef1`). The care
  circle's first names are real and the surnames were invented; publishing both
  together read as a real identifiable family. Display names, `fullName`, and
  the surname-derived initials are gone, and the live bundle was checked
  directly to confirm. Part of the wider work in #5.

---

## P1 — needed for the MVP to be worth showing

### 6. Replace the hardcoded current user
`currentUser` is pinned to `'trina'` in `web/src/App.tsx`, so every action is
attributed to Trina regardless of who is signed in. Should come from the
session. Also means the confidential-notes rule cannot be seen working in the
UI, even though the database enforces it correctly.

### 7. Seed the household with real medications and tasks
The mock data describes a fictional Gail. Once the data layer is live,
the real household needs its actual medications, schedules, and recurring
tasks entered — probably through the app rather than SQL.

### 8. Router, then the Meds and Calendar screens
`App.tsx` is the entire web app; a second screen requires routing first. Mobile
already has Meds, Calendar, and Care Log screens that web lacks. Note that
GitHub Pages needs a `404.html` fallback for client-side routing to survive a
refresh on a sub-path.

### 9. Supplies screen
`SHOPPING_ITEMS` exists in `shared/data.ts` with no UI on either platform.

---

## P2 — after the MVP is in the family's hands

### 10. Accessibility pass
Muted 14px text and small tap targets throughout. The people using this are on
phones, and at least one is 65. Larger type, higher contrast on secondary text,
bigger touch targets.

### 11. Missed-dose notifications
The alerting model is the reason to build this app at all, and it is currently
just UI state. Web push on iPhone requires the app be added to the home screen
first (iOS 16.4+). This is the constraint most likely to eventually force a
native build.

### 12. Bring the mobile app up to parity
`app/` has Home, Meds, Calendar, and Care Log, but only Care Log is
interactive. It has none of the modals, tasks, persistence, or auth. Deferred
by the web-first decision; revisit once the web MVP is validated.

### 13. Remaining entities
Appointments, bills, and handoffs have types in `shared/types.ts` but no
tables, no data, and no UI.

### 14. Desktop layout — Catrina is designing this
**Catrina is doing a design pass on the desktop web view (raised 2026-08-27).**
Do not spend more effort styling desktop until that lands; the current sidebar
and grid are a functional placeholder, not a direction. Reference she gave:
Neela's caregiver app — light theme, grouped sidebar with a profile block,
two-column card grid with "View all" affordances, prominent hero card.

Mobile is the focus in the meantime.

### 14b. Original note: a real desktop layout
The web app is a phone column centred on a laptop screen. That is honest and
fine, but it wastes a large screen — a caretaker doing paperwork at a computer
could see the calendar, med schedule, and notes side by side rather than
scrolling one narrow column. The phone-frame toggle is a demo aid, not an
answer to this.

### 15. Offline behaviour
Caretakers will use this in places with bad signal. Currently a failed request
just loses the action.

---

## Housekeeping

- `iCare-MVP-source.html` — a tracked 1.7 MB file at the repo root, unused.
- `app/src/app/index.tsx` and `app/src/app/explore.tsx` — unused Expo template
  leftovers; `_layout.tsx` renders `ICareBottomTabs` directly.
- `web/vite.config.ts` uses `__dirname`, which Vite warns about on every build.
- Business logic lives inline in `App.tsx`. Moving it into `shared/` keeps the
  eventual mobile port mechanical and gives the backend one place to plug into.
