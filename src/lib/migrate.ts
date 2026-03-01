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
