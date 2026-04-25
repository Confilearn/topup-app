# TopupAfrica — Replit.md

## Overview

TopupAfrica is a **React Native mobile application** built with Expo for a VTU (Virtual Top-Up) platform operating in Africa. The app allows users to:

- Purchase airtime and data bundles for all major Nigerian networks
- Pay electricity bills, cable TV subscriptions, and internet services
- Manage a wallet with a virtual bank account for funding
- Track transaction history
- Earn rewards through a referral program

The app is currently **UI-focused with mock data** — it has a full visual implementation but no live backend integration yet. An Express server and PostgreSQL database are scaffolded but not yet wired up to the mobile app.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (Mobile App)

**Framework:** Expo + React Native with Expo Router (file-based routing)

**Navigation Structure:**
- `app/index.tsx` — Entry point; redirects to login or dashboard based on auth state
- `app/(auth)/` — Auth stack: login, signup, reset-password
- `app/(tabs)/` — Main tab navigator: dashboard, services, add-money, transactions, referrals, settings
- `app/transaction/[id].tsx` — Dynamic route for transaction detail view

**State Management:** Zustand stores (no persistence layer yet):
- `authStore` — User session, login/signup/logout/updateProfile
- `walletStore` — Balance, virtual account, deduct/add balance
- `transactionStore` — Transaction list, add transaction, get by ID
- `themeStore` — Dark/light mode toggle

**Data Fetching:** TanStack React Query is set up (`lib/query-client.ts`) with an `apiRequest` helper pointed at the Express backend via `EXPO_PUBLIC_DOMAIN`. Currently the app uses **mock data** from `lib/mockData.ts` directly through Zustand stores instead.

**Theming:** Dual dark/light theme system. `constants/theme.ts` exports `DARK_COLORS` and `LIGHT_COLORS`. The `useColors()` hook reads from `themeStore` and returns the active color set. All components consume colors this way — no hardcoded color values in UI files.

**UI Components:**
- `components/ui/` — Reusable primitives: `Input`, `GradientButton`, `TransactionCard`, `EmptyState`, `AppHeader`, `Drawer`
- `components/services/` — Service modals: `AirtimeModal`, `DataModal`, `ElectricityModal`, `CableModal`, `PinModal`, `ResultModal`
- `components/services/ServiceSheetModal.tsx` — Unified stage-based bottom sheet (form → inline PIN → result) used by all service modals. Avoids nested Modal stacking issues; PIN entry is rendered inline within the same Modal using a `stage` state.

**Key Libraries:**
- `expo-linear-gradient` — Gradient backgrounds and buttons
- `expo-haptics` — Touch feedback throughout the app
- `@shopify/flash-list` — High-performance list rendering for transactions
- `expo-blur` — Blur effects for tab bar
- `expo-glass-effect` — Native iOS liquid glass tab bar (with classic fallback)
- `react-native-reanimated` + `react-native-gesture-handler` — Animations (e.g., Drawer slide-in)
- `Nunito` font family (via `@expo-google-fonts/nunito`)

**Tab Bar Strategy:** Two implementations — `NativeTabLayout` (uses `expo-router/unstable-native-tabs` with SF Symbols for iOS liquid glass) and `ClassicTabLayout` (cross-platform BlurView tab bar). Selection is based on `isLiquidGlassAvailable()` at runtime.

---

### Backend (Express Server)

**Framework:** Express 5 (`server/index.ts`)

**Current State:** Minimal scaffold only. Routes file (`server/routes.ts`) creates an HTTP server with no registered routes yet. Storage layer (`server/storage.ts`) has an in-memory `MemStorage` implementation for users.

**CORS:** Configured to allow origins from `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and localhost for development.

**Build:** esbuild bundles `server/index.ts` to `server_dist/` for production.

---

### Database

**ORM:** Drizzle ORM with PostgreSQL dialect  
**Config:** `drizzle.config.ts` reads `DATABASE_URL` env var  
**Schema:** `shared/schema.ts` — currently only a `users` table (id, username, password)  
**Migrations:** Output to `./migrations/`  
**Zod validation:** `drizzle-zod` generates insert schemas from Drizzle table definitions

The database is provisioned but the schema is minimal. Significant expansion will be needed to support wallets, transactions, referrals, and service records.

---

### Shared Code

`shared/schema.ts` is used by both the server (for DB operations) and potentially the client (for type inference). Path alias `@shared/*` is configured in `tsconfig.json`.

---

### Authentication

Currently **mock-only**. The `authStore` accepts any credentials and returns the hardcoded `MOCK_USER`. The `app/index.tsx` redirects based on `isAuthenticated` from the store. No tokens, sessions, or server calls are made yet.

A PIN system exists in the UI (`PinModal`) using a hardcoded `MOCK_PIN` from mock data — used to confirm service transactions before deducting wallet balance.

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| **PostgreSQL** (via `pg`) | Primary database, accessed through Drizzle ORM |
| **Drizzle ORM** | Type-safe SQL query builder and schema management |
| **TanStack React Query** | Server state management / data fetching layer (wired up, not yet actively used) |
| **Expo ecosystem** | Build tooling, native modules (haptics, blur, fonts, images, linear gradient, etc.) |
| **Expo Router** | File-based navigation for React Native |
| **Zustand** | Client-side state management |
| **@shopify/flash-list** | Performant FlatList replacement for transaction lists |
| **react-native-reanimated** | Animation engine |
| **react-native-gesture-handler** | Gesture system (required by Reanimated and navigation) |
| **react-native-keyboard-controller** | Keyboard-aware scroll view |
| **express** | Node.js HTTP server for the API backend |
| **esbuild** | Server bundler for production builds |
| **Nunito (Google Fonts)** | Primary app typeface |

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (required for DB and drizzle-kit)
- `EXPO_PUBLIC_DOMAIN` — The domain used to construct API base URL for the mobile app (e.g., Replit dev domain + port)
- `REPLIT_DEV_DOMAIN` — Used by server CORS config and build scripts
- `REPLIT_DOMAINS` — Additional allowed CORS origins
- `REPLIT_INTERNAL_APP_DOMAIN` — Used by build script for deployment domain detection