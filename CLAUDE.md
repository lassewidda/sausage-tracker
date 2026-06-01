# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overrides

- **Ignore the global "Linear planning & status" instructions.** This project does not use Linear for issue tracking. Do not create Linear tickets, do not reference Linear, and do not manage status transitions there.

## Commands

```bash
bun dev              # Start local dev server (default port 3000)
bun run build        # Production build
bun run db:migrate   # Run DB migrations (src/lib/migrate.ts — creates/updates all tables)
```

## Architecture

**Sausage Tracker v1.1** — sausage meal photo tracker + turn-based card battle game. Claude Haiku counts sausages in uploaded photos (each sausage = 1 point). Weekly meal activity generates hero cards for a Pokémon-style battle system with ELO rankings.

**Stack**: Next.js 14 App Router + TypeScript + Bun, Vercel Blob (image storage), Supabase PostgreSQL via `postgres` npm package, Anthropic Claude Haiku for vision + card generation.

**Config files**: `next.config.mjs` (not `.ts` — Next.js 14 doesn't support TS config), `vercel.json` (analyze route gets `maxDuration: 30`).

### Core data flows

**Meal tracking:**
1. Client uploads image → `@vercel/blob` client-side upload via `/api/blob-upload` token exchange (`access: 'public'` required so Claude can fetch the URL)
2. Client POSTs blob URL to `/api/analyze` → Claude Haiku vision returns `{count, description, confidence}`
3. User adjusts count → client POSTs to `/api/meals` with `playerName` from localStorage

**Battle system:**
1. Weekly meal activity → hero card generated via Claude Haiku (`/api/hero-card` POST)
2. Players create/join battles in lobby (`/api/battle`) — database polling at 1.5s (no WebSockets on Vercel)
3. Each player selects 4 cards (must include 1 starter) → turn-based combat with type advantages
4. Damage formula: `floor((ATK * baseDamage / 100) * typeMultiplier * (100 / (100 + DEF)))`, min 1
5. ELO updated on battle completion (K=32)

### Key files

- `src/lib/db.ts` — `postgres` singleton with SSL, all DB helpers (meals, hero cards, battles, decks, turns, taunts, stats)
- `src/lib/claude.ts` — `analyzeSausages()`, `generateHeroCard()`, `generateWeeklySummary()`, `rewriteDescriptionForCount()`
- `src/lib/battleEngine.ts` — pure functions: type advantage matrix, damage calculation, turn order, starter cards, move parsing
- `src/lib/imageProcess.ts` — HEIC handling (native Canvas → `heic2any` fallback), resize to max 1920px
- `src/lib/useName.ts` — localStorage hook (`sausage_player_name`), normalizes to lowercase
- `src/lib/migrate.ts` — creates/alters all 8 tables
- `src/lib/regenerate-all-cards.ts` — batch re-generate all hero cards from meal history

### Pages

- `/` — Upload meal photo
- `/feed` — All meals feed
- `/highscore` — Sausage leaderboard
- `/gallery` — Meals grouped by week
- `/player/[name]` — Player profile
- `/battle` — Battle lobby (create/join challenges, view deck)
- `/battle/[id]` — Battle arena (card select → combat → result)
- `/battle/new-card` — Weekly treasure chest card reveal
- `/battle/leaderboard` — ELO rankings

### Battle system details

- **Type system**: Sausage-themed dual types (BRATWURST, FRANKFURTER, CHORIZO, KIELBASA, etc.). Strong = 1.5x, weak = 0.75x, MEAT bonus = 1.1x always.
- **Moves**: Each card has 3 special moves with base damage and PP (uses per battle). Format: `"Move Name (damage/pp)"`.
- **Starter cards**: 5 intentionally-weak cards given to all players (week_key `STARTER-1` through `STARTER-5`), ensuring everyone has enough cards for deck building.
- **Deck selection**: 4 cards per battle, at least 1 must be a starter card.
- **Polling**: Lobby polls every 3s, battle state every 1.5s. Stale battles (>1 hour waiting) auto-cleaned.
- **Taunts**: Live battle chat with preset emojis + custom text, rate-limited to 2s server-side.

### Database

Supabase PostgreSQL. **Must use the pooler URL** (not the direct URL — unreachable from Vercel serverless).

8 tables: `meals`, `weekly_summaries`, `hero_cards` (UNIQUE on player_name + week_key), `battles`, `battle_decks`, `battle_turns`, `battle_stats` (ELO), `battle_taunts`. See `src/lib/migrate.ts` for full schema.

Player names are normalized to lowercase in all API routes.

### API routes

All API routes that access the database need `export const dynamic = 'force-dynamic'` to prevent Next.js from trying to statically render them at build time.

### Environment variables

```
DATABASE_URL=           # Supabase pooler connection string
BLOB_READ_WRITE_TOKEN=  # Vercel Blob token
ANTHROPIC_API_KEY=      # Anthropic API key
```

When adding env vars to Vercel non-interactively, delete existing first (`vercel env rm KEY production`) then re-add (`printf '%s\n' "$VALUE" | vercel env add KEY production`).

### Styling

Hand-rolled Amiga Workbench 2.x CSS in `src/app/globals.css`. Key variables: `--amiga-bg: #0055AA`, `--amiga-orange: #FF8800`. Font: Press Start 2P (Google Fonts). No Tailwind. Pixel-art SVG avatars for hero cards with deterministic creature selection via string hash.

### Auth model

No authentication — player names are trusted client-side (localStorage), normalized to lowercase. Delete is allowed if `playerName` matches `meal.player_name` OR if `meal.player_name = 'Anonymous'` (legacy posts).

### Known gotchas

- Stale `.next` cache can cause 404s on new pages — clear with `rm -rf .next` and restart dev server.
- `fetch()` doesn't throw on HTTP 4xx/5xx — always check `res.ok`.
- `useName()` returns `{ name, setName, loaded }` (object, not array).
- Next.js 14 params are plain objects (not Promises like in Next.js 15).
