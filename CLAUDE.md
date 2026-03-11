# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start local dev server
bun run build    # Production build
bun run db:migrate  # Run DB migrations (creates/updates meals table)
```

## Architecture

**Sausage Tracker** — meal photo app where Claude Haiku counts sausages in uploaded photos. Each sausage = 1 point. Multi-user leaderboard via player names stored in localStorage.

**Stack**: Next.js 14 App Router + TypeScript + Bun, Vercel Blob (image storage), Supabase PostgreSQL via `postgres` npm package, Anthropic Claude Haiku for vision analysis.

**Config files**: `next.config.mjs` (not `.ts` — Next.js 14 doesn't support TS config), `vercel.json` (analyze route gets `maxDuration: 30`).

### Data flow

1. Client uploads image → `@vercel/blob` client-side upload via `/api/blob-upload` token exchange (must be `access: 'public'` so Claude can fetch the URL)
2. Client POSTs blob URL to `/api/analyze` → Claude Haiku vision API returns `{count, description, confidence}`
3. User adjusts count → client POSTs to `/api/meals` with `playerName` from localStorage
4. Pages: Home (upload), Feed (all meals), Highscore (leaderboard), Gallery (meals by week)

### Key files

- `src/lib/db.ts` — `postgres` singleton with `ssl: { rejectUnauthorized: false }`, DB helpers: `insertMeal`, `getAllMeals`, `deleteMeal`, `getLeaderboard`, `groupByWeek`, `getWeekKey`
- `src/lib/claude.ts` — `analyzeSausages(imageUrl)` using `source.type: "url"` (no base64), `rewriteDescriptionForCount()` for adjusting descriptions when user changes count
- `src/lib/imageProcess.ts` — HEIC handling: tries native Canvas decode first (Safari), falls back to `heic2any`; resizes to max 1920px
- `src/lib/useName.ts` — localStorage hook, key `sausage_player_name`
- `src/lib/migrate.ts` — run once to create/alter schema

### Database

Supabase PostgreSQL. **Must use the pooler URL** (`aws-1-eu-west-1.pooler.supabase.com:5432`) not the direct URL (`db.xxx.supabase.co`) — the direct URL is unreachable from Vercel serverless.

```sql
CREATE TABLE meals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url        TEXT NOT NULL,
  blob_path        TEXT NOT NULL,
  sausage_count    INTEGER NOT NULL CHECK (sausage_count >= 0),
  ai_suggested_count INTEGER,
  ai_description   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  week_key         TEXT NOT NULL,  -- e.g. "2026-W09"
  player_name      TEXT NOT NULL DEFAULT 'Anonymous'
);
```

### Environment variables

```
DATABASE_URL=         # Supabase pooler connection string
BLOB_READ_WRITE_TOKEN= # Vercel Blob token
ANTHROPIC_API_KEY=    # Anthropic API key
```

When adding env vars to Vercel non-interactively, delete existing first (`vercel env rm KEY production`) then re-add (`printf '%s\n' "$VALUE" | vercel env add KEY production`).

### Styling

Hand-rolled Amiga Workbench 2.x CSS in `src/app/globals.css`. Key variables: `--amiga-bg: #0055AA`, `--amiga-orange: #FF8800`. Font: Press Start 2P (Google Fonts). No Tailwind.

### Auth model

No authentication — player names are trusted client-side (localStorage). Delete is allowed if `playerName` matches `meal.player_name` OR if `meal.player_name = 'Anonymous'` (legacy posts).
