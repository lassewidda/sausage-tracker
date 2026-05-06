import { execFileSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Get recent commits (last 7 days, max 15)
let raw = ''
try {
  raw = execFileSync('git', ['log', '--format=%ad|%s', '--date=short', '--since=7 days ago', '-15'], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
} catch {
  // No git history available (e.g. Vercel CLI deploys ship without .git)
}

if (!raw) {
  mkdirSync(join(process.cwd(), 'src', 'generated'), { recursive: true })
  writeFileSync(
    join(process.cwd(), 'src', 'generated', 'changelog.ts'),
    'export const CHANGELOG = "No recent updates."\n',
  )
  process.exit(0)
}

// Group by date
const byDate = new Map<string, string[]>()
for (const line of raw.split('\n')) {
  const [date, ...rest] = line.split('|')
  const msg = rest.join('|')
  if (!byDate.has(date)) byDate.set(date, [])
  byDate.get(date)!.push(msg)
}

// Build readable changelog
const lines: string[] = []
for (const [date, msgs] of byDate) {
  lines.push(`${date}:`)
  for (const msg of msgs) {
    lines.push(`- ${msg}`)
  }
}

const changelog = lines.join('\n')

mkdirSync(join(process.cwd(), 'src', 'generated'), { recursive: true })
writeFileSync(
  join(process.cwd(), 'src', 'generated', 'changelog.ts'),
  `export const CHANGELOG = ${JSON.stringify(changelog)}\n`,
)

console.log('Generated changelog with', raw.split('\n').length, 'entries')
