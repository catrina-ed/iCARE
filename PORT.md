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
| 5 | Tab restructure — Home / Meds / Move / Log / More | `app.jsx` | Not started |
| 6 | Home dashboard — summary cells, alert rows with "Log it", up next | `dashboard.jsx` | Not started |
| 7 | Care Log — compose box, tags, confidential toggle | `carelog.jsx` | Not started |
| 8 | Calendar — week strip, attendee filter | `calendar.jsx` | Not started |
| 9 | Movement | `exercise.jsx` | Not started |
| 10 | Moments | `moments.jsx` | Not started |
| 11 | Nutrition | `nutrition.jsx` | Not started |
| 12 | Care Story | `care-story.jsx` | Not started |
| 13 | Connectors | `connectors.jsx` | Not started |
| 14 | Voice mode (Gail only) | `voice.jsx` | Not started |
| 15 | Day-one / empty states | `day-one.jsx` | Not started |
| 16 | Desktop reflow | `desktop.jsx` | Not started |

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
