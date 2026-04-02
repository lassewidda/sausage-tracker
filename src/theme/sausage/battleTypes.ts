import type { TypeTheme } from '@/theme/types'

// Sausage-themed type advantage matrix
// Super effective = 1.5x, not very effective = 0.66x
export const TYPE_CHART: Record<string, Record<string, number>> = {
  BRATWURST:    { FRANKFURTER: 1.5, VEGGIE: 1.5, WEISSWURST: 0.66 },
  FRANKFURTER:  { WEISSWURST: 1.5, VEGGIE: 1.5, MUSTARD: 0.66, CHORIZO: 0.66 },
  CHORIZO:      { FRANKFURTER: 1.5, WEISSWURST: 1.5, KIELBASA: 1.5, SAUERKRAUT: 0.66 },
  KIELBASA:     { BRATWURST: 1.5, ANDOUILLE: 1.5, CHORIZO: 0.66, CURRYWURST: 0.66 },
  ANDOUILLE:    { FRANKFURTER: 1.5, CURRYWURST: 1.5, KIELBASA: 0.66, BLOOD_SAUSAGE: 0.66 },
  WEISSWURST:   { KIELBASA: 1.5, BLOOD_SAUSAGE: 1.5, CHORIZO: 0.66, GRILLED: 0.66 },
  CURRYWURST:   { KIELBASA: 1.5, BRATWURST: 1.5, ANDOUILLE: 0.66, SAUERKRAUT: 0.66 },
  BLOOD_SAUSAGE:{ VEGGIE: 1.5, ANDOUILLE: 1.5, WEISSWURST: 0.66, MUSTARD: 0.66 },
  VEGGIE:       { SAUERKRAUT: 1.5, MUSTARD: 1.5, BRATWURST: 0.66, BLOOD_SAUSAGE: 0.66, CHORIZO: 0.66 },
  MUSTARD:      { FRANKFURTER: 1.5, BLOOD_SAUSAGE: 1.5, SAUERKRAUT: 0.66, VEGGIE: 0.66 },
  SAUERKRAUT:   { MUSTARD: 1.5, CHORIZO: 1.5, CURRYWURST: 1.5, VEGGIE: 0.66, BRATWURST: 0.66 },
  GRILLED:      { WEISSWURST: 1.5, VEGGIE: 1.5, SAUERKRAUT: 0.66, MUSTARD: 0.66 },
}

export const TYPE_THEMES: Record<string, TypeTheme> = {
  FIRE: {
    bg: '#1a0505', gradient: 'linear-gradient(180deg, #2a0a0a 0%, #1a0505 40%, #331100 100%)',
    border: '#FF6600', glow: 'rgba(255, 102, 0, 0.4)', accent: '#FF6600',
    bodyColor: '#FF4400', accentColor: '#FFaa00', particle: '🔥',
  },
  DARK: {
    bg: '#0d0520', gradient: 'linear-gradient(180deg, #1a0a30 0%, #0d0520 40%, #200040 100%)',
    border: '#9944FF', glow: 'rgba(153, 68, 255, 0.4)', accent: '#9944FF',
    bodyColor: '#7733CC', accentColor: '#CC88FF', particle: '🌑',
  },
  ELECTRIC: {
    bg: '#1a1a00', gradient: 'linear-gradient(180deg, #2a2a00 0%, #1a1a00 40%, #333300 100%)',
    border: '#FFDD00', glow: 'rgba(255, 221, 0, 0.4)', accent: '#FFDD00',
    bodyColor: '#FFCC00', accentColor: '#FFFFFF', particle: '⚡',
  },
  WATER: {
    bg: '#051520', gradient: 'linear-gradient(180deg, #0a2040 0%, #051520 40%, #002244 100%)',
    border: '#4499FF', glow: 'rgba(68, 153, 255, 0.4)', accent: '#4499FF',
    bodyColor: '#2288FF', accentColor: '#88CCFF', particle: '💧',
  },
  GRASS: {
    bg: '#051a05', gradient: 'linear-gradient(180deg, #0a2a0a 0%, #051a05 40%, #003300 100%)',
    border: '#44DD44', glow: 'rgba(68, 221, 68, 0.4)', accent: '#44DD44',
    bodyColor: '#22AA22', accentColor: '#88FF44', particle: '🌿',
  },
  ICE: {
    bg: '#0a1520', gradient: 'linear-gradient(180deg, #102030 0%, #0a1520 40%, #0a2535 100%)',
    border: '#88DDFF', glow: 'rgba(136, 221, 255, 0.5)', accent: '#88DDFF',
    bodyColor: '#66CCEE', accentColor: '#FFFFFF', particle: '❄️',
  },
  STEEL: {
    bg: '#111118', gradient: 'linear-gradient(180deg, #1a1a22 0%, #111118 40%, #222233 100%)',
    border: '#8888BB', glow: 'rgba(136, 136, 187, 0.3)', accent: '#9999CC',
    bodyColor: '#7777AA', accentColor: '#CCCCEE', particle: '⚙️',
  },
  POISON: {
    bg: '#150818', gradient: 'linear-gradient(180deg, #200a22 0%, #150818 40%, #2a0033 100%)',
    border: '#CC44CC', glow: 'rgba(204, 68, 204, 0.4)', accent: '#CC44CC',
    bodyColor: '#AA44AA', accentColor: '#FF88FF', particle: '☠️',
  },
  NORMAL: {
    bg: '#151510', gradient: 'linear-gradient(180deg, #222218 0%, #151510 40%, #2a2a1a 100%)',
    border: '#CCAA66', glow: 'rgba(204, 170, 102, 0.3)', accent: '#CCAA66',
    bodyColor: '#AA8844', accentColor: '#DDCC88', particle: '⭐',
  },
  SMOKED: {
    bg: '#1a1008', gradient: 'linear-gradient(180deg, #2a1a0a 0%, #1a1008 40%, #332200 100%)',
    border: '#CC8833', glow: 'rgba(204, 136, 51, 0.4)', accent: '#CC8833',
    bodyColor: '#BB7722', accentColor: '#FFBB55', particle: '💨',
  },
  GRILLED: {
    bg: '#1a0a00', gradient: 'linear-gradient(180deg, #2a1500 0%, #1a0a00 40%, #331a00 100%)',
    border: '#FF8833', glow: 'rgba(255, 136, 51, 0.4)', accent: '#FF8833',
    bodyColor: '#DD6622', accentColor: '#FFAA55', particle: '🔥',
  },
  MEAT: {
    bg: '#1a0808', gradient: 'linear-gradient(180deg, #2a1010 0%, #1a0808 40%, #330a0a 100%)',
    border: '#DD4444', glow: 'rgba(221, 68, 68, 0.4)', accent: '#DD4444',
    bodyColor: '#CC3333', accentColor: '#FF8888', particle: '🥩',
  },
  BRATWURST: {
    bg: '#1a0e05', gradient: 'linear-gradient(180deg, #2a1a08 0%, #1a0e05 40%, #332200 100%)',
    border: '#DD8833', glow: 'rgba(221, 136, 51, 0.4)', accent: '#DD8833',
    bodyColor: '#BB7722', accentColor: '#FFCC66', particle: '🌭',
  },
  FRANKFURTER: {
    bg: '#1a0808', gradient: 'linear-gradient(180deg, #2a1010 0%, #1a0808 40%, #331010 100%)',
    border: '#EE6644', glow: 'rgba(238, 102, 68, 0.4)', accent: '#EE6644',
    bodyColor: '#CC5533', accentColor: '#FF9977', particle: '🌭',
  },
  CHORIZO: {
    bg: '#1a0505', gradient: 'linear-gradient(180deg, #2a0808 0%, #1a0505 40%, #330a00 100%)',
    border: '#DD3311', glow: 'rgba(221, 51, 17, 0.5)', accent: '#DD3311',
    bodyColor: '#BB2200', accentColor: '#FF6644', particle: '🌶️',
  },
  KIELBASA: {
    bg: '#12100a', gradient: 'linear-gradient(180deg, #221a0f 0%, #12100a 40%, #2a2010 100%)',
    border: '#AA8855', glow: 'rgba(170, 136, 85, 0.3)', accent: '#AA8855',
    bodyColor: '#886633', accentColor: '#CCAA77', particle: '💨',
  },
  ANDOUILLE: {
    bg: '#150a08', gradient: 'linear-gradient(180deg, #251510 0%, #150a08 40%, #301510 100%)',
    border: '#CC6644', glow: 'rgba(204, 102, 68, 0.4)', accent: '#CC6644',
    bodyColor: '#AA5533', accentColor: '#EE9966', particle: '🔥',
  },
  WEISSWURST: {
    bg: '#0f1418', gradient: 'linear-gradient(180deg, #182028 0%, #0f1418 40%, #1a2530 100%)',
    border: '#CCDDEE', glow: 'rgba(204, 221, 238, 0.4)', accent: '#CCDDEE',
    bodyColor: '#AABBCC', accentColor: '#EEEEFF', particle: '❄️',
  },
  CURRYWURST: {
    bg: '#1a1500', gradient: 'linear-gradient(180deg, #2a2200 0%, #1a1500 40%, #332a00 100%)',
    border: '#EECC00', glow: 'rgba(238, 204, 0, 0.5)', accent: '#EECC00',
    bodyColor: '#CCAA00', accentColor: '#FFEE44', particle: '⚡',
  },
  BLOOD_SAUSAGE: {
    bg: '#120510', gradient: 'linear-gradient(180deg, #200a1a 0%, #120510 40%, #250820 100%)',
    border: '#991133', glow: 'rgba(153, 17, 51, 0.5)', accent: '#991133',
    bodyColor: '#770022', accentColor: '#CC4466', particle: '🩸',
  },
  VEGGIE: {
    bg: '#081808', gradient: 'linear-gradient(180deg, #0f280f 0%, #081808 40%, #0a300a 100%)',
    border: '#66BB44', glow: 'rgba(102, 187, 68, 0.4)', accent: '#66BB44',
    bodyColor: '#449922', accentColor: '#88DD66', particle: '🥬',
  },
  MUSTARD: {
    bg: '#1a1400', gradient: 'linear-gradient(180deg, #2a2000 0%, #1a1400 40%, #332800 100%)',
    border: '#DDAA00', glow: 'rgba(221, 170, 0, 0.5)', accent: '#DDAA00',
    bodyColor: '#BB8800', accentColor: '#FFDD44', particle: '🟡',
  },
  SAUERKRAUT: {
    bg: '#101508', gradient: 'linear-gradient(180deg, #182010 0%, #101508 40%, #1a2a0a 100%)',
    border: '#99AA44', glow: 'rgba(153, 170, 68, 0.3)', accent: '#99AA44',
    bodyColor: '#778833', accentColor: '#BBCC66', particle: '🥒',
  },
}

export const DEFAULT_TYPE_THEME: TypeTheme = {
  bg: '#1a1008', gradient: 'linear-gradient(180deg, #2a1a0a 0%, #1a1008 40%, #332200 100%)',
  border: '#FFaa00', glow: 'rgba(255, 170, 0, 0.3)', accent: '#FFaa00',
  bodyColor: '#CC6622', accentColor: '#FFAA44', particle: '🌭',
}
