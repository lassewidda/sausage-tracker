import theme from '@/theme'

const P = 12 // px per pixel

// ── Sausage theme colors ────────────────────────────────────────────
const SAU = '#B83010' // sausage body
const SAL = '#E86030' // sausage highlight
const SAD = '#7A1E04' // sausage dark end

// ── Exercise theme colors ───────────────────────────────────────────
const BAR = '#888888' // barbell bar
const BRH = '#AAAAAA' // barbell highlight
const PLT = '#444444' // weight plate
const PLD = '#333333' // weight plate dark

// ── Shared colors ───────────────────────────────────────────────────
const SKI = '#F0B866' // skin
const HAI = '#2A1000' // hair
const EYE = '#111111' // eyes
const MOU = '#7A3010' // mouth
const TUN_SAU = '#1E6B2A' // tunic (sausage)
const TUN_EX = '#CC2222'  // tank top (exercise)
const BEL = '#CC6600' // belt
const BOT = '#3C2010' // boots
const SPK = '#FFE030' // sparkle

const SAUSAGE_PIXELS: [number, number, string][] = [
  // sparkles
  [0, 0, SPK], [11, 0, SPK], [5, 0, SPK], [6, 0, SPK],
  // left sausage
  [1, 0, SAD], [2, 0, SAD],
  [0, 1, SAU], [1, 1, SAL], [2, 1, SAL], [3, 1, SAU],
  [1, 2, SAD], [2, 2, SAD],
  // right sausage
  [9, 0, SAD], [10, 0, SAD],
  [8, 1, SAU], [9, 1, SAL], [10, 1, SAL], [11, 1, SAU],
  [9, 2, SAD], [10, 2, SAD],
  // hands
  [1, 3, SKI], [2, 3, SKI], [9, 3, SKI], [10, 3, SKI],
  // forearms
  [1, 4, TUN_SAU], [2, 4, SKI], [9, 4, SKI], [10, 4, TUN_SAU],
  // head hair top
  [4, 4, HAI], [5, 4, HAI], [6, 4, HAI], [7, 4, HAI],
  // upper arms + hair
  [1, 5, TUN_SAU],
  [3, 5, HAI], [4, 5, HAI], [5, 5, HAI], [6, 5, HAI], [7, 5, HAI], [8, 5, HAI],
  [10, 5, TUN_SAU],
  // face
  [1, 6, TUN_SAU],
  [3, 6, HAI], [4, 6, SKI], [5, 6, SKI], [6, 6, SKI], [7, 6, SKI], [8, 6, HAI],
  [10, 6, TUN_SAU],
  // eyes
  [0, 7, TUN_SAU], [1, 7, TUN_SAU],
  [3, 7, HAI], [4, 7, EYE], [5, 7, SKI], [6, 7, SKI], [7, 7, EYE], [8, 7, HAI],
  [10, 7, TUN_SAU], [11, 7, TUN_SAU],
  // mouth
  [0, 8, TUN_SAU], [1, 8, TUN_SAU],
  [3, 8, HAI], [4, 8, SKI], [5, 8, MOU], [6, 8, MOU], [7, 8, SKI], [8, 8, HAI],
  [10, 8, TUN_SAU], [11, 8, TUN_SAU],
  // chin
  [1, 9, TUN_SAU], [2, 9, TUN_SAU],
  [4, 9, SKI], [5, 9, SKI], [6, 9, SKI], [7, 9, SKI],
  [9, 9, TUN_SAU], [10, 9, TUN_SAU],
  // shoulders
  [2, 10, TUN_SAU], [3, 10, TUN_SAU], [4, 10, TUN_SAU], [5, 10, TUN_SAU],
  [6, 10, TUN_SAU], [7, 10, TUN_SAU], [8, 10, TUN_SAU], [9, 10, TUN_SAU],
  // body
  [3, 11, TUN_SAU], [4, 11, TUN_SAU], [5, 11, TUN_SAU], [6, 11, TUN_SAU], [7, 11, TUN_SAU], [8, 11, TUN_SAU],
  // belt
  [3, 12, TUN_SAU], [4, 12, TUN_SAU], [5, 12, BEL], [6, 12, BEL], [7, 12, TUN_SAU], [8, 12, TUN_SAU],
  // legs
  [3, 13, TUN_SAU], [4, 13, TUN_SAU], [7, 13, TUN_SAU], [8, 13, TUN_SAU],
  // boots
  [3, 14, BOT], [4, 14, BOT], [7, 14, BOT], [8, 14, BOT],
  // feet
  [2, 15, BOT], [3, 15, BOT], [4, 15, BOT], [7, 15, BOT], [8, 15, BOT], [9, 15, BOT],
]

const EXERCISE_PIXELS: [number, number, string][] = [
  // ── barbell overhead ──────────────────────────────────────────────
  // left plate
  [0, 0, PLD], [1, 0, PLT],
  [0, 1, PLD], [1, 1, PLT],
  [0, 2, PLD], [1, 2, PLT],
  // bar
  [2, 1, BAR], [3, 1, BRH], [4, 1, BAR], [5, 1, BAR], [6, 1, BAR], [7, 1, BRH], [8, 1, BAR], [9, 1, BAR],
  // right plate
  [10, 0, PLT], [11, 0, PLD],
  [10, 1, PLT], [11, 1, PLD],
  [10, 2, PLT], [11, 2, PLD],
  // sparkles
  [5, 0, SPK], [6, 0, SPK],

  // ── hands on bar ──────────────────────────────────────────────────
  [2, 2, SKI], [3, 2, SKI], [8, 2, SKI], [9, 2, SKI],

  // ── forearms ──────────────────────────────────────────────────────
  [2, 3, SKI], [3, 3, SKI], [8, 3, SKI], [9, 3, SKI],

  // ── head hair top ─────────────────────────────────────────────────
  [4, 3, HAI], [5, 3, HAI], [6, 3, HAI], [7, 3, HAI],

  // ── upper arms + hair ─────────────────────────────────────────────
  [2, 4, SKI],
  [3, 4, HAI], [4, 4, HAI], [5, 4, HAI], [6, 4, HAI], [7, 4, HAI], [8, 4, HAI],
  [9, 4, SKI],

  // ── face ──────────────────────────────────────────────────────────
  [1, 5, SKI], [2, 5, SKI],
  [3, 5, HAI], [4, 5, SKI], [5, 5, SKI], [6, 5, SKI], [7, 5, SKI], [8, 5, HAI],
  [9, 5, SKI], [10, 5, SKI],

  // ── eyes ──────────────────────────────────────────────────────────
  [1, 6, SKI],
  [3, 6, HAI], [4, 6, EYE], [5, 6, SKI], [6, 6, SKI], [7, 6, EYE], [8, 6, HAI],
  [10, 6, SKI],

  // ── mouth ─────────────────────────────────────────────────────────
  [3, 7, HAI], [4, 7, SKI], [5, 7, MOU], [6, 7, MOU], [7, 7, SKI], [8, 7, HAI],

  // ── chin / neck ───────────────────────────────────────────────────
  [4, 8, SKI], [5, 8, SKI], [6, 8, SKI], [7, 8, SKI],

  // ── shoulders (tank top) ──────────────────────────────────────────
  [2, 9, TUN_EX], [3, 9, TUN_EX], [4, 9, TUN_EX], [5, 9, TUN_EX],
  [6, 9, TUN_EX], [7, 9, TUN_EX], [8, 9, TUN_EX], [9, 9, TUN_EX],

  // ── torso ─────────────────────────────────────────────────────────
  [3, 10, TUN_EX], [4, 10, TUN_EX], [5, 10, TUN_EX], [6, 10, TUN_EX], [7, 10, TUN_EX], [8, 10, TUN_EX],

  // ── belt ──────────────────────────────────────────────────────────
  [3, 11, TUN_EX], [4, 11, TUN_EX], [5, 11, BEL], [6, 11, BEL], [7, 11, TUN_EX], [8, 11, TUN_EX],

  // ── shorts ────────────────────────────────────────────────────────
  [3, 12, '#222222'], [4, 12, '#222222'], [5, 12, '#222222'], [6, 12, '#222222'], [7, 12, '#222222'], [8, 12, '#222222'],

  // ── legs ──────────────────────────────────────────────────────────
  [3, 13, SKI], [4, 13, SKI], [7, 13, SKI], [8, 13, SKI],

  // ── sneakers ──────────────────────────────────────────────────────
  [3, 14, '#DDDDDD'], [4, 14, '#DDDDDD'], [7, 14, '#DDDDDD'], [8, 14, '#DDDDDD'],

  // ── feet ──────────────────────────────────────────────────────────
  [2, 15, '#DDDDDD'], [3, 15, '#DDDDDD'], [4, 15, '#DDDDDD'], [7, 15, '#DDDDDD'], [8, 15, '#DDDDDD'], [9, 15, '#DDDDDD'],
]

const isExercise = process.env.NEXT_PUBLIC_THEME === 'exercise'
const PIXELS = isExercise ? EXERCISE_PIXELS : SAUSAGE_PIXELS

export function VictorySprite() {
  return (
    <svg
      viewBox="0 0 144 192"
      width="144"
      height="192"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {PIXELS.map(([col, row, color]) => (
        <rect
          key={`${col}-${row}`}
          x={col * P}
          y={row * P}
          width={P}
          height={P}
          fill={color}
        />
      ))}
    </svg>
  )
}
