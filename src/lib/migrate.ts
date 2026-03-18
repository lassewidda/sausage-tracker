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
