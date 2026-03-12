const P = 12 // px per pixel

const SAU = '#B83010' // sausage body
const SAL = '#E86030' // sausage highlight
const SAD = '#7A1E04' // sausage dark end
const SKI = '#F0B866' // skin
const HAI = '#2A1000' // hair
const EYE = '#111111' // eyes
const MOU = '#7A3010' // mouth
const TUN = '#1E6B2A' // tunic
const BEL = '#CC6600' // belt
const BOT = '#3C2010' // boots
const SPK = '#FFE030' // sparkle

// [col, row, color]  — 12 cols × 16 rows, each P px
const PIXELS: [number, number, string][] = [
  // ── sparkles around sausages ───────────────────────────────
  [0, 0, SPK], [11, 0, SPK],
  [5, 0, SPK], [6, 0, SPK],

  // ── left sausage ───────────────────────────────────────────
  [1, 0, SAD], [2, 0, SAD],               // left dark cap
  [0, 1, SAU], [1, 1, SAL], [2, 1, SAL], [3, 1, SAU], // body + highlights
  [1, 2, SAD], [2, 2, SAD],               // right dark cap

  // ── right sausage ──────────────────────────────────────────
  [9, 0, SAD], [10, 0, SAD],
  [8, 1, SAU], [9, 1, SAL], [10, 1, SAL], [11, 1, SAU],
  [9, 2, SAD], [10, 2, SAD],

  // ── hands ──────────────────────────────────────────────────
  [1, 3, SKI], [2, 3, SKI],
  [9, 3, SKI], [10, 3, SKI],

  // ── left forearm ───────────────────────────────────────────
  [1, 4, TUN], [2, 4, SKI],
  // ── right forearm ──────────────────────────────────────────
  [9, 4, SKI], [10, 4, TUN],
  // ── head hair top (row 4) ──────────────────────────────────
  [4, 4, HAI], [5, 4, HAI], [6, 4, HAI], [7, 4, HAI],

  // ── left upper arm + head hair ─────────────────────────────
  [1, 5, TUN],
  [3, 5, HAI], [4, 5, HAI], [5, 5, HAI], [6, 5, HAI], [7, 5, HAI], [8, 5, HAI],
  [10, 5, TUN],

  // ── arms + face (no hair border yet) ───────────────────────
  [1, 6, TUN],
  [3, 6, HAI], [4, 6, SKI], [5, 6, SKI], [6, 6, SKI], [7, 6, SKI], [8, 6, HAI],
  [10, 6, TUN],

  // ── arms spread + eyes ─────────────────────────────────────
  [0, 7, TUN], [1, 7, TUN],
  [3, 7, HAI], [4, 7, EYE], [5, 7, SKI], [6, 7, SKI], [7, 7, EYE], [8, 7, HAI],
  [10, 7, TUN], [11, 7, TUN],

  // ── arms + mouth ───────────────────────────────────────────
  [0, 8, TUN], [1, 8, TUN],
  [3, 8, HAI], [4, 8, SKI], [5, 8, MOU], [6, 8, MOU], [7, 8, SKI], [8, 8, HAI],
  [10, 8, TUN], [11, 8, TUN],

  // ── arms converge + chin ───────────────────────────────────
  [1, 9, TUN], [2, 9, TUN],
  [4, 9, SKI], [5, 9, SKI], [6, 9, SKI], [7, 9, SKI],
  [9, 9, TUN], [10, 9, TUN],

  // ── shoulders ──────────────────────────────────────────────
  [2, 10, TUN], [3, 10, TUN], [4, 10, TUN], [5, 10, TUN],
  [6, 10, TUN], [7, 10, TUN], [8, 10, TUN], [9, 10, TUN],

  // ── body ───────────────────────────────────────────────────
  [3, 11, TUN], [4, 11, TUN], [5, 11, TUN], [6, 11, TUN], [7, 11, TUN], [8, 11, TUN],

  // ── body + belt ────────────────────────────────────────────
  [3, 12, TUN], [4, 12, TUN], [5, 12, BEL], [6, 12, BEL], [7, 12, TUN], [8, 12, TUN],

  // ── legs ───────────────────────────────────────────────────
  [3, 13, TUN], [4, 13, TUN],
  [7, 13, TUN], [8, 13, TUN],

  // ── boots ──────────────────────────────────────────────────
  [3, 14, BOT], [4, 14, BOT],
  [7, 14, BOT], [8, 14, BOT],

  // ── feet ───────────────────────────────────────────────────
  [2, 15, BOT], [3, 15, BOT], [4, 15, BOT],
  [7, 15, BOT], [8, 15, BOT], [9, 15, BOT],
]

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
