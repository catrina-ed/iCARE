# Prototype port

Bringing the built app in `web/` into line with the prototype bundle
(`dose-log.jsx`, `dashboard.jsx`, `meds.jsx`, `desktop.jsx`, …).

Ordered so the things everything else sits on top of land first. Status is
honest: **Done** means it matches the prototype's behaviour, not that a
component with the right name exists.

| # | Feature | Prototype source | Status |
|---|---------|------------------|--------|
| 1 | Hearth palette + type ramp | `theme.jsx` | Done |
| 2 | Generic medication / condition data | `data.jsx` | Done |
| 3 | Dose-logging core — one tap, undo toast, not-taken sheet, Log all N | `dose-log.jsx` | Done |
| 4 | Meds screen — time buckets, progress bar with skipped segment | `meds.jsx` | Done (sub-tabs pending) |
| 5 | Tab restructure — Home / Meds / Move / Log / More | `app.jsx` | Done |
| 6 | Home dashboard — summary cells, alert rows with "Log it", up next | `dashboard.jsx` | Done |
| 7 | Care Log — compose box, tags, confidential toggle | `carelog.jsx` | Done |
| 8 | Calendar — week strip, attendee filter | `calendar.jsx` | Done |
| 9 | Movement | `exercise.jsx` | Done |
| 10 | Moments | `moments.jsx` | Done |
| 11 | Nutrition | `nutrition.jsx` | Done |
| 12 | Care Story | `care-story.jsx` | Done |
| 13 | Connectors | `connectors.jsx` | Done (sample-data banner added) |
| 14 | Voice mode (Gail only) | `voice.jsx` | Done (speech untested on a real device) |
| 15 | Day-one / empty states | `day-one.jsx` | Not started |
| 16 | Desktop reflow | `desktop.jsx` | Partial — sidebar, card grid, and the 7-column calendar done; the per-screen two-column layouts (Meds refills rail, Log filter rail, Home right rail) are not |

## Rules for the port

- **Anything a person creates or changes goes through `CareProvider`** — doses,
  notes, moments, movement sessions. Screens must not import mutable data from
  `shared/data.ts` directly, or the eventual database swap multiplies. Static
  reference content (meal suggestions, affirmations, verses) can stay a plain
  import; it is not user data.
- **First names only, no real medical detail.** The prototype's `data.jsx`
  carries surnames and would reintroduce them.
- **Keep what is newer here than in the prototype**: the master-admin role, the
  two-admin cap, and the Circle screen postdate the prototype and stay.
- **Deliberately skipped**: the Lamplight theme, and the prototype's Day-one
  scenario toggle as a permanent control (the empty states themselves are #15).
