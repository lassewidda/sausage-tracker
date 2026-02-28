import { neon } from '@neondatabase/serverless'

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!)

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
      week_key         TEXT NOT NULL
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_meals_week_key ON meals(week_key DESC)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at DESC)
  `

  console.log('Migration complete.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
