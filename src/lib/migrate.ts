import postgres from 'postgres'

async function migrate() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  console.log('Running database migration...')

  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      image_url        TEXT NOT NULL,
      blob_path        TEXT NOT NULL,
      sausage_count    INTEGER NOT NULL CHECK (sausage_count >= 0),
      ai_suggested_count INTEGER,
      ai_description   TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      week_key         TEXT NOT NULL,
      player_name      TEXT NOT NULL DEFAULT 'Anonymous'
    )
  `

  // Add player_name to existing tables that don't have it yet
  await sql`
    ALTER TABLE meals ADD COLUMN IF NOT EXISTS player_name TEXT NOT NULL DEFAULT 'Anonymous'
  `

  // Add estimated_grams for weight-based scoring
  await sql`
    ALTER TABLE meals ADD COLUMN IF NOT EXISTS estimated_grams INTEGER
  `

  // Weekly summaries table
  await sql`
    CREATE TABLE IF NOT EXISTS weekly_summaries (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_name    TEXT NOT NULL,
      week_key       TEXT NOT NULL,
      summary_text   TEXT NOT NULL,
      total_sausages INTEGER NOT NULL DEFAULT 0,
      total_grams    INTEGER NOT NULL DEFAULT 0,
      meal_count     INTEGER NOT NULL DEFAULT 0,
      chain_length   INTEGER NOT NULL DEFAULT 0,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(player_name, week_key)
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week ON weekly_summaries(week_key DESC)`

  // Hero cards table — add week_key for weekly collection
  await sql`
    CREATE TABLE IF NOT EXISTS hero_cards (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_name    TEXT NOT NULL,
      hero_title     TEXT NOT NULL,
      hero_type      TEXT NOT NULL,
      hp             INTEGER NOT NULL,
      attack         INTEGER NOT NULL,
      defense        INTEGER NOT NULL,
      speed          INTEGER NOT NULL,
      special_moves  TEXT[] NOT NULL DEFAULT '{}',
      weakness       TEXT NOT NULL,
      catchphrase    TEXT NOT NULL,
      flavor_text    TEXT NOT NULL,
      week_key       TEXT NOT NULL DEFAULT '',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Add week_key column if missing (existing tables)
  await sql`ALTER TABLE hero_cards ADD COLUMN IF NOT EXISTS week_key TEXT NOT NULL DEFAULT ''`

  // Drop old unique constraint on player_name only (if exists)
  await sql`
    DO $$ BEGIN
      ALTER TABLE hero_cards DROP CONSTRAINT IF EXISTS hero_cards_player_name_key;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$
  `

  // Add new unique constraint on (player_name, week_key)
  await sql`
    DO $$ BEGIN
      ALTER TABLE hero_cards ADD CONSTRAINT hero_cards_player_week_unique UNIQUE (player_name, week_key);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END $$
  `

  // Battles table
  await sql`
    CREATE TABLE IF NOT EXISTS battles (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      challenger       TEXT NOT NULL,
      opponent         TEXT,
      status           TEXT NOT NULL DEFAULT 'waiting',
      challenger_ready BOOLEAN NOT NULL DEFAULT false,
      opponent_ready   BOOLEAN NOT NULL DEFAULT false,
      current_turn     INTEGER NOT NULL DEFAULT 0,
      turn_player      TEXT,
      winner           TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status)`

  // Battle decks table
  await sql`
    CREATE TABLE IF NOT EXISTS battle_decks (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      battle_id      UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
      player_name    TEXT NOT NULL,
      card_id        UUID NOT NULL REFERENCES hero_cards(id),
      position       INTEGER NOT NULL,
      current_hp     INTEGER NOT NULL,
      is_active      BOOLEAN NOT NULL DEFAULT false,
      is_knocked_out BOOLEAN NOT NULL DEFAULT false
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_battle_decks_battle ON battle_decks(battle_id)`

  // Battle turns table
  await sql`
    CREATE TABLE IF NOT EXISTS battle_turns (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      battle_id        UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
      turn_number      INTEGER NOT NULL,
      attacker         TEXT NOT NULL,
      attacker_card_id UUID NOT NULL,
      defender_card_id UUID NOT NULL,
      move_used        TEXT NOT NULL,
      move_damage      INTEGER NOT NULL,
      type_multiplier  REAL NOT NULL DEFAULT 1.0,
      damage_dealt     INTEGER NOT NULL,
      defender_hp_after INTEGER NOT NULL,
      is_knockout      BOOLEAN NOT NULL DEFAULT false,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_battle_turns_battle ON battle_turns(battle_id, turn_number)`

  // Battle stats table
  await sql`
    CREATE TABLE IF NOT EXISTS battle_stats (
      player_name  TEXT PRIMARY KEY,
      wins         INTEGER NOT NULL DEFAULT 0,
      losses       INTEGER NOT NULL DEFAULT 0,
      elo_rating   INTEGER NOT NULL DEFAULT 1000
    )
  `

  // Battle taunts table
  await sql`
    CREATE TABLE IF NOT EXISTS battle_taunts (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      battle_id        UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
      player_name      TEXT NOT NULL,
      message          TEXT NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_battle_taunts_battle ON battle_taunts(battle_id, created_at DESC)`

  // Add summary column to battles
  await sql`ALTER TABLE battles ADD COLUMN IF NOT EXISTS summary TEXT`

  // Add switch_player column for post-KO card selection
  await sql`ALTER TABLE battles ADD COLUMN IF NOT EXISTS switch_player TEXT`

  // Add used_at column for item cooldowns (null = available, set = on 3-day cooldown)
  await sql`ALTER TABLE player_items ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ`

  // Add is_critical column for critical hits
  await sql`ALTER TABLE battle_turns ADD COLUMN IF NOT EXISTS is_critical BOOLEAN NOT NULL DEFAULT false`

  // Player items (inventory) table
  await sql`
    CREATE TABLE IF NOT EXISTS player_items (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_name    TEXT NOT NULL,
      item_key       TEXT NOT NULL,
      obtained_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_player_items_player ON player_items(player_name)`

  // Battle effects table (active buffs/debuffs during battle)
  await sql`
    CREATE TABLE IF NOT EXISTS battle_effects (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      battle_id       UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
      target_card_id  UUID NOT NULL,
      effect_type     TEXT NOT NULL,
      effect_value    INTEGER NOT NULL,
      remaining_turns INTEGER NOT NULL,
      source_player   TEXT NOT NULL
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_battle_effects_battle ON battle_effects(battle_id)`

  // Add item columns to battle_turns
  await sql`ALTER TABLE battle_turns ADD COLUMN IF NOT EXISTS item_used TEXT`
  await sql`ALTER TABLE battle_turns ADD COLUMN IF NOT EXISTS item_effect TEXT`

  // Player wallets (Frankfurter currency)
  await sql`
    CREATE TABLE IF NOT EXISTS player_wallets (
      player_name  TEXT PRIMARY KEY,
      balance      INTEGER NOT NULL DEFAULT 0
    )
  `

  // Shop transactions
  await sql`
    CREATE TABLE IF NOT EXISTS shop_transactions (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_name  TEXT NOT NULL,
      item_slug    TEXT NOT NULL,
      price        INTEGER NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_shop_transactions_player ON shop_transactions(player_name, created_at DESC)`

  await sql`CREATE INDEX IF NOT EXISTS idx_meals_week_key ON meals(week_key DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_meals_player_name ON meals(player_name)`

  await sql.end()
  console.log('Migration complete.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
