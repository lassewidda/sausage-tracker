'use client'

import type { ShopItem } from '@/lib/shopCatalog'

const CATEGORY_COLORS: Record<ShopItem['category'], { bg: string; border: string }> = {
  merch: { bg: '#1a1020', border: '#AA66CC' },
  card_pack: { bg: '#1a1400', border: '#FFD700' },
  item: { bg: '#0a1528', border: '#4488FF' },
}

function getShopPixels(slug: string): JSX.Element {
  switch (slug) {
    // ── MERCH ──────────────────────────────────────────
    case 'golden-bratwurst-trophy':
      return <>
        {/* Trophy cup */}
        <rect x="12" y="4" width="8" height="3" fill="#FFD700" />
        <rect x="10" y="7" width="12" height="10" fill="#FFD700" rx="1" />
        <rect x="8" y="8" width="3" height="6" fill="#DDAA00" />
        <rect x="21" y="8" width="3" height="6" fill="#DDAA00" />
        <rect x="13" y="17" width="6" height="3" fill="#CCAA00" />
        <rect x="11" y="20" width="10" height="2" fill="#FFD700" />
        <rect x="10" y="22" width="12" height="3" fill="#DDAA00" />
        {/* Star */}
        <rect x="15" y="10" width="2" height="2" fill="#FFF" />
        <rect x="14" y="11" width="4" height="2" fill="#FFF" opacity="0.7" />
      </>
    case 'sausage-apron':
      return <>
        {/* Apron body */}
        <rect x="9" y="6" width="14" height="20" fill="#FFFFFF" rx="1" />
        <rect x="11" y="4" width="10" height="3" fill="#EEEEEE" />
        {/* Neck strap */}
        <rect x="15" y="1" width="2" height="4" fill="#CCCCCC" />
        {/* Waist ties */}
        <rect x="6" y="12" width="4" height="2" fill="#CCCCCC" />
        <rect x="22" y="12" width="4" height="2" fill="#CCCCCC" />
        {/* Pocket (sausage shape) */}
        <rect x="12" y="15" width="8" height="5" fill="#EEEEEE" />
        <rect x="13" y="16" width="6" height="3" fill="#CC5533" rx="1" />
        {/* Text dots */}
        <rect x="12" y="9" width="2" height="1" fill="#888" />
        <rect x="15" y="9" width="2" height="1" fill="#888" />
        <rect x="18" y="9" width="2" height="1" fill="#888" />
      </>
    case 'mystery-meat-plushie':
      return <>
        {/* Body - round squishy shape */}
        <rect x="8" y="8" width="16" height="14" rx="4" fill="#DD8877" />
        <rect x="10" y="6" width="12" height="4" rx="2" fill="#DDAA99" />
        {/* Eyes */}
        <rect x="11" y="11" width="3" height="3" fill="#FFFFFF" />
        <rect x="18" y="11" width="3" height="3" fill="#FFFFFF" />
        <rect x="12" y="12" width="2" height="2" fill="#222222" />
        <rect x="19" y="12" width="2" height="2" fill="#222222" />
        {/* Mouth */}
        <rect x="14" y="16" width="4" height="2" fill="#AA5544" />
        {/* Arms */}
        <rect x="6" y="12" width="3" height="4" fill="#DD8877" rx="1" />
        <rect x="23" y="12" width="3" height="4" fill="#DD8877" rx="1" />
        {/* Question mark */}
        <rect x="14" y="2" width="4" height="2" fill="#FFD700" />
        <rect x="16" y="3" width="2" height="2" fill="#FFD700" />
        <rect x="14" y="4" width="4" height="1" fill="#FFD700" />
      </>
    case 'commemorative-tongs':
      return <>
        {/* Handle */}
        <rect x="14" y="18" width="4" height="10" fill="#888888" />
        <rect x="13" y="26" width="6" height="3" fill="#666666" rx="1" />
        {/* Left arm */}
        <rect x="8" y="4" width="3" height="16" fill="#AAAAAA" />
        <rect x="6" y="2" width="4" height="4" fill="#AAAAAA" rx="1" />
        {/* Right arm */}
        <rect x="21" y="4" width="3" height="16" fill="#AAAAAA" />
        <rect x="22" y="2" width="4" height="4" fill="#AAAAAA" rx="1" />
        {/* Pivot */}
        <rect x="11" y="16" width="10" height="4" fill="#999999" rx="1" />
        {/* Grip dots */}
        <rect x="8" y="6" width="1" height="1" fill="#CCC" />
        <rect x="8" y="9" width="1" height="1" fill="#CCC" />
        <rect x="8" y="12" width="1" height="1" fill="#CCC" />
        <rect x="23" y="6" width="1" height="1" fill="#CCC" />
        <rect x="23" y="9" width="1" height="1" fill="#CCC" />
        <rect x="23" y="12" width="1" height="1" fill="#CCC" />
      </>
    case 'sausage-wars-tshirt':
      return <>
        {/* T-shirt body */}
        <rect x="8" y="8" width="16" height="18" fill="#334455" />
        {/* Sleeves */}
        <rect x="4" y="8" width="6" height="8" fill="#334455" />
        <rect x="22" y="8" width="6" height="8" fill="#334455" />
        {/* Collar */}
        <rect x="12" y="6" width="8" height="4" fill="#2a3a4a" rx="1" />
        <rect x="14" y="7" width="4" height="3" fill="#334455" />
        {/* Crossed sausages graphic */}
        <rect x="10" y="13" width="12" height="2" fill="#CC5533" transform="rotate(-20 16 14)" />
        <rect x="10" y="13" width="12" height="2" fill="#CC5533" transform="rotate(20 16 14)" />
        {/* Skull/star */}
        <rect x="14" y="12" width="4" height="4" fill="#FFD700" />
      </>
    case 'desktop-sausage-warmer':
      return <>
        {/* Base unit */}
        <rect x="6" y="16" width="20" height="10" fill="#444444" rx="1" />
        <rect x="8" y="18" width="16" height="6" fill="#333333" />
        {/* Warming slot */}
        <rect x="10" y="12" width="12" height="6" fill="#555555" />
        {/* Sausage inside */}
        <rect x="11" y="13" width="10" height="4" fill="#CC5533" rx="2" />
        {/* Steam */}
        <rect x="13" y="8" width="2" height="4" fill="#AACCEE" opacity="0.4" />
        <rect x="17" y="6" width="2" height="5" fill="#AACCEE" opacity="0.3" />
        <rect x="15" y="4" width="2" height="5" fill="#AACCEE" opacity="0.3" />
        {/* USB cable */}
        <rect x="4" y="22" width="4" height="2" fill="#666666" />
        <rect x="2" y="21" width="3" height="4" fill="#888888" />
        {/* LED */}
        <rect x="24" y="24" width="2" height="2" fill="#44FF44" />
      </>

    // ── CARD PACKS ────────────────────────────────────
    case 'budget-banger-pack':
      return <>
        {/* Pack wrapper */}
        <rect x="8" y="4" width="16" height="24" fill="#886644" rx="1" />
        <rect x="10" y="6" width="12" height="20" fill="#AA8866" />
        {/* Card peeking out */}
        <rect x="11" y="8" width="10" height="14" fill="#DDDDDD" />
        <rect x="13" y="10" width="6" height="4" fill="#CC5533" rx="1" />
        {/* Question mark */}
        <rect x="14" y="16" width="4" height="2" fill="#888" />
        <rect x="15" y="18" width="2" height="2" fill="#888" />
        {/* Tape */}
        <rect x="6" y="14" width="20" height="3" fill="#CCBB77" opacity="0.6" />
      </>
    case 'grillmasters-selection':
      return <>
        {/* Premium box */}
        <rect x="6" y="6" width="20" height="20" fill="#884422" rx="1" />
        <rect x="8" y="8" width="16" height="16" fill="#AA5533" />
        {/* Gold trim */}
        <rect x="6" y="6" width="20" height="2" fill="#FFD700" />
        <rect x="6" y="24" width="20" height="2" fill="#FFD700" />
        {/* Three cards fanned */}
        <rect x="9" y="10" width="8" height="11" fill="#EEEEEE" transform="rotate(-10 13 16)" />
        <rect x="12" y="10" width="8" height="11" fill="#FFFFFF" />
        <rect x="15" y="10" width="8" height="11" fill="#EEEEEE" transform="rotate(10 19 16)" />
        {/* Star on middle card */}
        <rect x="15" y="13" width="2" height="2" fill="#FFD700" />
        <rect x="14" y="14" width="4" height="2" fill="#FFD700" />
      </>
    case 'forbidden-crate':
      return <>
        {/* Wooden crate */}
        <rect x="4" y="8" width="24" height="18" fill="#664422" />
        <rect x="4" y="8" width="24" height="3" fill="#775533" />
        <rect x="4" y="14" width="24" height="3" fill="#775533" />
        <rect x="4" y="20" width="24" height="3" fill="#775533" />
        {/* Metal bands */}
        <rect x="4" y="10" width="24" height="1" fill="#888888" />
        <rect x="4" y="18" width="24" height="1" fill="#888888" />
        {/* Glow */}
        <rect x="10" y="11" width="12" height="8" fill="#FF44FF" opacity="0.25" rx="2" />
        {/* Warning symbol */}
        <rect x="14" y="12" width="4" height="4" fill="#FF4444" />
        <rect x="15" y="11" width="2" height="1" fill="#FF4444" />
        <rect x="15" y="17" width="2" height="2" fill="#FF4444" />
        {/* Nails */}
        <rect x="6" y="9" width="2" height="2" fill="#AAAAAA" />
        <rect x="24" y="9" width="2" height="2" fill="#AAAAAA" />
        <rect x="6" y="22" width="2" height="2" fill="#AAAAAA" />
        <rect x="24" y="22" width="2" height="2" fill="#AAAAAA" />
      </>

    // ── ITEMS ─────────────────────────────────────────
    case 'mystery-condiment':
      return <>
        {/* Bottle */}
        <rect x="12" y="6" width="8" height="18" fill="#777777" rx="1" />
        <rect x="14" y="3" width="4" height="5" fill="#666666" />
        <rect x="15" y="1" width="2" height="3" fill="#555555" />
        {/* Label with ? */}
        <rect x="12" y="12" width="8" height="6" fill="#DDDDDD" />
        <rect x="14" y="13" width="4" height="2" fill="#444444" />
        <rect x="15" y="16" width="2" height="1" fill="#444444" />
        {/* Drip */}
        <rect x="15" y="24" width="2" height="3" fill="#88CC44" />
      </>
    case 'premium-provisions':
      return <>
        {/* Gift box */}
        <rect x="8" y="10" width="16" height="14" fill="#4488FF" rx="1" />
        <rect x="8" y="10" width="16" height="3" fill="#5599FF" />
        {/* Ribbon vertical */}
        <rect x="14" y="8" width="4" height="18" fill="#FF8800" />
        {/* Ribbon horizontal */}
        <rect x="6" y="14" width="20" height="3" fill="#FF8800" />
        {/* Bow */}
        <rect x="11" y="6" width="4" height="4" fill="#FFAA44" rx="1" />
        <rect x="17" y="6" width="4" height="4" fill="#FFAA44" rx="1" />
        <rect x="14" y="7" width="4" height="3" fill="#FF8800" />
        {/* Shine */}
        <rect x="10" y="12" width="2" height="2" fill="#FFFFFF" opacity="0.3" />
      </>
    case 'chefs-secret-stash':
      return <>
        {/* Safe/vault */}
        <rect x="6" y="6" width="20" height="20" fill="#555555" rx="2" />
        <rect x="8" y="8" width="16" height="16" fill="#444444" />
        {/* Door details */}
        <rect x="10" y="10" width="12" height="12" fill="#666666" />
        {/* Dial */}
        <rect x="18" y="14" width="4" height="4" fill="#888888" rx="2" />
        <rect x="19" y="15" width="2" height="2" fill="#AAAAAA" />
        {/* Handle */}
        <rect x="12" y="15" width="5" height="2" fill="#AAAAAA" />
        {/* Gold glow from inside */}
        <rect x="11" y="11" width="8" height="8" fill="#FFD700" opacity="0.15" rx="1" />
        {/* Stars */}
        <rect x="13" y="12" width="2" height="2" fill="#FFD700" opacity="0.5" />
        <rect x="16" y="18" width="2" height="2" fill="#FFD700" opacity="0.4" />
      </>
    case 'bulk-ketchup-crate':
      return <>
        {/* Cardboard box */}
        <rect x="6" y="10" width="20" height="16" fill="#BB8844" rx="1" />
        <rect x="6" y="10" width="20" height="3" fill="#CC9955" />
        {/* Flaps */}
        <rect x="6" y="8" width="10" height="4" fill="#CCAA66" transform="rotate(-5 11 10)" />
        <rect x="16" y="8" width="10" height="4" fill="#CCAA66" transform="rotate(5 21 10)" />
        {/* Three ketchup packets inside */}
        <rect x="8" y="14" width="5" height="8" fill="#CC2222" rx="1" />
        <rect x="14" y="14" width="5" height="8" fill="#CC2222" rx="1" />
        <rect x="20" y="14" width="5" height="8" fill="#CC2222" rx="1" />
        {/* Labels */}
        <rect x="9" y="15" width="3" height="2" fill="#FFFFFF" opacity="0.7" />
        <rect x="15" y="15" width="3" height="2" fill="#FFFFFF" opacity="0.7" />
        <rect x="21" y="15" width="3" height="2" fill="#FFFFFF" opacity="0.7" />
      </>
    default:
      return <>
        <rect x="10" y="10" width="12" height="12" fill="#666" />
        <rect x="14" y="13" width="4" height="2" fill="#AAA" />
        <rect x="15" y="17" width="2" height="2" fill="#AAA" />
      </>
  }
}

interface Props {
  slug: string
  category: ShopItem['category']
  size?: number
}

export function ShopItemIcon({ slug, category, size = 48 }: Props) {
  const colors = CATEGORY_COLORS[category]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{
        imageRendering: 'pixelated',
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '4px',
        flexShrink: 0,
      }}
    >
      {getShopPixels(slug)}
    </svg>
  )
}
