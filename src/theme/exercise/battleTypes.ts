import type { TypeTheme } from '../types'

// Type advantage chart: attacker -> defender -> multiplier
// Each type has 2-3 strengths (1.5x) and 1-2 weaknesses (0.75x)
// Balanced so no type is dominant
export const exerciseTypeChart: Record<string, Record<string, number>> = {
  STRENGTH: {
    CALISTHENICS: 1.5, FLEXIBILITY: 1.5, CYCLING: 1.5,
    SPEED: 0.75, YOGA: 0.75,
  },
  CARDIO: {
    STRENGTH: 1.5, POWER: 1.5,
    HIIT: 0.75, SWIMMING: 0.75,
  },
  FLEXIBILITY: {
    SPEED: 1.5, HIIT: 1.5,
    STRENGTH: 0.75, POWER: 0.75,
  },
  ENDURANCE: {
    HIIT: 1.5, SPEED: 1.5, CROSSFIT: 1.5,
    CARDIO: 0.75, CYCLING: 0.75,
  },
  SPEED: {
    CARDIO: 1.5, YOGA: 1.5,
    ENDURANCE: 0.75, FLEXIBILITY: 0.75,
  },
  POWER: {
    SPEED: 1.5, CALISTHENICS: 1.5, ENDURANCE: 1.5,
    CARDIO: 0.75, CROSSFIT: 0.75,
  },
  CROSSFIT: {
    YOGA: 1.5, SWIMMING: 1.5,
    ENDURANCE: 0.75, POWER: 0.75,
  },
  YOGA: {
    POWER: 1.5, CROSSFIT: 1.5,
    SPEED: 0.75, HIIT: 0.75,
  },
  HIIT: {
    CARDIO: 1.5, CYCLING: 1.5, SWIMMING: 1.5,
    FLEXIBILITY: 0.75, ENDURANCE: 0.75,
  },
  CALISTHENICS: {
    CROSSFIT: 1.5, ENDURANCE: 1.5,
    STRENGTH: 0.75, POWER: 0.75,
  },
  SWIMMING: {
    CARDIO: 1.5, FLEXIBILITY: 1.5,
    HIIT: 0.75, CROSSFIT: 0.75,
  },
  CYCLING: {
    YOGA: 1.5, CALISTHENICS: 1.5, STRENGTH: 1.5,
    HIIT: 0.75, ENDURANCE: 0.75,
  },
}

export const exerciseTypeThemes: Record<string, TypeTheme> = {
  STRENGTH: {
    bg: '#8B0000',
    gradient: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
    border: '#FF4444',
    glow: 'rgba(220, 20, 60, 0.6)',
    accent: '#FF6B6B',
    bodyColor: '#FFD4D4',
    accentColor: '#FF2222',
    particle: '💪',
  },
  CARDIO: {
    bg: '#FF4500',
    gradient: 'linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)',
    border: '#FFA500',
    glow: 'rgba(255, 69, 0, 0.6)',
    accent: '#FFB347',
    bodyColor: '#FFE4CC',
    accentColor: '#FF6600',
    particle: '🏃',
  },
  FLEXIBILITY: {
    bg: '#9370DB',
    gradient: 'linear-gradient(135deg, #9370DB 0%, #DA70D6 100%)',
    border: '#DDA0DD',
    glow: 'rgba(147, 112, 219, 0.6)',
    accent: '#E6B0E6',
    bodyColor: '#F3E5F5',
    accentColor: '#9C27B0',
    particle: '🧘',
  },
  ENDURANCE: {
    bg: '#2E8B57',
    gradient: 'linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)',
    border: '#66CDAA',
    glow: 'rgba(46, 139, 87, 0.6)',
    accent: '#90EE90',
    bodyColor: '#E0F5E0',
    accentColor: '#228B22',
    particle: '🏔️',
  },
  SPEED: {
    bg: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 100%)',
    border: '#FFEC8B',
    glow: 'rgba(255, 215, 0, 0.6)',
    accent: '#FFF68F',
    bodyColor: '#FFFDE7',
    accentColor: '#DAA520',
    particle: '⚡',
  },
  POWER: {
    bg: '#B22222',
    gradient: 'linear-gradient(135deg, #B22222 0%, #CD5C5C 100%)',
    border: '#F08080',
    glow: 'rgba(178, 34, 34, 0.6)',
    accent: '#FA8072',
    bodyColor: '#FFE4E1',
    accentColor: '#CC0000',
    particle: '🔥',
  },
  CROSSFIT: {
    bg: '#4169E1',
    gradient: 'linear-gradient(135deg, #4169E1 0%, #6495ED 100%)',
    border: '#87CEEB',
    glow: 'rgba(65, 105, 225, 0.6)',
    accent: '#ADD8E6',
    bodyColor: '#E3F2FD',
    accentColor: '#1565C0',
    particle: '🏋️',
  },
  YOGA: {
    bg: '#20B2AA',
    gradient: 'linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)',
    border: '#7FFFD4',
    glow: 'rgba(32, 178, 170, 0.6)',
    accent: '#AFEEEE',
    bodyColor: '#E0F7FA',
    accentColor: '#00897B',
    particle: '🕉️',
  },
  HIIT: {
    bg: '#FF1493',
    gradient: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
    border: '#FFB6C1',
    glow: 'rgba(255, 20, 147, 0.6)',
    accent: '#FFC0CB',
    bodyColor: '#FCE4EC',
    accentColor: '#C2185B',
    particle: '💥',
  },
  CALISTHENICS: {
    bg: '#8B4513',
    gradient: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
    border: '#DEB887',
    glow: 'rgba(139, 69, 19, 0.6)',
    accent: '#F4A460',
    bodyColor: '#FFF3E0',
    accentColor: '#A0522D',
    particle: '🤸',
  },
  SWIMMING: {
    bg: '#0077BE',
    gradient: 'linear-gradient(135deg, #0077BE 0%, #00BFFF 100%)',
    border: '#87CEFA',
    glow: 'rgba(0, 119, 190, 0.6)',
    accent: '#B0E0E6',
    bodyColor: '#E1F5FE',
    accentColor: '#0288D1',
    particle: '🏊',
  },
  CYCLING: {
    bg: '#556B2F',
    gradient: 'linear-gradient(135deg, #556B2F 0%, #6B8E23 100%)',
    border: '#9ACD32',
    glow: 'rgba(85, 107, 47, 0.6)',
    accent: '#ADFF2F',
    bodyColor: '#F1F8E9',
    accentColor: '#558B2F',
    particle: '🚴',
  },
}

export const exerciseDefaultTypeTheme: TypeTheme = {
  bg: '#696969',
  gradient: 'linear-gradient(135deg, #696969 0%, #A9A9A9 100%)',
  border: '#C0C0C0',
  glow: 'rgba(105, 105, 105, 0.6)',
  accent: '#D3D3D3',
  bodyColor: '#F5F5F5',
  accentColor: '#808080',
  particle: '🏅',
}
