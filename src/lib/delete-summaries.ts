import postgres from 'postgres'

async function run() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })
  const deleted = await sql`DELETE FROM weekly_summaries RETURNING id`
  console.log(`Deleted ${deleted.length} weekly summaries`)
  await sql.end()
}

run()
