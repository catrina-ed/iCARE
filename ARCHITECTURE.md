# iCare architecture

How the demo, development, and production versions of the app relate. Written
2026-08-28, after the first prototype demo.

---

## The one seam that matters

Everything about what a person can see — which tabs appear, which notes are
visible, who can grant admin — is written against a single `role` value in
`web/src/state/CareProvider.tsx`. Demo and production differ only in where
that value comes from.

| | Where `currentUser` comes from | Where `role` comes from |
|---|---|---|
| Demo | The role switcher | `USERS[currentUser].role` in mock data |
| Production | `session.user.id` | The person's `household_members` row |

So there are not two apps. There is one app with two identity sources, and the
view logic downstream is shared. Any rule about who sees what should be written
once, against `role`, and never duplicated per environment.

---

## Three environments, one codebase

| | Data | Identity | Deployed at |
|---|---|---|---|
| **Demo** | Mock data in localStorage | Role switcher | `catrina-ed.github.io/iCARE/` |
| **Dev** | `icare-dev` Supabase project | Real login, fake people | localhost |
| **Production** | `icare-prod` Supabase project | Real login, the family | Its own URL, eventually a custom domain |

The demo is worth keeping permanently. It needs no login, holds nothing real,
and is safe to hand to anyone — which makes it the right thing to show a
funder, a clinician, or a family member deciding whether to join.

---

## Gate the demo at build time, never at runtime

The role switcher must not exist in a production bundle.

A runtime check leaves it in the shipped JavaScript, where anyone can reach it
through devtools and grant themselves admin. A build-time flag lets Vite
eliminate the branch entirely, so the code is not in the file at all:

```ts
// Replaced with a literal at build time, so the whole branch is dead code
// and the switcher never reaches a production bundle.
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'
```

This is not theoretical here. When `VITE_SUPABASE_URL` is unset, Vite already
drops the entire Supabase SDK from the bundle — 137KB gzipped down to 85KB.
Same mechanism, and it is why the demo build is smaller than the real one.

Applies to anything that fabricates identity or data: the role switcher, the
"Reset demo data" button, and the seed data itself.

---

## The data layer

`CareProvider` is deliberately the only module that knows where data lives.
Screens call `useCare()` and never learn what is behind it. Production adds a
second implementation behind the same context:

```
CareProvider (context + types)
├── MockCareProvider       localStorage, seed data, role switcher
└── SupabaseCareProvider   queries, realtime, session identity
```

Nothing in `screens/` should change when the second one lands. If a screen has
to know, the boundary is in the wrong place.

---

## Client filtering is UX, not security

`visibleCareLog` in `CareProvider` hides confidential notes from people who
should not see them. That exists so the UI does not display what the backend
would refuse to return — it is not what protects the data.

The protection is the row-level security policies in
`supabase/migrations/0002_rls.sql`, verified by `supabase/verify-rls.sql`.
They hold regardless of what the client does, which is the only guarantee
worth having for notes about someone's health.

The same principle governs the two-admin cap: the UI disables the button, and
`supabase/migrations/0004_roles.sql` enforces it with a database trigger. A
disabled button is not a rule.

---

## Order of work

1. Split `icare-dev` and `icare-prod` Supabase projects (P0 #1)
2. Apply migration 0004, the role rework (P0 #7)
3. Build `SupabaseCareProvider` against dev (P0 #2)
4. Gate the demo affordances behind `VITE_DEMO_MODE` (P0 #8)
5. Point the demo deploy at mock data and production at `icare-prod`

Step 4 must land before step 5, and before any real person signs in.
