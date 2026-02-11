# Word Cloud — Next.js App

A Next.js app that displays a **word cloud** built from captions stored in Supabase. The main page shows the top 300 most frequent words in an ellipse-shaped layout with spiral placement and multiple colors; a separate page lists all captions in card format. **Authentication is required** — users sign in with Google OAuth (via Supabase Auth) before accessing the word cloud or captions.

## What it is

- **Next.js App Router** app (`app/` directory) with TypeScript.
- **Supabase** for data and auth: reads from a `captions` table and uses Supabase Auth with Google OAuth for sign-in.
- **Protected routes**: The home page, dashboard, and captions page require an active session; unauthenticated users are redirected to `/login`.
- **Main page (`/`)**: Word cloud only — no caption list. Words are sized by frequency, arranged inside an ellipse using a shape-mask style placement (spiral from center), with a color palette. Title and short description explain the visualization. Includes a "Sign out" link.
- **Login page (`/login`)**: Sign-in page with a "Continue with Google" button. Users are redirected here when they hit a protected route without a session.
- **Dashboard (`/dashboard`)**: Protected page that shows the signed-in user's email and a link back to home.
- **Captions page (`/captions`)**: All rows from the `captions` table shown as cards, with loading and error states. "Back to word cloud" button at the top (and link at bottom) returns to the main page.
- **Navigation**: "See all captions" button at the bottom of the main page links to `/captions`.

## Authentication (OAuth)

- **Provider**: Google OAuth, configured in Supabase Auth.
- **Flow**:
  1. User clicks "Continue with Google" on `/login` → navigates to `/auth/google`.
  2. `/auth/google` initiates `signInWithOAuth({ provider: "google" })` and redirects to Google.
  3. After Google authenticates, the user is sent back to `/auth/callback` with an authorization code.
  4. `/auth/callback` exchanges the code for a session and redirects to `/`.
  5. The session is stored in cookies; middleware checks it on each request.
- **Logout**: `/auth/logout` signs the user out and redirects to `/login`.
- **Protected paths**: `/`, `/dashboard`, `/captions` — middleware redirects unauthenticated requests to `/login`.

## Features

- **Word cloud**
  - Top 300 words by frequency (configurable in `lib/wordCloud.ts`).
  - Normalization: lowercase, punctuation removed, words under 3 characters and a stopword list excluded.
  - Ellipse shape mask with spiral placement so words pack without overlapping.
  - Multiple colors (black, red, orange, brown, blue, green, purple, teal).
  - Auto-refresh from Supabase every 20 seconds.
- **Captions list**
  - Fetches all rows from the `captions` table.
  - Renders each row in a card (content + optional `created_at`).
  - Sorts by `created_at` newest first when the column exists.
- **Auth**
  - Google OAuth via Supabase Auth.
  - Session-based protection with middleware.
  - Login, logout, and callback routes.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**  
   Create `.env.local` (or use `.env`) with:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   APP_BASE_URL=http://localhost:3000
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your Supabase project credentials.
   - `APP_BASE_URL`: the base URL of your app (required for the OAuth callback). Use `http://localhost:3000` for local development.

   Do not commit secrets; `.env` and `.env.local` are in `.gitignore`.

3. **Supabase configuration**
   - **Database**: Create a table named `captions` with at least a `content` column (text); optional `created_at` for sorting. The app does not create or modify tables.
   - **Auth**: In the Supabase dashboard, enable the **Google** provider under Authentication → Providers. Configure your Google OAuth client credentials there. The app uses Supabase’s built-in OAuth flow and does not require a client secret in the app for basic setups.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users will be redirected to `/login`.

## Build

```bash
npm run build
npm start
```

## Project structure

- `app/page.tsx` — Main page: fetches captions, builds word cloud, ellipse + spiral layout, “See all captions” and “Sign out” links.
- `app/captions/page.tsx` — All captions in cards, “Back to word cloud” navigation.
- `app/login/page.tsx` — Login page with “Continue with Google” button.
- `app/dashboard/page.tsx` — Dashboard showing signed-in user email.
- `app/auth/google/route.ts` — Initiates Google OAuth sign-in.
- `app/auth/callback/route.ts` — Exchanges OAuth code for session, redirects to home.
- `app/auth/logout/route.ts` — Signs out and redirects to login.
- `middleware.ts` — Protects `/`, `/dashboard`, `/captions`; redirects unauthenticated users to `/login`.
- `lib/supabase/client.ts` — Supabase browser client (if used).
- `lib/supabase/server.ts` — Supabase server clients for Server Components and Route Handlers (auth-aware).
- `lib/supabaseClient.ts` — Supabase client used by the word cloud page for data fetching.
- `lib/wordCloud.ts` — Word cloud data: `TOP_N`, stopwords, `buildWordCloudData()`, color palette.
