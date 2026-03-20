'use client'

import type { ItemRarity } from '@/types'

const RARITY_COLORS: Record<ItemRarity, { bg: string; main: string; accent: string }> = {
  common: { bg: '#1a1a1a', main: '#888888', accent: '#aaaaaa' },
  uncommon: { bg: '#0a1528', main: '#4488FF', accent: '#88BBFF' },
  rare: { bg: '#1a1400', main: '#FFD700', accent: '#FFEE88' },
}

// Each item gets a unique pixel art icon based on its key
function getItemPixels(itemKey: string, m: string, a: string): JSX.Element {
  switch (itemKey) {
    // ── COMMON ──
    case 'ketchup_packet':
      return <>
        <rect x="10" y="6" width="12" height="20" rx="1" fill="#CC2222" />
        <rect x="12" y="8" width="8" height="3" fill="#FFFFFF" opacity="0.8" />
        <rect x="14" y="14" width="4" height="6" fill="#FF4444" />
        <rect x="15" y="24" width="2" height="3" fill="#FF4444" />
      </>
    case 'mustard_squirt':
      return <>
        <rect x="12" y="4" width="8" height="18" fill="#DDAA00" />
        <rect x="14" y="2" width="4" height="4" fill="#AA7700" />
        <rect x="15" y="0" width="2" height="3" fill="#886600" />
        <rect x="14" y="22" width="4" height="2" fill="#FFCC00" />
        <rect x="15" y="24" width="2" height="4" fill="#FFDD00" />
        <rect x="14" y="27" width="4" height="2" fill="#FFEE44" opacity="0.6" />
      </>
    case 'stale_bun_shield':
      return <>
        <rect x="8" y="10" width="16" height="14" fill="#AA8844" />
        <rect x="10" y="8" width="12" height="4" fill="#CC9955" rx="2" />
        <rect x="12" y="14" width="8" height="2" fill="#886633" />
        <rect x="10" y="18" width="12" height="2" fill="#886633" />
        <rect x="14" y="12" width="4" height="10" fill="#997744" opacity="0.5" />
      </>
    case 'relish_boost':
      return <>
        <rect x="10" y="8" width="12" height="16" fill="#228833" />
        <rect x="12" y="6" width="8" height="4" fill="#44AA55" />
        <rect x="12" y="10" width="8" height="2" fill="#66CC77" opacity="0.6" />
        <rect x="14" y="14" width="4" height="4" fill="#33BB44" />
        <rect x="11" y="20" width="2" height="2" fill="#55DD66" />
        <rect x="19" y="18" width="2" height="2" fill="#55DD66" />
      </>
    case 'onion_ring':
      return <>
        <rect x="8" y="8" width="16" height="16" rx="8" fill="#CC9933" />
        <rect x="12" y="12" width="8" height="8" rx="4" fill="#1a1a1a" />
        <rect x="10" y="9" width="4" height="2" fill="#DDBB55" opacity="0.6" />
      </>
    case 'paper_napkin':
      return <>
        <rect x="8" y="6" width="16" height="20" fill="#EEEEEE" />
        <rect x="8" y="6" width="16" height="2" fill="#DDDDDD" />
        <rect x="10" y="10" width="12" height="1" fill="#CCCCCC" opacity="0.4" />
        <rect x="10" y="14" width="12" height="1" fill="#CCCCCC" opacity="0.4" />
        <rect x="10" y="18" width="12" height="1" fill="#CCCCCC" opacity="0.4" />
        <rect x="10" y="22" width="8" height="1" fill="#CCCCCC" opacity="0.4" />
      </>
    case 'toothpick_lance':
      return <>
        <rect x="15" y="2" width="2" height="24" fill="#CC9955" />
        <rect x="14" y="2" width="4" height="2" fill="#DDDDDD" />
        <rect x="15" y="1" width="2" height="2" fill="#EEEEEE" />
        <rect x="14" y="26" width="4" height="2" fill="#AA7733" />
      </>
    case 'fizzy_cola':
      return <>
        <rect x="11" y="4" width="10" height="22" fill="#331111" />
        <rect x="11" y="4" width="10" height="4" fill="#888888" />
        <rect x="13" y="2" width="6" height="3" fill="#AAAAAA" />
        <rect x="13" y="10" width="6" height="4" fill="#CC0000" />
        <rect x="14" y="16" width="4" height="2" fill="#CC0000" opacity="0.5" />
        <rect x="18" y="12" width="2" height="2" fill="#FFFFFF" opacity="0.3" />
      </>
    case 'pickle_slice':
      return <>
        <rect x="10" y="10" width="12" height="12" rx="6" fill="#558833" />
        <rect x="12" y="12" width="8" height="8" fill="#669944" />
        <rect x="14" y="14" width="2" height="2" fill="#88BB66" />
        <rect x="17" y="13" width="1" height="1" fill="#88BB66" />
        <rect x="13" y="17" width="1" height="1" fill="#88BB66" />
        <rect x="16" y="16" width="2" height="2" fill="#88BB66" opacity="0.5" />
      </>
    case 'salt_shaker':
      return <>
        <rect x="11" y="10" width="10" height="16" fill="#CCCCCC" />
        <rect x="11" y="6" width="10" height="6" fill="#AAAAAA" />
        <rect x="13" y="4" width="6" height="4" fill="#999999" />
        <rect x="13" y="6" width="2" height="1" fill="#444" />
        <rect x="17" y="6" width="2" height="1" fill="#444" />
        <rect x="15" y="7" width="2" height="1" fill="#444" />
        <rect x="13" y="28" width="2" height="2" fill="#FFFFFF" opacity="0.5" />
        <rect x="17" y="29" width="1" height="1" fill="#FFFFFF" opacity="0.5" />
      </>
    case 'bbq_drizzle':
      return <>
        <rect x="10" y="4" width="12" height="16" fill="#662200" />
        <rect x="12" y="2" width="8" height="4" fill="#884400" />
        <rect x="14" y="0" width="4" height="3" fill="#553300" />
        <rect x="13" y="20" width="6" height="4" fill="#882200" />
        <rect x="14" y="24" width="4" height="3" fill="#AA3300" />
        <rect x="15" y="27" width="2" height="2" fill="#CC4400" />
      </>
    case 'bread_crust':
      return <>
        <rect x="8" y="12" width="16" height="8" fill="#BB8844" />
        <rect x="8" y="10" width="16" height="4" fill="#CC9955" rx="2" />
        <rect x="10" y="16" width="12" height="2" fill="#DDAA66" opacity="0.4" />
        <rect x="6" y="14" width="4" height="4" fill="#AA7733" />
      </>
    case 'hot_sauce_drop':
      return <>
        <rect x="14" y="8" width="4" height="4" fill="#FF2200" />
        <rect x="13" y="12" width="6" height="6" fill="#FF3300" />
        <rect x="12" y="16" width="8" height="6" fill="#EE2200" />
        <rect x="14" y="22" width="4" height="4" fill="#DD1100" />
        <rect x="15" y="26" width="2" height="2" fill="#CC0000" />
        <rect x="15" y="10" width="2" height="2" fill="#FF6644" opacity="0.6" />
      </>
    case 'cheese_slice':
      return <>
        <rect x="6" y="12" width="20" height="8" fill="#FFCC00" />
        <rect x="6" y="10" width="20" height="4" fill="#FFDD33" />
        <rect x="10" y="13" width="3" height="3" rx="1" fill="#FFEE66" />
        <rect x="18" y="14" width="2" height="2" rx="1" fill="#FFEE66" />
        <rect x="14" y="16" width="2" height="2" rx="1" fill="#FFEE66" />
      </>

    // ── UNCOMMON ──
    case 'jalapeno_stick':
      return <>
        <rect x="12" y="4" width="8" height="20" fill="#228800" />
        <rect x="12" y="4" width="8" height="4" fill="#33AA00" />
        <rect x="14" y="2" width="4" height="4" fill="#44BB00" />
        <rect x="15" y="0" width="2" height="3" fill="#55CC00" />
        <rect x="14" y="8" width="2" height="2" fill="#44AA00" opacity="0.5" />
        <rect x="17" y="12" width="2" height="2" fill="#44AA00" opacity="0.5" />
        <rect x="13" y="18" width="2" height="2" fill="#44AA00" opacity="0.5" />
      </>
    case 'grease_splash':
      return <>
        <rect x="8" y="14" width="16" height="8" fill="#887722" opacity="0.7" />
        <rect x="6" y="12" width="6" height="4" fill="#AA9933" opacity="0.5" />
        <rect x="20" y="10" width="6" height="6" fill="#AA9933" opacity="0.5" />
        <rect x="12" y="8" width="8" height="4" fill="#998822" opacity="0.6" />
        <rect x="10" y="20" width="4" height="4" fill="#776611" opacity="0.4" />
        <rect x="18" y="18" width="4" height="6" fill="#776611" opacity="0.4" />
        <rect x="14" y="16" width="4" height="2" fill="#BBAA44" opacity="0.8" />
      </>
    case 'sauerkraut_wrap':
      return <>
        <rect x="8" y="8" width="16" height="16" fill="#88AA44" />
        <rect x="10" y="10" width="12" height="12" fill="#99BB55" />
        <rect x="12" y="12" width="8" height="8" fill="#AACC66" />
        <rect x="14" y="14" width="4" height="4" fill="#BBDD77" />
        <rect x="8" y="8" width="2" height="16" fill="#779933" />
      </>
    case 'curry_powder_bomb':
      return <>
        <rect x="10" y="10" width="12" height="12" rx="6" fill="#CC8800" />
        <rect x="12" y="8" width="8" height="4" fill="#DDAA00" />
        <rect x="14" y="6" width="4" height="4" fill="#AA6600" />
        <rect x="6" y="12" width="4" height="3" fill="#FFCC00" opacity="0.4" />
        <rect x="22" y="14" width="4" height="3" fill="#FFCC00" opacity="0.4" />
        <rect x="8" y="22" width="3" height="3" fill="#FFCC00" opacity="0.3" />
        <rect x="20" y="20" width="4" height="4" fill="#FFCC00" opacity="0.3" />
      </>
    case 'grill_tongs':
      return <>
        <rect x="10" y="2" width="3" height="18" fill="#888888" />
        <rect x="19" y="2" width="3" height="18" fill="#888888" />
        <rect x="12" y="18" width="8" height="4" fill="#777777" />
        <rect x="10" y="20" width="3" height="8" fill="#666666" />
        <rect x="19" y="20" width="3" height="8" fill="#666666" />
        <rect x="8" y="26" width="5" height="2" fill="#555555" />
        <rect x="19" y="26" width="5" height="2" fill="#555555" />
      </>
    case 'smoked_paprika':
      return <>
        <rect x="11" y="6" width="10" height="18" fill="#BB3300" />
        <rect x="13" y="4" width="6" height="4" fill="#993300" />
        <rect x="14" y="2" width="4" height="4" fill="#772200" />
        <rect x="13" y="10" width="6" height="2" fill="#DD5522" opacity="0.5" />
        <rect x="13" y="16" width="6" height="2" fill="#DD5522" opacity="0.5" />
        <rect x="8" y="8" width="3" height="3" fill="#FF6633" opacity="0.3" />
        <rect x="21" y="12" width="3" height="3" fill="#FF6633" opacity="0.3" />
      </>
    case 'pretzel_armor':
      return <>
        <rect x="8" y="8" width="6" height="8" rx="3" fill="#AA7733" />
        <rect x="18" y="8" width="6" height="8" rx="3" fill="#AA7733" />
        <rect x="12" y="12" width="8" height="4" fill="#BB8844" />
        <rect x="10" y="16" width="12" height="6" fill="#AA7733" />
        <rect x="12" y="20" width="8" height="4" rx="2" fill="#AA7733" />
        <rect x="14" y="10" width="4" height="2" fill="#CCAA55" opacity="0.6" />
        <rect x="10" y="14" width="2" height="2" fill="#FFFFFF" opacity="0.4" />
        <rect x="20" y="14" width="2" height="2" fill="#FFFFFF" opacity="0.4" />
      </>
    case 'energy_drink':
      return <>
        <rect x="10" y="4" width="12" height="24" fill="#111111" />
        <rect x="10" y="4" width="12" height="4" fill="#444444" />
        <rect x="12" y="2" width="8" height="4" fill="#555555" />
        <rect x="12" y="10" width="8" height="10" fill="#00CC44" />
        <rect x="14" y="12" width="4" height="6" fill="#00FF55" opacity="0.5" />
        <rect x="13" y="22" width="6" height="2" fill="#00AA33" opacity="0.4" />
      </>
    case 'mayo_bomb':
      return <>
        <rect x="10" y="10" width="12" height="12" rx="6" fill="#EEEECC" />
        <rect x="12" y="8" width="8" height="4" fill="#FFFFDD" />
        <rect x="14" y="6" width="4" height="4" fill="#DDDDBB" />
        <rect x="14" y="14" width="4" height="4" fill="#FFFFFF" opacity="0.5" />
        <rect x="6" y="14" width="4" height="3" fill="#EEEECC" opacity="0.4" />
        <rect x="22" y="12" width="4" height="4" fill="#EEEECC" opacity="0.4" />
      </>
    case 'bratwurst_band_aid':
      return <>
        <rect x="6" y="12" width="20" height="8" fill="#DDBB88" />
        <rect x="12" y="14" width="8" height="4" fill="#EEEEEE" />
        <rect x="14" y="15" width="4" height="2" fill="#FF4444" opacity="0.3" />
        <rect x="6" y="12" width="4" height="8" fill="#CCAA77" />
        <rect x="22" y="12" width="4" height="8" fill="#CCAA77" />
      </>
    case 'ghost_pepper':
      return <>
        <rect x="12" y="6" width="8" height="16" fill="#FF4400" />
        <rect x="14" y="4" width="4" height="4" fill="#FF6622" />
        <rect x="15" y="2" width="2" height="4" fill="#44AA00" />
        <rect x="10" y="10" width="4" height="8" fill="#EE3300" />
        <rect x="18" y="8" width="4" height="10" fill="#EE3300" />
        <rect x="14" y="22" width="4" height="4" fill="#DD2200" />
        <rect x="15" y="26" width="2" height="2" fill="#CC1100" />
        <rect x="14" y="10" width="2" height="2" fill="#FFFFFF" opacity="0.3" />
      </>
    case 'vinegar_splash':
      return <>
        <rect x="11" y="4" width="10" height="20" fill="#336622" />
        <rect x="13" y="2" width="6" height="4" fill="#225511" />
        <rect x="14" y="0" width="4" height="3" fill="#224400" />
        <rect x="13" y="8" width="6" height="2" fill="#448833" opacity="0.5" />
        <rect x="14" y="24" width="4" height="4" fill="#448833" />
        <rect x="15" y="28" width="2" height="2" fill="#55AA44" />
      </>
    case 'charcoal_rub':
      return <>
        <rect x="10" y="8" width="12" height="16" fill="#222222" />
        <rect x="8" y="10" width="4" height="4" fill="#333333" />
        <rect x="20" y="12" width="4" height="4" fill="#333333" />
        <rect x="12" y="10" width="8" height="2" fill="#444444" />
        <rect x="14" y="14" width="4" height="4" fill="#FF4400" opacity="0.4" />
        <rect x="12" y="20" width="8" height="2" fill="#FF2200" opacity="0.3" />
      </>
    case 'soda_can_grenade':
      return <>
        <rect x="10" y="6" width="12" height="20" fill="#CC0000" />
        <rect x="10" y="6" width="12" height="4" fill="#AAAAAA" />
        <rect x="14" y="4" width="4" height="4" fill="#888888" />
        <rect x="18" y="2" width="4" height="4" fill="#777777" />
        <rect x="12" y="12" width="8" height="4" fill="#EE2222" opacity="0.5" />
        <rect x="12" y="20" width="8" height="2" fill="#BB0000" />
      </>

    // ── RARE ──
    case 'golden_bratwurst':
      return <>
        <rect x="8" y="10" width="16" height="8" rx="4" fill="#FFD700" />
        <rect x="10" y="12" width="12" height="4" fill="#FFEE44" opacity="0.5" />
        <rect x="6" y="12" width="4" height="4" fill="#FFD700" />
        <rect x="22" y="12" width="4" height="4" fill="#FFD700" />
        <rect x="12" y="8" width="8" height="2" fill="#FFEE88" opacity="0.4" />
        <rect x="14" y="6" width="4" height="2" fill="#FFEE88" opacity="0.3" />
      </>
    case 'forbidden_condiment':
      return <>
        <rect x="10" y="4" width="12" height="20" fill="#440066" />
        <rect x="12" y="2" width="8" height="4" fill="#330055" />
        <rect x="14" y="0" width="4" height="3" fill="#220044" />
        <rect x="12" y="8" width="8" height="4" fill="#660088" opacity="0.5" />
        <rect x="14" y="14" width="4" height="4" fill="#8800BB" opacity="0.4" />
        <rect x="14" y="24" width="4" height="4" fill="#660088" />
        <rect x="15" y="28" width="2" height="2" fill="#8800BB" />
      </>
    case 'diamond_skewer':
      return <>
        <rect x="15" y="0" width="2" height="28" fill="#AAAAAA" />
        <rect x="12" y="4" width="8" height="8" fill="#88DDFF" style={{ transform: 'rotate(45deg)', transformOrigin: '16px 8px' }} />
        <rect x="13" y="5" width="6" height="6" fill="#AAEEFF" opacity="0.6" />
        <rect x="14" y="6" width="4" height="4" fill="#CCFFFF" opacity="0.4" />
        <rect x="14" y="28" width="4" height="2" fill="#888888" />
      </>
    case 'truffle_oil':
      return <>
        <rect x="11" y="6" width="10" height="18" fill="#332200" />
        <rect x="13" y="4" width="6" height="4" fill="#221100" />
        <rect x="14" y="2" width="4" height="4" fill="#443322" />
        <rect x="15" y="0" width="2" height="3" fill="#554433" />
        <rect x="13" y="10" width="6" height="2" fill="#FFD700" opacity="0.4" />
        <rect x="13" y="16" width="6" height="2" fill="#FFD700" opacity="0.3" />
        <rect x="14" y="12" width="4" height="8" fill="#FFD700" opacity="0.15" />
      </>
    case 'titanium_tray':
      return <>
        <rect x="4" y="12" width="24" height="4" fill="#8888AA" />
        <rect x="6" y="10" width="20" height="4" fill="#9999BB" />
        <rect x="4" y="16" width="2" height="6" fill="#7777AA" />
        <rect x="26" y="16" width="2" height="6" fill="#7777AA" />
        <rect x="8" y="14" width="16" height="2" fill="#AAAACC" opacity="0.5" />
        <rect x="10" y="11" width="4" height="1" fill="#CCCCEE" opacity="0.4" />
      </>
    case 'dragon_hot_sauce':
      return <>
        <rect x="11" y="6" width="10" height="18" fill="#880000" />
        <rect x="13" y="4" width="6" height="4" fill="#660000" />
        <rect x="14" y="2" width="4" height="4" fill="#AA0000" />
        <rect x="12" y="0" width="2" height="4" fill="#FF4400" />
        <rect x="18" y="0" width="2" height="4" fill="#FF4400" />
        <rect x="15" y="0" width="2" height="2" fill="#FF6600" />
        <rect x="13" y="10" width="6" height="2" fill="#FF2200" opacity="0.5" />
        <rect x="14" y="24" width="4" height="4" fill="#FF2200" />
      </>
    case 'wagyu_wrap':
      return <>
        <rect x="6" y="8" width="20" height="16" fill="#CC4455" />
        <rect x="8" y="10" width="16" height="12" fill="#DD6677" />
        <rect x="10" y="12" width="12" height="8" fill="#EE8899" />
        <rect x="8" y="10" width="4" height="2" fill="#FFFFFF" opacity="0.3" />
        <rect x="14" y="14" width="6" height="2" fill="#FFFFFF" opacity="0.2" />
        <rect x="12" y="18" width="4" height="2" fill="#FFFFFF" opacity="0.15" />
      </>
    case 'nitro_coffee':
      return <>
        <rect x="10" y="4" width="12" height="22" fill="#1a0a00" />
        <rect x="10" y="4" width="12" height="4" fill="#333333" />
        <rect x="12" y="2" width="8" height="4" fill="#444444" />
        <rect x="12" y="10" width="8" height="6" fill="#4488FF" />
        <rect x="14" y="12" width="4" height="2" fill="#66AAFF" opacity="0.6" />
        <rect x="12" y="18" width="8" height="4" fill="#2266DD" opacity="0.5" />
        <rect x="22" y="12" width="4" height="6" fill="#88CCFF" opacity="0.3" />
      </>
    case 'ancient_marinade':
      return <>
        <rect x="10" y="6" width="12" height="18" fill="#554422" />
        <rect x="12" y="4" width="8" height="4" fill="#443311" />
        <rect x="14" y="2" width="4" height="4" fill="#332200" />
        <rect x="12" y="8" width="8" height="2" fill="#FFD700" opacity="0.3" />
        <rect x="13" y="12" width="6" height="6" fill="#FFD700" opacity="0.2" />
        <rect x="8" y="10" width="2" height="10" fill="#FFD700" opacity="0.15" />
        <rect x="22" y="10" width="2" height="10" fill="#FFD700" opacity="0.15" />
      </>
    case 'sausage_kings_crown':
      return <>
        <rect x="6" y="14" width="20" height="8" fill="#FFD700" />
        <rect x="8" y="12" width="16" height="4" fill="#FFEE44" />
        <rect x="8" y="8" width="3" height="6" fill="#FFD700" />
        <rect x="14" y="6" width="4" height="8" fill="#FFD700" />
        <rect x="21" y="8" width="3" height="6" fill="#FFD700" />
        <rect x="9" y="7" width="1" height="2" fill="#FF4444" />
        <rect x="15" y="5" width="2" height="2" fill="#4488FF" />
        <rect x="22" y="7" width="1" height="2" fill="#44CC44" />
        <rect x="8" y="18" width="16" height="2" fill="#CCAA00" opacity="0.5" />
      </>
    case 'meteor_pepper':
      return <>
        <rect x="12" y="8" width="10" height="10" rx="5" fill="#FF4400" />
        <rect x="14" y="10" width="6" height="6" fill="#FF6622" />
        <rect x="16" y="12" width="2" height="2" fill="#FFAA44" />
        <rect x="8" y="6" width="4" height="3" fill="#FF8844" opacity="0.4" />
        <rect x="22" y="10" width="4" height="3" fill="#FF8844" opacity="0.4" />
        <rect x="10" y="18" width="4" height="4" fill="#FF6633" opacity="0.3" />
        <rect x="20" y="16" width="4" height="4" fill="#FF6633" opacity="0.3" />
        <rect x="14" y="18" width="4" height="4" fill="#FF4400" opacity="0.5" />
        <rect x="15" y="22" width="2" height="4" fill="#FF2200" opacity="0.4" />
      </>
    case 'elixir_of_grill':
      return <>
        <rect x="12" y="10" width="8" height="16" fill="#884400" />
        <rect x="14" y="8" width="4" height="4" fill="#663300" />
        <rect x="15" y="6" width="2" height="4" fill="#552200" />
        <rect x="14" y="14" width="4" height="8" fill="#FF6600" opacity="0.4" />
        <rect x="15" y="12" width="2" height="2" fill="#FF8800" opacity="0.6" />
        <rect x="10" y="6" width="2" height="4" fill="#FF4400" opacity="0.3" />
        <rect x="20" y="4" width="2" height="4" fill="#FF4400" opacity="0.3" />
        <rect x="8" y="2" width="2" height="2" fill="#FF6600" opacity="0.2" />
      </>

    default:
      // Fallback: generic potion
      return <>
        <rect x="12" y="8" width="8" height="16" fill={m} />
        <rect x="14" y="6" width="4" height="4" fill={m} opacity="0.7" />
        <rect x="15" y="4" width="2" height="4" fill={a} />
        <rect x="14" y="14" width="4" height="4" fill={a} opacity="0.4" />
      </>
  }
}

interface Props {
  itemKey: string
  rarity: ItemRarity
  size?: number
}

export function ItemIcon({ itemKey, rarity, size = 24 }: Props) {
  const colors = RARITY_COLORS[rarity]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
      <rect width="32" height="32" fill={colors.bg} />
      {getItemPixels(itemKey, colors.main, colors.accent)}
    </svg>
  )
}
