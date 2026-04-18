# RentEx Native App

Expo + React Native + expo-router.

## Setup

```bash
# 1) Install dependencies (includes new expo-secure-store for auth token storage)
npm install

# 2) Copy environment file and point to your backend
cp .env.example .env
# edit .env → EXPO_PUBLIC_API_URL=http://<your-LAN-ip>:3000

# 3) Backend prerequisite — set MOBILE_TOKEN_SECRET (>= 16 chars)
#    in the Next.js app (.env at repo root), e.g.:
#    MOBILE_TOKEN_SECRET=please-change-me-to-a-long-random-string

# 4) Run
npm run start     # Metro bundler
npm run android   # or
npm run ios       # or
npm run web
```

## Architecture

```
app/
  _layout.tsx           Root: fonts + AuthProvider + auth-aware redirect
  (auth)/               Unauthenticated routes
    login.tsx
    register.tsx
  (tabs)/               Authenticated tab shell
    index.tsx           Discover / Home
    two.tsx             My Bookings
    profile.tsx         Profile menu
  car/[id].tsx          Car detail
  booking/
    new.tsx             New booking flow
    [id].tsx            Booking detail (cancel)
  profile/
    edit.tsx
    password.tsx
    documents.tsx
  modal.tsx             Notifications

constants/
  Config.ts             API base URL resolver (env → expo host → emulator)
  Colors.ts

lib/
  api.ts                Fetch client + endpoints
  auth.tsx              AuthProvider + useAuth hook
  storage.ts            SecureStore (native) / localStorage (web) / memory
  format.ts             Currency / date helpers
  types.ts              Shared TypeScript types
```

## Backend endpoints consumed

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/mobile/auth/login` | POST | – |
| `/api/mobile/auth/register` | POST | – |
| `/api/mobile/auth/me` | GET, PATCH | Bearer |
| `/api/mobile/auth/logout` | POST | Bearer |
| `/api/mobile/auth/password` | POST | Bearer |
| `/api/cars` | GET | – |
| `/api/cars/[id]` | GET | – |
| `/api/mobile/bookings` | GET, POST | Bearer |
| `/api/mobile/bookings/[id]` | GET | Bearer |
| `/api/mobile/bookings/[id]/cancel` | POST | Bearer |
