# iCare — Family Caretaking Platform

A collaborative caretaking app for managing medications, appointments, care logs, and coordination across the family care circle. Built with React Native (iOS/Android via Expo) and React (web).

## Project Structure

```
iCARE/
├── app/              # React Native + Expo (iOS/Android)
├── web/              # React + Vite (Web browser)
├── shared/           # Shared types, data, theme
│   ├── types.ts      # TypeScript interfaces
│   ├── data.ts       # Mock data (Gail + family)
│   ├── theme.ts      # Design tokens (colors, typography, spacing)
│   └── index.ts
└── README.md         # This file
```

## Quick Start

### Mobile App (Expo)

```bash
cd app
npm install
npm run ios              # Run on iOS Simulator
npm run android          # Run on Android Emulator
npm run web              # Run on web (for dev)
npm start                # Start Expo development server
```

Then download the **Expo Go** app on your iPhone/Android, scan the QR code from the terminal, and test.

### Web App

```bash
cd web
npm install
npm run dev             # Start dev server (http://localhost:5173)
npm run build           # Build for production
npm run preview         # Preview production build
```

## Design

- **Direction**: Hearth (warm, grounded, sage-led)
- **Palette**: Cocoa base (#29261b), Sage accent (#6b9f8d), Coral alerts (#e8614f)
- **Typography**: System fonts, humanist sans-serif
- **Components**: Card-based, generous padding, mobile-first

See `shared/theme.ts` for all design tokens.

## Key Features (MVP)

1. **Home Dashboard** — overview of today's care status, active alerts, care log feed
2. **Medications** — daily dose schedule, refill tracker, dose logging
3. **Appointments** — shared calendar, assignment, post-visit notes
4. **Care Log** — structured notes with confidential toggle (admin only)
5. **Shopping List** — shared, claim/complete workflow
6. **Alerts** — smart notifications for missed doses, upcoming appointments, low supplies

## Mock Data

Care recipient: **Gail**, 78

Family & care team:
- **Trina** (master-admin) — Primary caretaker, and the only person who can grant admin
- **Markyaah** (pa) — Personal Assistant
- **Destiny** (pa) — Personal Assistant
- **Catina** (family) — Family
- **Darren** (family) — Family

First names only: the people in this circle are real, so surnames are not
published here or in `shared/data.ts`.

See `shared/data.ts` for full details.

## Development

### Adding a new screen/feature

1. Create types in `shared/types.ts` if needed
2. Add mock data to `shared/data.ts`
3. Build the component in `app/app/(screens)/` (mobile) and `web/src/components/` (web)
4. Wire it to the router/navigation

### Shared code

Both `app` and `web` can import from `../shared`:

```typescript
// In app/app/(screens)/Medications.tsx or web/src/components/Medications.tsx
import { MEDICATIONS, COLORS, USERS } from '../../shared';
```

## Expo Tips

- **Expo Go**: Free testing app for iPhone/Android. Scan QR from terminal to load your app.
- **Development**: All changes hot-reload automatically.
- **TestFlight**: When ready, use Apple's free beta testing (no App Store review).
- **App Store**: Later, if you want official distribution.

## Next Steps

1. ✅ Project scaffolding
2. ⏳ Build Home Dashboard (web + mobile)
3. ⏳ Build Medications screen
4. ⏳ Build Care Log
5. ⏳ Build Calendar
6. ⏳ Authentication
7. ⏳ Backend (Firebase or Supabase)
8. ⏳ Deploy to Expo Go, TestFlight, App Store

---

**Built with** React Native, Expo, React, Vite, TypeScript
