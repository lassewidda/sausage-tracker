import type { HeroCard } from '@/types'
import theme from '@/theme'
import { ExerciseCreature } from './ExerciseAvatars'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

interface Props {
  card: HeroCard
  stats: {
    totalItems: number
    totalGrams: number
    mealCount: number
    maxInOneMeal: number
    activeWeeks: number
    chainLength: number
  }
}

// Deterministic hash from a string → number
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface TypeTheme {
  bg: string
  gradient: string
  border: string
  glow: string
  accent: string
  bodyColor: string
  accentColor: string
  particle: string
}

export function getTypeTheme(heroType: string): TypeTheme {
  const type1 = heroType.split('/')[0]?.trim().toUpperCase() ?? ''
  return theme.typeThemes[type1] ?? theme.defaultTypeTheme
}

function StatBar({ label, value, max, color, theme }: { label: string; value: number; max: number; color: string; theme: TypeTheme }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        width: '36px',
        textTransform: 'uppercase',
        color: theme.accent,
        textAlign: 'right',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: '12px',
        background: '#0a0a0a',
        border: `1px solid ${theme.border}44`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 6px ${color}66`,
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        width: '24px',
        color: 'var(--amiga-white)',
      }}>
        {value}
      </span>
    </div>
  )
}

export function PixelAvatar({ card, theme, size }: { card: HeroCard; stats?: Props['stats']; theme: TypeTheme; size?: number }) {
  const h = hash(card.heroTitle + card.playerName)
  // Use secondary type for detail color variety
  const type2 = card.heroType.split('/')[1]?.trim()
  const detailTheme = type2 ? getTypeTheme(type2) : theme
  const { bodyColor: b, accentColor: a } = theme
  const d = detailTheme.bodyColor // detail/third color
  const bg = theme.bg
  const SIZE = size ?? 160

  if (IS_EXERCISE) {
    const creature = h % 36 // 36 exercise creature archetypes
    return (
      <svg width={SIZE} height={SIZE} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
        <rect width="32" height="32" fill={bg} />
        <ExerciseCreature creature={creature} b={b} a={a} d={d} bg={bg} />
      </svg>
    )
  }

  const creature = h % 12 // 12 different creature archetypes

  // Each creature is a totally different shape drawn on a 32x32 grid
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      <rect width="32" height="32" fill={bg} />

      {creature === 0 && (
        // DRAGON — winged beast with tail
        <>
          {/* Wings */}
          <rect x="2" y="8" width="3" height="1" fill={a} />
          <rect x="1" y="9" width="4" height="1" fill={a} />
          <rect x="0" y="10" width="5" height="1" fill={a} />
          <rect x="1" y="11" width="4" height="2" fill={a} opacity="0.7" />
          <rect x="27" y="8" width="3" height="1" fill={a} />
          <rect x="27" y="9" width="4" height="1" fill={a} />
          <rect x="27" y="10" width="5" height="1" fill={a} />
          <rect x="27" y="11" width="4" height="2" fill={a} opacity="0.7" />
          {/* Body */}
          <rect x="10" y="10" width="12" height="10" fill={b} />
          <rect x="11" y="12" width="10" height="2" fill={a} opacity="0.3" />
          {/* Belly */}
          <rect x="12" y="14" width="8" height="5" fill={a} opacity="0.2" />
          {/* Head */}
          <rect x="11" y="4" width="10" height="7" fill={b} />
          <rect x="10" y="5" width="1" height="3" fill={b} />
          <rect x="21" y="5" width="1" height="3" fill={b} />
          {/* Horns */}
          <rect x="11" y="2" width="2" height="3" fill={a} />
          <rect x="19" y="2" width="2" height="3" fill={a} />
          <rect x="12" y="1" width="1" height="1" fill={a} />
          <rect x="19" y="1" width="1" height="1" fill={a} />
          {/* Eyes — glowing */}
          <rect x="13" y="6" width="2" height="2" fill={a} />
          <rect x="17" y="6" width="2" height="2" fill={a} />
          <rect x="13" y="7" width="1" height="1" fill="#000" />
          <rect x="18" y="7" width="1" height="1" fill="#000" />
          {/* Snout */}
          <rect x="14" y="9" width="4" height="1" fill={a} opacity="0.5" />
          {/* Fangs */}
          <rect x="14" y="10" width="1" height="1" fill="#fff" />
          <rect x="17" y="10" width="1" height="1" fill="#fff" />
          {/* Legs — thick */}
          <rect x="10" y="20" width="4" height="5" fill={b} />
          <rect x="18" y="20" width="4" height="5" fill={b} />
          <rect x="9" y="25" width="5" height="2" fill={a} />
          <rect x="17" y="25" width="5" height="2" fill={a} />
          {/* Tail */}
          <rect x="22" y="16" width="3" height="2" fill={b} />
          <rect x="25" y="15" width="3" height="2" fill={b} />
          <rect x="28" y="14" width="2" height="2" fill={a} />
          {/* Sausage in mouth */}
          <rect x="10" y="9" width="5" height="1" fill="#C03A18" />
          <rect x="9" y="9" width="1" height="1" fill="#8C2508" />
        </>
      )}

      {creature === 1 && (
        // GOLEM — massive round boulder creature
        <>
          {/* Main body — huge circle-ish */}
          <rect x="6" y="6" width="20" height="18" fill={b} />
          <rect x="8" y="4" width="16" height="2" fill={b} />
          <rect x="8" y="24" width="16" height="2" fill={b} />
          <rect x="4" y="8" width="2" height="14" fill={b} />
          <rect x="26" y="8" width="2" height="14" fill={b} />
          {/* Rock texture */}
          <rect x="8" y="8" width="3" height="2" fill={a} opacity="0.2" />
          <rect x="18" y="10" width="4" height="3" fill={a} opacity="0.15" />
          <rect x="10" y="16" width="5" height="2" fill={a} opacity="0.1" />
          <rect x="20" y="18" width="3" height="2" fill={a} opacity="0.2" />
          {/* Crack lines */}
          <rect x="14" y="5" width="1" height="4" fill={a} opacity="0.3" />
          <rect x="15" y="7" width="1" height="3" fill={a} opacity="0.3" />
          {/* Eyes — deep set */}
          <rect x="9" y="11" width="4" height="3" fill="#000" />
          <rect x="19" y="11" width="4" height="3" fill="#000" />
          <rect x="10" y="12" width="2" height="1" fill={a} />
          <rect x="20" y="12" width="2" height="1" fill={a} />
          {/* Mouth */}
          <rect x="12" y="17" width="8" height="2" fill="#000" />
          <rect x="12" y="17" width="2" height="1" fill="#fff" />
          <rect x="18" y="17" width="2" height="1" fill="#fff" />
          {/* Stubby arms with sausages */}
          <rect x="1" y="12" width="3" height="4" fill={b} />
          <rect x="28" y="12" width="3" height="4" fill={b} />
          <rect x="0" y="10" width="3" height="2" fill="#C03A18" />
          <rect x="29" y="10" width="3" height="2" fill="#C03A18" />
          {/* Stubby legs */}
          <rect x="8" y="26" width="5" height="4" fill={b} />
          <rect x="19" y="26" width="5" height="4" fill={b} />
          <rect x="7" y="30" width="6" height="2" fill={a} />
          <rect x="19" y="30" width="6" height="2" fill={a} />
        </>
      )}

      {creature === 2 && (
        // SERPENT — snake/wyrm coiled around sausages
        <>
          {/* Coiled body */}
          <rect x="6" y="22" width="20" height="3" fill={b} />
          <rect x="4" y="19" width="4" height="3" fill={b} />
          <rect x="24" y="19" width="4" height="3" fill={b} />
          <rect x="4" y="16" width="24" height="3" fill={b} />
          <rect x="4" y="13" width="4" height="3" fill={b} />
          <rect x="24" y="13" width="4" height="3" fill={b} />
          <rect x="4" y="10" width="24" height="3" fill={b} />
          {/* Pattern on body */}
          <rect x="8" y="22" width="3" height="1" fill={a} opacity="0.4" />
          <rect x="16" y="22" width="3" height="1" fill={a} opacity="0.4" />
          <rect x="10" y="16" width="3" height="1" fill={a} opacity="0.4" />
          <rect x="19" y="16" width="3" height="1" fill={a} opacity="0.4" />
          <rect x="8" y="10" width="3" height="1" fill={a} opacity="0.4" />
          <rect x="16" y="10" width="3" height="1" fill={a} opacity="0.4" />
          {/* Head rising up */}
          <rect x="12" y="3" width="8" height="8" fill={b} />
          <rect x="11" y="5" width="1" height="4" fill={b} />
          <rect x="20" y="5" width="1" height="4" fill={b} />
          {/* Hood/frill */}
          <rect x="9" y="4" width="2" height="5" fill={a} opacity="0.5" />
          <rect x="21" y="4" width="2" height="5" fill={a} opacity="0.5" />
          <rect x="8" y="5" width="1" height="3" fill={a} opacity="0.3" />
          <rect x="23" y="5" width="1" height="3" fill={a} opacity="0.3" />
          {/* Eyes — slit pupils */}
          <rect x="13" y="5" width="2" height="3" fill={a} />
          <rect x="17" y="5" width="2" height="3" fill={a} />
          <rect x="14" y="5" width="1" height="3" fill="#000" />
          <rect x="17" y="5" width="1" height="3" fill="#000" />
          {/* Tongue */}
          <rect x="15" y="10" width="2" height="1" fill="#FF4444" />
          <rect x="14" y="11" width="1" height="1" fill="#FF4444" />
          <rect x="17" y="11" width="1" height="1" fill="#FF4444" />
          {/* Sausages coiled around */}
          <rect x="10" y="19" width="12" height="2" fill="#C03A18" />
          <rect x="9" y="19" width="1" height="2" fill="#8C2508" />
          <rect x="22" y="19" width="1" height="2" fill="#8C2508" />
          <rect x="10" y="13" width="12" height="2" fill="#B83010" />
        </>
      )}

      {creature === 3 && (
        // KNIGHT — armored warrior with shield and sausage sword
        <>
          {/* Helmet */}
          <rect x="11" y="2" width="10" height="8" fill={a} />
          <rect x="10" y="4" width="1" height="4" fill={a} />
          <rect x="21" y="4" width="1" height="4" fill={a} />
          {/* Visor slit */}
          <rect x="12" y="5" width="8" height="2" fill="#000" />
          <rect x="13" y="5" width="2" height="2" fill={b} />
          <rect x="17" y="5" width="2" height="2" fill={b} />
          {/* Plume */}
          <rect x="13" y="0" width="2" height="3" fill={b} />
          <rect x="14" y="0" width="2" height="2" fill={b} />
          <rect x="15" y="0" width="1" height="1" fill={a} />
          {/* Armor body */}
          <rect x="9" y="10" width="14" height="12" fill={a} />
          <rect x="11" y="10" width="10" height="12" fill={b} />
          {/* Chest emblem */}
          <rect x="14" y="13" width="4" height="4" fill={a} />
          <rect x="15" y="14" width="2" height="2" fill="#C03A18" />
          {/* Shield arm */}
          <rect x="3" y="10" width="6" height="8" fill={a} />
          <rect x="4" y="11" width="4" height="6" fill={b} />
          <rect x="5" y="12" width="2" height="4" fill={a} opacity="0.5" />
          {/* Sausage sword arm */}
          <rect x="23" y="11" width="2" height="3" fill={b} />
          <rect x="25" y="4" width="2" height="10" fill="#C03A18" />
          <rect x="25" y="3" width="2" height="2" fill="#8C2508" />
          <rect x="24" y="12" width="4" height="2" fill={a} />
          {/* Legs — armored */}
          <rect x="10" y="22" width="5" height="6" fill={a} />
          <rect x="17" y="22" width="5" height="6" fill={a} />
          <rect x="11" y="22" width="3" height="5" fill={b} />
          <rect x="18" y="22" width="3" height="5" fill={b} />
          {/* Boots */}
          <rect x="9" y="28" width="6" height="3" fill={a} />
          <rect x="17" y="28" width="6" height="3" fill={a} />
        </>
      )}

      {creature === 4 && (
        // BLOB/SLIME — amorphous gooey creature
        <>
          {/* Main blob body */}
          <rect x="4" y="14" width="24" height="12" fill={b} />
          <rect x="6" y="12" width="20" height="2" fill={b} />
          <rect x="8" y="10" width="16" height="2" fill={b} />
          <rect x="10" y="8" width="12" height="2" fill={b} />
          <rect x="6" y="26" width="20" height="3" fill={b} />
          {/* Translucent layers */}
          <rect x="6" y="16" width="20" height="6" fill={a} opacity="0.15" />
          <rect x="8" y="14" width="16" height="3" fill={a} opacity="0.1" />
          {/* Bubbles inside */}
          <rect x="10" y="18" width="3" height="3" fill={a} opacity="0.25" rx="1" />
          <rect x="20" y="16" width="2" height="2" fill={a} opacity="0.2" rx="1" />
          <rect x="14" y="22" width="4" height="3" fill={a} opacity="0.15" rx="1" />
          {/* Eyes — large and gooey */}
          <rect x="9" y="11" width="5" height="5" fill="#fff" />
          <rect x="18" y="11" width="5" height="5" fill="#fff" />
          <rect x="11" y="13" width="3" height="3" fill="#000" />
          <rect x="19" y="13" width="3" height="3" fill="#000" />
          <rect x="12" y="13" width="1" height="1" fill="#fff" />
          <rect x="20" y="13" width="1" height="1" fill="#fff" />
          {/* Happy mouth */}
          <rect x="13" y="18" width="6" height="1" fill="#000" opacity="0.4" />
          <rect x="12" y="17" width="1" height="1" fill="#000" opacity="0.3" />
          <rect x="19" y="17" width="1" height="1" fill="#000" opacity="0.3" />
          {/* Pseudopods with sausages */}
          <rect x="1" y="16" width="4" height="3" fill={b} />
          <rect x="0" y="14" width="3" height="2" fill={b} opacity="0.7" />
          <rect x="27" y="16" width="4" height="3" fill={b} />
          <rect x="29" y="14" width="3" height="2" fill={b} opacity="0.7" />
          {/* Sausages absorbed into body */}
          <rect x="7" y="20" width="5" height="2" fill="#C03A18" opacity="0.8" />
          <rect x="20" y="22" width="5" height="2" fill="#B83010" opacity="0.8" />
          <rect x="13" y="24" width="6" height="1" fill="#C03A18" opacity="0.6" />
          {/* Drip */}
          <rect x="8" y="29" width="2" height="2" fill={b} opacity="0.5" />
          <rect x="22" y="29" width="2" height="2" fill={b} opacity="0.5" />
        </>
      )}

      {creature === 5 && (
        // PHOENIX — fiery bird creature
        <>
          {/* Tail feathers — long and flowing */}
          <rect x="2" y="20" width="6" height="2" fill={a} />
          <rect x="0" y="22" width="5" height="2" fill={a} opacity="0.7" />
          <rect x="0" y="24" width="3" height="2" fill={a} opacity="0.4" />
          <rect x="4" y="18" width="4" height="2" fill={b} />
          {/* Body */}
          <rect x="10" y="12" width="12" height="10" fill={b} />
          <rect x="12" y="10" width="8" height="2" fill={b} />
          {/* Breast plumage */}
          <rect x="12" y="14" width="8" height="6" fill={a} opacity="0.3" />
          {/* Left wing — spread wide */}
          <rect x="3" y="8" width="7" height="2" fill={b} />
          <rect x="1" y="6" width="8" height="2" fill={a} />
          <rect x="0" y="4" width="6" height="2" fill={a} opacity="0.7" />
          <rect x="0" y="3" width="3" height="1" fill={a} opacity="0.4" />
          {/* Right wing */}
          <rect x="22" y="8" width="7" height="2" fill={b} />
          <rect x="23" y="6" width="8" height="2" fill={a} />
          <rect x="26" y="4" width="6" height="2" fill={a} opacity="0.7" />
          <rect x="29" y="3" width="3" height="1" fill={a} opacity="0.4" />
          {/* Head */}
          <rect x="12" y="4" width="8" height="7" fill={b} />
          <rect x="11" y="6" width="1" height="3" fill={b} />
          <rect x="20" y="6" width="1" height="3" fill={b} />
          {/* Crest */}
          <rect x="14" y="1" width="2" height="4" fill={a} />
          <rect x="16" y="2" width="2" height="3" fill={a} opacity="0.7" />
          <rect x="13" y="2" width="1" height="2" fill={a} opacity="0.5" />
          {/* Eyes — fierce */}
          <rect x="13" y="6" width="2" height="2" fill={a} />
          <rect x="17" y="6" width="2" height="2" fill={a} />
          <rect x="13" y="7" width="1" height="1" fill="#000" />
          <rect x="18" y="7" width="1" height="1" fill="#000" />
          {/* Beak */}
          <rect x="15" y="9" width="2" height="1" fill={a} />
          <rect x="15" y="10" width="3" height="1" fill={a} opacity="0.8" />
          {/* Talons gripping sausages */}
          <rect x="10" y="22" width="4" height="4" fill={b} />
          <rect x="18" y="22" width="4" height="4" fill={b} />
          <rect x="9" y="26" width="3" height="2" fill={a} />
          <rect x="12" y="26" width="2" height="2" fill={a} />
          <rect x="18" y="26" width="3" height="2" fill={a} />
          <rect x="21" y="26" width="2" height="2" fill={a} />
          {/* Sausages in talons */}
          <rect x="7" y="27" width="6" height="2" fill="#C03A18" />
          <rect x="19" y="27" width="6" height="2" fill="#C03A18" />
          <rect x="6" y="27" width="1" height="2" fill="#8C2508" />
          <rect x="25" y="27" width="1" height="2" fill="#8C2508" />
        </>
      )}

      {creature === 6 && (
        // OCTOPUS — tentacled sea creature with sausage tentacles
        <>
          {/* Head dome */}
          <rect x="10" y="4" width="12" height="10" fill={b} />
          <rect x="8" y="6" width="2" height="6" fill={b} />
          <rect x="22" y="6" width="2" height="6" fill={b} />
          <rect x="12" y="3" width="8" height="2" fill={b} />
          {/* Head patterns */}
          <rect x="12" y="5" width="3" height="2" fill={d} opacity="0.3" />
          <rect x="18" y="7" width="3" height="2" fill={d} opacity="0.2" />
          {/* Eyes — big and round */}
          <rect x="11" y="8" width="4" height="4" fill="#fff" />
          <rect x="17" y="8" width="4" height="4" fill="#fff" />
          <rect x="13" y="9" width="2" height="2" fill={d} />
          <rect x="18" y="9" width="2" height="2" fill={d} />
          <rect x="13" y="10" width="1" height="1" fill="#000" />
          <rect x="19" y="10" width="1" height="1" fill="#000" />
          {/* Mouth */}
          <rect x="14" y="12" width="4" height="1" fill={a} opacity="0.5" />
          {/* Tentacles — 8 wavy arms */}
          <rect x="4" y="14" width="3" height="3" fill={b} />
          <rect x="2" y="17" width="3" height="4" fill={b} />
          <rect x="0" y="21" width="3" height="3" fill={a} />
          <rect x="7" y="14" width="3" height="4" fill={b} />
          <rect x="5" y="18" width="3" height="5" fill={b} />
          <rect x="3" y="23" width="4" height="3" fill={a} />
          <rect x="22" y="14" width="3" height="3" fill={b} />
          <rect x="25" y="17" width="3" height="4" fill={b} />
          <rect x="27" y="21" width="3" height="3" fill={a} />
          <rect x="19" y="14" width="3" height="4" fill={b} />
          <rect x="22" y="18" width="3" height="5" fill={b} />
          <rect x="24" y="23" width="4" height="3" fill={a} />
          {/* Center tentacles with sausages */}
          <rect x="11" y="14" width="4" height="6" fill={b} />
          <rect x="17" y="14" width="4" height="6" fill={b} />
          <rect x="10" y="20" width="5" height="4" fill={a} />
          <rect x="17" y="20" width="5" height="4" fill={a} />
          {/* Sausage held */}
          <rect x="12" y="24" width="8" height="2" fill="#C03A18" />
          <rect x="11" y="24" width="1" height="2" fill="#8C2508" />
          {/* Suction cups */}
          <rect x="3" y="19" width="1" height="1" fill={d} />
          <rect x="6" y="21" width="1" height="1" fill={d} />
          <rect x="26" y="19" width="1" height="1" fill={d} />
          <rect x="23" y="21" width="1" height="1" fill={d} />
        </>
      )}

      {creature === 7 && (
        // MUSHROOM — fungal creature with cap and spots
        <>
          {/* Mushroom cap */}
          <rect x="6" y="4" width="20" height="10" fill={b} />
          <rect x="4" y="6" width="2" height="6" fill={b} />
          <rect x="26" y="6" width="2" height="6" fill={b} />
          <rect x="8" y="2" width="16" height="3" fill={b} />
          <rect x="10" y="1" width="12" height="2" fill={a} />
          {/* Cap spots */}
          <rect x="10" y="4" width="3" height="3" fill={d} />
          <rect x="18" y="3" width="4" height="3" fill={d} />
          <rect x="13" y="8" width="3" height="2" fill={d} />
          <rect x="22" y="7" width="3" height="2" fill={d} />
          <rect x="7" y="6" width="2" height="2" fill={d} opacity="0.6" />
          {/* Stem/face */}
          <rect x="11" y="14" width="10" height="10" fill={a} />
          <rect x="10" y="16" width="1" height="6" fill={a} />
          <rect x="21" y="16" width="1" height="6" fill={a} />
          {/* Eyes */}
          <rect x="13" y="16" width="2" height="3" fill="#000" />
          <rect x="17" y="16" width="2" height="3" fill="#000" />
          <rect x="13" y="16" width="1" height="1" fill="#fff" />
          <rect x="17" y="16" width="1" height="1" fill="#fff" />
          {/* Smile */}
          <rect x="13" y="20" width="6" height="1" fill="#000" opacity="0.4" />
          <rect x="12" y="19" width="1" height="1" fill="#000" opacity="0.3" />
          <rect x="19" y="19" width="1" height="1" fill="#000" opacity="0.3" />
          {/* Feet */}
          <rect x="9" y="24" width="5" height="3" fill={b} />
          <rect x="18" y="24" width="5" height="3" fill={b} />
          {/* Spore particles */}
          <rect x="3" y="12" width="2" height="2" fill={d} opacity="0.3" />
          <rect x="27" y="10" width="2" height="2" fill={d} opacity="0.3" />
          <rect x="5" y="2" width="2" height="2" fill={d} opacity="0.2" />
          {/* Sausage skewer */}
          <rect x="23" y="16" width="2" height="8" fill="#8C2508" />
          <rect x="22" y="17" width="4" height="2" fill="#C03A18" />
          <rect x="22" y="21" width="4" height="2" fill="#C03A18" />
        </>
      )}

      {creature === 8 && (
        // ROBOT — mechanical sausage mech
        <>
          {/* Head — boxy with antenna */}
          <rect x="10" y="4" width="12" height="8" fill={a} />
          <rect x="11" y="5" width="10" height="6" fill={b} />
          <rect x="15" y="1" width="2" height="4" fill={a} />
          <rect x="14" y="0" width="4" height="2" fill={d} />
          {/* Visor */}
          <rect x="12" y="6" width="8" height="3" fill="#000" />
          <rect x="13" y="7" width="2" height="1" fill={d} />
          <rect x="17" y="7" width="2" height="1" fill={d} />
          {/* Scanner light */}
          <rect x="14" y="6" width="4" height="1" fill={d} opacity="0.5" />
          {/* Torso — armored */}
          <rect x="8" y="12" width="16" height="10" fill={a} />
          <rect x="10" y="13" width="12" height="8" fill={b} />
          {/* Chest plate */}
          <rect x="13" y="14" width="6" height="5" fill={d} opacity="0.3" />
          <rect x="14" y="15" width="4" height="3" fill="#000" />
          <rect x="15" y="16" width="2" height="1" fill={d} />
          {/* Arms — mechanical */}
          <rect x="3" y="13" width="5" height="3" fill={a} />
          <rect x="1" y="14" width="3" height="5" fill={b} />
          <rect x="24" y="13" width="5" height="3" fill={a} />
          <rect x="28" y="14" width="3" height="5" fill={b} />
          {/* Claw hands */}
          <rect x="0" y="19" width="2" height="1" fill={a} />
          <rect x="0" y="21" width="2" height="1" fill={a} />
          <rect x="30" y="19" width="2" height="1" fill={a} />
          <rect x="30" y="21" width="2" height="1" fill={a} />
          {/* Legs — piston */}
          <rect x="10" y="22" width="4" height="6" fill={a} />
          <rect x="18" y="22" width="4" height="6" fill={a} />
          <rect x="11" y="23" width="2" height="4" fill={b} />
          <rect x="19" y="23" width="2" height="4" fill={b} />
          {/* Feet */}
          <rect x="8" y="28" width="7" height="3" fill={a} />
          <rect x="17" y="28" width="7" height="3" fill={a} />
          {/* Sausage ammo belt */}
          <rect x="3" y="16" width="5" height="1" fill="#C03A18" />
          <rect x="24" y="16" width="5" height="1" fill="#C03A18" />
          <rect x="3" y="18" width="5" height="1" fill="#B83010" />
        </>
      )}

      {creature === 9 && (
        // CRAB — armored crustacean with pincers
        <>
          {/* Shell */}
          <rect x="6" y="10" width="20" height="12" fill={b} />
          <rect x="8" y="8" width="16" height="3" fill={b} />
          <rect x="10" y="7" width="12" height="2" fill={a} />
          {/* Shell pattern */}
          <rect x="10" y="11" width="4" height="3" fill={d} opacity="0.3" />
          <rect x="18" y="11" width="4" height="3" fill={d} opacity="0.3" />
          <rect x="13" y="15" width="6" height="3" fill={d} opacity="0.2" />
          {/* Eye stalks */}
          <rect x="11" y="4" width="2" height="4" fill={a} />
          <rect x="19" y="4" width="2" height="4" fill={a} />
          <rect x="10" y="3" width="4" height="2" fill={b} />
          <rect x="18" y="3" width="4" height="2" fill={b} />
          {/* Eyes */}
          <rect x="11" y="3" width="2" height="2" fill="#fff" />
          <rect x="19" y="3" width="2" height="2" fill="#fff" />
          <rect x="11" y="4" width="1" height="1" fill="#000" />
          <rect x="20" y="4" width="1" height="1" fill="#000" />
          {/* Left pincer */}
          <rect x="1" y="10" width="5" height="3" fill={a} />
          <rect x="0" y="8" width="4" height="3" fill={b} />
          <rect x="0" y="11" width="3" height="3" fill={b} />
          <rect x="0" y="9" width="2" height="1" fill={a} />
          <rect x="0" y="13" width="2" height="1" fill={a} />
          {/* Right pincer holding sausage */}
          <rect x="26" y="10" width="5" height="3" fill={a} />
          <rect x="28" y="8" width="4" height="3" fill={b} />
          <rect x="29" y="11" width="3" height="3" fill={b} />
          <rect x="30" y="9" width="2" height="1" fill={a} />
          <rect x="30" y="13" width="2" height="1" fill={a} />
          {/* Sausage in pincer */}
          <rect x="27" y="6" width="2" height="5" fill="#C03A18" />
          <rect x="27" y="5" width="2" height="1" fill="#8C2508" />
          {/* Legs */}
          <rect x="6" y="22" width="3" height="4" fill={a} />
          <rect x="11" y="22" width="3" height="5" fill={a} />
          <rect x="18" y="22" width="3" height="5" fill={a} />
          <rect x="23" y="22" width="3" height="4" fill={a} />
          <rect x="5" y="26" width="4" height="2" fill={b} />
          <rect x="10" y="27" width="4" height="2" fill={b} />
          <rect x="18" y="27" width="4" height="2" fill={b} />
          <rect x="23" y="26" width="4" height="2" fill={b} />
          {/* Mouth */}
          <rect x="14" y="19" width="4" height="2" fill="#000" opacity="0.5" />
          <rect x="14" y="19" width="1" height="1" fill={d} />
          <rect x="17" y="19" width="1" height="1" fill={d} />
        </>
      )}

      {creature === 10 && (
        // WOLF — fierce four-legged predator
        <>
          {/* Body */}
          <rect x="6" y="14" width="18" height="8" fill={b} />
          <rect x="8" y="12" width="14" height="3" fill={b} />
          {/* Back fur */}
          <rect x="8" y="12" width="3" height="1" fill={a} />
          <rect x="14" y="11" width="4" height="1" fill={a} />
          <rect x="20" y="12" width="3" height="1" fill={a} />
          {/* Belly */}
          <rect x="10" y="18" width="10" height="3" fill={d} opacity="0.3" />
          {/* Head */}
          <rect x="22" y="8" width="8" height="8" fill={b} />
          <rect x="24" y="6" width="4" height="3" fill={b} />
          {/* Snout */}
          <rect x="28" y="10" width="4" height="4" fill={a} />
          <rect x="30" y="12" width="2" height="2" fill="#000" />
          <rect x="31" y="12" width="1" height="1" fill={d} />
          {/* Ears */}
          <rect x="24" y="4" width="2" height="3" fill={b} />
          <rect x="28" y="4" width="2" height="3" fill={b} />
          <rect x="24" y="4" width="1" height="2" fill={d} />
          <rect x="29" y="4" width="1" height="2" fill={d} />
          {/* Eye */}
          <rect x="26" y="9" width="2" height="2" fill={a} />
          <rect x="27" y="9" width="1" height="1" fill="#000" />
          {/* Fangs */}
          <rect x="29" y="14" width="1" height="2" fill="#fff" />
          <rect x="31" y="14" width="1" height="1" fill="#fff" />
          {/* Front legs */}
          <rect x="20" y="22" width="3" height="6" fill={b} />
          <rect x="17" y="22" width="3" height="6" fill={b} />
          <rect x="17" y="28" width="3" height="2" fill={a} />
          <rect x="20" y="28" width="3" height="2" fill={a} />
          {/* Back legs */}
          <rect x="6" y="22" width="3" height="5" fill={b} />
          <rect x="10" y="22" width="3" height="5" fill={b} />
          <rect x="6" y="27" width="3" height="2" fill={a} />
          <rect x="10" y="27" width="3" height="2" fill={a} />
          {/* Tail */}
          <rect x="2" y="12" width="4" height="2" fill={b} />
          <rect x="0" y="10" width="3" height="3" fill={a} />
          {/* Sausage in mouth */}
          <rect x="28" y="13" width="4" height="1" fill="#C03A18" />
          <rect x="27" y="13" width="1" height="1" fill="#8C2508" />
        </>
      )}

      {creature === 11 && (
        // TURTLE — shelled tank creature
        <>
          {/* Shell */}
          <rect x="6" y="8" width="20" height="14" fill={b} />
          <rect x="8" y="6" width="16" height="3" fill={b} />
          <rect x="4" y="10" width="2" height="10" fill={b} />
          <rect x="26" y="10" width="2" height="10" fill={b} />
          {/* Shell pattern — hexagonal */}
          <rect x="9" y="9" width="5" height="4" fill={d} opacity="0.4" />
          <rect x="18" y="9" width="5" height="4" fill={d} opacity="0.4" />
          <rect x="13" y="9" width="6" height="3" fill={a} opacity="0.3" />
          <rect x="9" y="14" width="6" height="4" fill={d} opacity="0.3" />
          <rect x="17" y="14" width="6" height="4" fill={d} opacity="0.3" />
          <rect x="12" y="16" width="8" height="3" fill={a} opacity="0.2" />
          {/* Shell ridge */}
          <rect x="14" y="6" width="4" height="1" fill={a} />
          <rect x="13" y="7" width="6" height="1" fill={a} opacity="0.5" />
          {/* Head */}
          <rect x="26" y="12" width="6" height="6" fill={a} />
          <rect x="28" y="10" width="4" height="3" fill={a} />
          {/* Eyes */}
          <rect x="29" y="11" width="2" height="2" fill="#fff" />
          <rect x="30" y="12" width="1" height="1" fill="#000" />
          {/* Mouth */}
          <rect x="30" y="15" width="2" height="1" fill={b} />
          <rect x="31" y="14" width="1" height="1" fill={d} />
          {/* Front legs */}
          <rect x="22" y="22" width="5" height="4" fill={a} />
          <rect x="22" y="26" width="6" height="3" fill={d} opacity="0.6" />
          {/* Back legs */}
          <rect x="5" y="22" width="5" height="4" fill={a} />
          <rect x="4" y="26" width="6" height="3" fill={d} opacity="0.6" />
          {/* Tail */}
          <rect x="2" y="18" width="3" height="2" fill={a} />
          <rect x="0" y="18" width="2" height="1" fill={a} opacity="0.5" />
          {/* Sausage on shell */}
          <rect x="11" y="5" width="6" height="2" fill="#C03A18" />
          <rect x="10" y="5" width="1" height="2" fill="#8C2508" />
          <rect x="17" y="5" width="1" height="2" fill="#8C2508" />
        </>
      )}
    </svg>
  )
}

// Floating particle decoration
function Particles({ theme, name }: { theme: TypeTheme; name: string }) {
  const h = hash(name)
  const positions = Array.from({ length: 5 }, (_, i) => ({
    left: `${10 + ((h * (i + 1) * 7) % 80)}%`,
    top: `${5 + ((h * (i + 3) * 13) % 85)}%`,
    delay: `${(i * 0.8)}s`,
    size: 8 + (i % 3) * 4,
  }))

  return (
    <>
      {positions.map((p, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: p.left,
          top: p.top,
          fontSize: `${p.size}px`,
          opacity: 0.15,
          pointerEvents: 'none',
          filter: 'blur(0.5px)',
        }}>
          {theme.particle}
        </span>
      ))}
    </>
  )
}

function parseMove(move: string): { name: string; damage: string; pp: string } {
  const match = move.match(/^(.+?)\s*\((\d+)\/(\d+)\)$/)
  if (match) return { name: match[1], damage: match[2], pp: match[3] }
  return { name: move, damage: '?', pp: '?' }
}

export function HeroCardDisplay({ card, stats }: Props) {
  const [type1, type2] = card.heroType.split('/')
  const t = getTypeTheme(card.heroType)
  const t2 = type2 ? getTypeTheme(type2.trim()) : null

  const frameColor = '#D4B96B' // Gold card frame
  const frameDark = '#8B7435'
  const cardBg = '#1a1a2e'
  const panelBg = '#111122'

  return (
    <div style={{
      background: `linear-gradient(135deg, ${frameColor}, #F0E68C, ${frameColor}, ${frameDark})`,
      borderRadius: '14px',
      padding: '6px',
      maxWidth: '380px',
      margin: '0 auto',
      boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${t.glow}`,
    }}>
      <div style={{
        background: cardBg,
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {/* Header: Title + HP */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px 8px',
          background: `linear-gradient(90deg, ${panelBg}, ${cardBg})`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '11px',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {card.heroTitle}
            </div>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: '#888',
              marginTop: '2px',
            }}>
              {card.playerName.toUpperCase()}
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '13px',
            color: '#FF4444',
            background: '#000',
            padding: '4px 10px',
            border: '2px solid #FF4444',
            borderRadius: '4px',
            flexShrink: 0,
            marginLeft: '8px',
          }}>
            HP {card.hp}
          </div>
        </div>

        {/* Picture frame with avatar */}
        <div style={{
          margin: '0 12px',
          padding: '4px',
          background: `linear-gradient(135deg, ${frameDark}, ${frameColor}, ${frameDark})`,
          borderRadius: '6px',
        }}>
          <div style={{
            background: t.gradient,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '170px',
          }}>
            <Particles theme={t} name={card.playerName} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PixelAvatar card={card} stats={stats} theme={t} />
            </div>
          </div>
        </div>

        {/* Type badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 14px 4px',
        }}>
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            background: t.border,
            color: '#000',
            padding: '3px 12px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }}>
            {type1?.trim()}
          </span>
          {type2 && (
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              background: t2?.border ?? '#666',
              color: '#000',
              padding: '3px 12px',
              borderRadius: '10px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
              {type2.trim()}
            </span>
          )}
        </div>

        {/* Stats panel */}
        <div style={{
          margin: '8px 12px',
          padding: '10px 12px',
          background: panelBg,
          borderRadius: '6px',
          border: '1px solid #333',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'ATK', value: card.attack, color: '#FF4444' },
              { label: 'DEF', value: card.defense, color: '#4488FF' },
              { label: 'SPD', value: card.speed, color: '#44CC44' },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: stat.color,
                  marginBottom: '4px',
                  letterSpacing: '1px',
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '16px',
                  color: '#FFFFFF',
                  textShadow: `0 0 6px ${stat.color}44`,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  height: '4px',
                  background: '#0a0a0a',
                  borderRadius: '2px',
                  marginTop: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((stat.value / 150) * 100))}%`,
                    background: stat.color,
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special moves */}
        <div style={{
          margin: '0 12px 8px',
          padding: '10px 12px',
          background: panelBg,
          borderRadius: '6px',
          border: '1px solid #333',
        }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: frameColor,
            marginBottom: '8px',
            letterSpacing: '2px',
          }}>
            MOVES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {card.specialMoves.map((move, i) => {
              const parsed = parseMove(move)
              return (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: '#0a0a15',
                  borderRadius: '3px',
                  borderLeft: `3px solid ${t.border}`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    color: '#FFFFFF',
                  }}>
                    {parsed.name}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: '#FF6666',
                    }}>
                      {parsed.damage} DMG
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: '#6688CC',
                    }}>
                      {parsed.pp} PP
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weakness */}
        <div style={{
          padding: '0 14px 6px',
        }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#CC6666',
            textTransform: 'uppercase',
          }}>
            ⚠ WEAKNESS: {card.weakness}
          </div>
        </div>

        {/* Catchphrase */}
        <div style={{
          padding: '8px 14px',
          borderTop: '1px solid #222',
        }}>
          <div style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '11px',
            color: frameColor,
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.4,
          }}>
            &ldquo;{card.catchphrase}&rdquo;
          </div>
        </div>

        {/* Flavor text */}
        <div style={{
          padding: '4px 14px 10px',
        }}>
          <div style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '10px',
            color: '#777',
            fontStyle: 'italic',
            lineHeight: 1.5,
            textAlign: 'center',
          }}>
            {card.flavorText}
          </div>
        </div>

        {/* Footer stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 14px 10px',
          borderTop: `2px solid ${frameDark}`,
          background: '#0a0a0a',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFFFFF' }}>
              {stats.totalItems}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666' }}>
              {IS_EXERCISE ? 'WORKOUTS' : 'SAUSAGES'}
            </div>
          </div>
          {!IS_EXERCISE && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFFFFF' }}>
                {stats.totalGrams}g
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666' }}>
                CONSUMED
              </div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFFFFF' }}>
              {stats.mealCount}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666' }}>
              {IS_EXERCISE ? 'SESSIONS' : 'MEALS'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFFFFF' }}>
              {stats.chainLength}W
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666' }}>
              {IS_EXERCISE ? 'STREAK' : 'CHAIN'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
