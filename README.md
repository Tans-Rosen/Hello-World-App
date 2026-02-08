# Word Cloud — Next.js App

A Next.js app that displays a **word cloud** built from captions stored in Supabase. The main page shows the top 300 most frequent words in an ellipse-shaped layout with spiral placement and multiple colors; a separate page lists all captions in card format.

## What it is

- **Next.js App Router** app (`app/` directory) with TypeScript.
- **Supabase** for data: reads from an existing table named `captions` (column `content` for caption text; optional `created_at` for sorting).
- **Main page (`/`)**: Word cloud only — no caption list. Words are sized by frequency, arranged inside an ellipse using a shape-mask style placement (spiral from center), with a color palette. Title and short description explain the visualization.
- **Captions page (`/captions`)**: All rows from the `captions` table shown as cards, with loading and error states. “Back to word cloud” button at the top (and link at bottom) returns to the main page.
- **Navigation**: “See all captions” button at the bottom of the main page links to `/captions`.

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

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**  
   Create `.env.local` (or use `.env`) with your Supabase project values:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Do not commit secrets; `.env` and `.env.local` are in `.gitignore`.

3. **Supabase**  
   The app expects an existing table named `captions` with at least a `content` column (text). It does not create or modify tables.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Project structure

- `app/page.tsx` — Main page: fetches captions, builds word cloud, ellipse + spiral layout, “See all captions” button.
- `app/captions/page.tsx` — All captions in cards, “Back to word cloud” navigation.
- `lib/supabaseClient.ts` — Supabase client (uses env vars).
- `lib/wordCloud.ts` — Word cloud data: `TOP_N`, stopwords, `buildWordCloudData()`, color palette.
