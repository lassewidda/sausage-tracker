export function ExerciseCreature({ creature, b, a, d, bg }: { creature: number; b: string; a: string; d: string; bg: string }): JSX.Element {
  return (
    <>
      {creature === 0 && (
        // RUNNER — humanoid in running pose with sneakers
        <>
          {/* Head */}
          <rect x="14" y="3" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="15" y="5" width="1" height="1" fill="#000" />
          <rect x="17" y="5" width="1" height="1" fill="#000" />
          <rect x="15" y="5" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Hair / headband */}
          <rect x="14" y="3" width="5" height="1" fill={a} />
          <rect x="13" y="4" width="1" height="1" fill={a} />
          {/* Neck */}
          <rect x="15" y="8" width="3" height="1" fill={b} />
          {/* Torso — leaning forward */}
          <rect x="14" y="9" width="5" height="6" fill={a} />
          <rect x="13" y="10" width="1" height="4" fill={a} />
          {/* Number on shirt */}
          <rect x="15" y="11" width="3" height="1" fill={d} />
          <rect x="16" y="10" width="1" height="3" fill={d} />
          {/* Back arm (behind) */}
          <rect x="19" y="10" width="1" height="2" fill={b} />
          <rect x="20" y="11" width="1" height="2" fill={b} />
          <rect x="21" y="12" width="1" height="1" fill={b} />
          {/* Front arm (forward) */}
          <rect x="13" y="10" width="1" height="1" fill={b} />
          <rect x="12" y="9" width="1" height="2" fill={b} />
          <rect x="11" y="8" width="1" height="2" fill={b} />
          <rect x="10" y="8" width="1" height="1" fill={b} />
          {/* Shorts */}
          <rect x="14" y="15" width="5" height="3" fill={d} />
          {/* Back leg (behind, extended) */}
          <rect x="18" y="18" width="2" height="3" fill={b} />
          <rect x="19" y="21" width="2" height="2" fill={b} />
          <rect x="20" y="23" width="2" height="2" fill={b} />
          {/* Back sneaker */}
          <rect x="20" y="25" width="3" height="2" fill={a} />
          <rect x="22" y="26" width="1" height="1" fill="#fff" />
          {/* Front leg (forward, bent) */}
          <rect x="14" y="18" width="2" height="3" fill={b} />
          <rect x="12" y="21" width="2" height="2" fill={b} />
          <rect x="10" y="23" width="2" height="2" fill={b} />
          {/* Front sneaker */}
          <rect x="8" y="25" width="3" height="2" fill={a} />
          <rect x="8" y="26" width="1" height="1" fill="#fff" />
          {/* Motion lines */}
          <rect x="23" y="10" width="2" height="1" fill={a} opacity="0.3" />
          <rect x="24" y="13" width="3" height="1" fill={a} opacity="0.2" />
          <rect x="25" y="16" width="2" height="1" fill={a} opacity="0.15" />
        </>
      )}

      {creature === 1 && (
        // WEIGHTLIFTER — muscular figure holding barbell overhead
        <>
          {/* Head */}
          <rect x="13" y="5" width="6" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="7" width="2" height="1" fill="#000" />
          <rect x="17" y="7" width="2" height="1" fill="#000" />
          <rect x="14" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          <rect x="17" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Grimace mouth */}
          <rect x="14" y="9" width="4" height="1" fill="#000" />
          {/* Neck - thick */}
          <rect x="14" y="10" width="4" height="1" fill={b} />
          {/* Torso — broad */}
          <rect x="11" y="11" width="10" height="7" fill={a} />
          <rect x="10" y="12" width="1" height="5" fill={a} />
          <rect x="21" y="12" width="1" height="5" fill={a} />
          {/* Belt */}
          <rect x="11" y="17" width="10" height="1" fill={d} />
          {/* Arms raised — left */}
          <rect x="10" y="11" width="1" height="1" fill={b} />
          <rect x="9" y="8" width="2" height="3" fill={b} />
          <rect x="8" y="6" width="2" height="3" fill={b} />
          {/* Arms raised — right */}
          <rect x="21" y="11" width="1" height="1" fill={b} />
          <rect x="21" y="8" width="2" height="3" fill={b} />
          <rect x="22" y="6" width="2" height="3" fill={b} />
          {/* Barbell bar */}
          <rect x="4" y="5" width="24" height="1" fill={d} />
          <rect x="4" y="4" width="24" height="1" fill="#aaa" />
          {/* Barbell plates — left */}
          <rect x="2" y="2" width="3" height="5" fill={a} />
          <rect x="0" y="3" width="2" height="3" fill={a} opacity="0.7" />
          {/* Barbell plates — right */}
          <rect x="27" y="2" width="3" height="5" fill={a} />
          <rect x="30" y="3" width="2" height="3" fill={a} opacity="0.7" />
          {/* Legs */}
          <rect x="12" y="18" width="3" height="6" fill={b} />
          <rect x="17" y="18" width="3" height="6" fill={b} />
          {/* Shoes */}
          <rect x="11" y="24" width="4" height="2" fill={d} />
          <rect x="17" y="24" width="4" height="2" fill={d} />
          {/* Sweat drops */}
          <rect x="10" y="6" width="1" height="1" fill="#68c8ff" opacity="0.6" />
          <rect x="22" y="8" width="1" height="1" fill="#68c8ff" opacity="0.6" />
        </>
      )}

      {creature === 2 && (
        // CYCLIST — figure on bicycle, leaning forward
        <>
          {/* Head with helmet */}
          <rect x="10" y="5" width="5" height="4" fill={b} />
          <rect x="9" y="4" width="7" height="2" fill={a} />
          <rect x="9" y="3" width="6" height="1" fill={a} />
          {/* Visor */}
          <rect x="9" y="6" width="1" height="1" fill={d} />
          {/* Eyes */}
          <rect x="11" y="7" width="1" height="1" fill="#000" />
          <rect x="13" y="7" width="1" height="1" fill="#000" />
          {/* Torso — leaning */}
          <rect x="12" y="9" width="4" height="5" fill={a} />
          <rect x="11" y="10" width="1" height="3" fill={a} />
          {/* Arms to handlebars */}
          <rect x="10" y="9" width="2" height="1" fill={b} />
          <rect x="8" y="10" width="3" height="1" fill={b} />
          <rect x="7" y="11" width="2" height="1" fill={b} />
          {/* Handlebars */}
          <rect x="6" y="11" width="2" height="1" fill="#aaa" />
          <rect x="5" y="12" width="1" height="1" fill="#aaa" />
          {/* Back leg (on pedal) */}
          <rect x="16" y="14" width="2" height="3" fill={b} />
          <rect x="17" y="17" width="2" height="2" fill={b} />
          {/* Front leg (on pedal) */}
          <rect x="12" y="14" width="2" height="3" fill={b} />
          <rect x="11" y="17" width="2" height="2" fill={b} />
          {/* Shoes */}
          <rect x="17" y="19" width="2" height="1" fill={d} />
          <rect x="10" y="19" width="2" height="1" fill={d} />
          {/* Frame */}
          <rect x="8" y="16" width="12" height="1" fill={d} />
          <rect x="7" y="13" width="1" height="4" fill={d} />
          <rect x="19" y="14" width="1" height="3" fill={d} />
          {/* Seat */}
          <rect x="18" y="13" width="3" height="1" fill="#333" />
          {/* Rear wheel */}
          <rect x="19" y="20" width="6" height="1" fill="#555" />
          <rect x="20" y="18" width="1" height="1" fill="#555" />
          <rect x="25" y="18" width="1" height="1" fill="#555" />
          <rect x="19" y="21" width="1" height="3" fill="#555" />
          <rect x="25" y="21" width="1" height="3" fill="#555" />
          <rect x="20" y="24" width="5" height="1" fill="#555" />
          <rect x="21" y="19" width="4" height="1" fill={a} opacity="0.3" />
          {/* Front wheel */}
          <rect x="2" y="20" width="6" height="1" fill="#555" />
          <rect x="3" y="18" width="1" height="1" fill="#555" />
          <rect x="7" y="18" width="1" height="1" fill="#555" />
          <rect x="1" y="21" width="1" height="3" fill="#555" />
          <rect x="8" y="21" width="1" height="3" fill="#555" />
          <rect x="2" y="24" width="6" height="1" fill="#555" />
          {/* Spokes */}
          <rect x="5" y="21" width="1" height="2" fill="#888" />
          <rect x="22" y="21" width="1" height="2" fill="#888" />
        </>
      )}

      {creature === 3 && (
        // BOXER — fighting stance with boxing gloves
        <>
          {/* Head */}
          <rect x="13" y="4" width="6" height="6" fill={b} />
          {/* Eyes — intense */}
          <rect x="14" y="6" width="2" height="2" fill="#000" />
          <rect x="17" y="6" width="2" height="2" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#fff" />
          <rect x="17" y="6" width="1" height="1" fill="#fff" />
          {/* Mouth guard */}
          <rect x="14" y="9" width="4" height="1" fill="#fff" />
          {/* Headgear */}
          <rect x="12" y="4" width="8" height="1" fill={a} />
          <rect x="12" y="5" width="1" height="4" fill={a} />
          <rect x="19" y="5" width="1" height="4" fill={a} />
          {/* Neck */}
          <rect x="14" y="10" width="4" height="1" fill={b} />
          {/* Torso */}
          <rect x="12" y="11" width="8" height="7" fill={a} />
          <rect x="11" y="12" width="1" height="5" fill={a} />
          {/* Shorts */}
          <rect x="12" y="18" width="8" height="3" fill={d} />
          <rect x="15" y="18" width="2" height="3" fill="#fff" opacity="0.3" />
          {/* Left arm — guard up, glove */}
          <rect x="10" y="11" width="2" height="2" fill={b} />
          <rect x="8" y="9" width="2" height="3" fill={b} />
          <rect x="6" y="7" width="3" height="3" fill={a} />
          <rect x="5" y="7" width="1" height="3" fill={a} opacity="0.7" />
          {/* Right arm — jab forward, glove */}
          <rect x="20" y="11" width="2" height="2" fill={b} />
          <rect x="22" y="10" width="2" height="2" fill={b} />
          <rect x="24" y="9" width="3" height="3" fill={a} />
          <rect x="27" y="9" width="1" height="3" fill={a} opacity="0.7" />
          {/* Glove lacing */}
          <rect x="7" y="8" width="1" height="1" fill="#fff" />
          <rect x="25" y="10" width="1" height="1" fill="#fff" />
          {/* Legs — stance */}
          <rect x="12" y="21" width="3" height="5" fill={b} />
          <rect x="17" y="21" width="3" height="5" fill={b} />
          {/* Boots */}
          <rect x="11" y="26" width="4" height="2" fill={d} />
          <rect x="17" y="26" width="4" height="2" fill={d} />
          <rect x="11" y="26" width="4" height="1" fill="#fff" opacity="0.2" />
          <rect x="17" y="26" width="4" height="1" fill="#fff" opacity="0.2" />
        </>
      )}

      {creature === 4 && (
        // SWIMMER — horizontal figure mid-stroke with goggles
        <>
          {/* Head */}
          <rect x="4" y="11" width="5" height="5" fill={b} />
          {/* Swim cap */}
          <rect x="3" y="11" width="6" height="2" fill={a} />
          <rect x="4" y="10" width="4" height="1" fill={a} />
          {/* Goggles */}
          <rect x="4" y="13" width="2" height="1" fill={d} />
          <rect x="7" y="13" width="2" height="1" fill={d} />
          <rect x="6" y="13" width="1" height="1" fill="#333" />
          {/* Eyes behind goggles */}
          <rect x="5" y="13" width="1" height="1" fill="#000" />
          <rect x="7" y="13" width="1" height="1" fill="#000" />
          {/* Mouth */}
          <rect x="4" y="15" width="2" height="1" fill="#000" />
          {/* Body — horizontal torso */}
          <rect x="9" y="12" width="14" height="4" fill={a} />
          <rect x="8" y="13" width="1" height="2" fill={a} />
          {/* Swimsuit stripe */}
          <rect x="9" y="14" width="14" height="1" fill={d} opacity="0.4" />
          {/* Front arm — reaching forward */}
          <rect x="2" y="9" width="2" height="2" fill={b} />
          <rect x="1" y="7" width="2" height="3" fill={b} />
          <rect x="0" y="6" width="2" height="2" fill={b} />
          {/* Back arm — pulling */}
          <rect x="15" y="16" width="2" height="2" fill={b} />
          <rect x="16" y="18" width="2" height="2" fill={b} />
          <rect x="17" y="20" width="2" height="1" fill={b} />
          {/* Legs — kick */}
          <rect x="23" y="12" width="3" height="3" fill={b} />
          <rect x="26" y="11" width="2" height="2" fill={b} />
          <rect x="28" y="10" width="2" height="1" fill={b} />
          <rect x="26" y="14" width="2" height="2" fill={b} />
          <rect x="28" y="15" width="2" height="1" fill={b} />
          {/* Feet */}
          <rect x="29" y="9" width="2" height="1" fill={d} />
          <rect x="29" y="15" width="2" height="1" fill={d} />
          {/* Water ripples */}
          <rect x="2" y="17" width="4" height="1" fill="#68c8ff" opacity="0.3" />
          <rect x="8" y="18" width="6" height="1" fill="#68c8ff" opacity="0.25" />
          <rect x="16" y="17" width="5" height="1" fill="#68c8ff" opacity="0.2" />
          <rect x="0" y="19" width="3" height="1" fill="#68c8ff" opacity="0.15" />
          <rect x="22" y="18" width="4" height="1" fill="#68c8ff" opacity="0.2" />
        </>
      )}

      {creature === 5 && (
        // YOGA MASTER — tree pose, one leg up, arms overhead
        <>
          {/* Head */}
          <rect x="14" y="3" width="5" height="5" fill={b} />
          {/* Eyes — serene, closed */}
          <rect x="15" y="5" width="2" height="1" fill="#000" />
          <rect x="17" y="5" width="2" height="1" fill="#000" />
          {/* Peaceful smile */}
          <rect x="15" y="7" width="3" height="1" fill="#000" opacity="0.4" />
          {/* Hair bun */}
          <rect x="15" y="1" width="3" height="2" fill="#333" />
          <rect x="14" y="2" width="5" height="1" fill="#333" />
          {/* Neck */}
          <rect x="15" y="8" width="3" height="1" fill={b} />
          {/* Arms raised overhead — together */}
          <rect x="14" y="9" width="2" height="1" fill={b} />
          <rect x="17" y="9" width="2" height="1" fill={b} />
          <rect x="13" y="7" width="1" height="2" fill={b} />
          <rect x="19" y="7" width="1" height="2" fill={b} />
          <rect x="13" y="4" width="1" height="3" fill={b} />
          <rect x="19" y="4" width="1" height="3" fill={b} />
          <rect x="14" y="2" width="1" height="2" fill={b} />
          <rect x="18" y="2" width="1" height="2" fill={b} />
          {/* Hands touching */}
          <rect x="15" y="1" width="1" height="1" fill={b} />
          <rect x="17" y="1" width="1" height="1" fill={b} />
          {/* Torso */}
          <rect x="14" y="10" width="5" height="7" fill={a} />
          <rect x="13" y="11" width="1" height="5" fill={a} />
          {/* Belt/sash */}
          <rect x="13" y="16" width="6" height="1" fill={d} />
          {/* Standing leg — straight */}
          <rect x="14" y="17" width="3" height="7" fill={b} />
          {/* Foot */}
          <rect x="13" y="24" width="4" height="2" fill={d} />
          {/* Bent leg — foot on inner thigh */}
          <rect x="19" y="17" width="2" height="2" fill={b} />
          <rect x="20" y="19" width="2" height="2" fill={b} />
          <rect x="19" y="21" width="2" height="1" fill={b} />
          <rect x="18" y="20" width="1" height="2" fill={b} />
          {/* Glow / aura */}
          <rect x="11" y="9" width="1" height="1" fill={a} opacity="0.2" />
          <rect x="21" y="9" width="1" height="1" fill={a} opacity="0.2" />
          <rect x="12" y="6" width="1" height="1" fill={a} opacity="0.15" />
          <rect x="20" y="6" width="1" height="1" fill={a} opacity="0.15" />
        </>
      )}

      {creature === 6 && (
        // MARTIAL ARTIST — high kick with gi and belt
        <>
          {/* Head */}
          <rect x="12" y="4" width="5" height="5" fill={b} />
          {/* Eyes — focused */}
          <rect x="13" y="6" width="1" height="1" fill="#000" />
          <rect x="15" y="6" width="1" height="1" fill="#000" />
          <rect x="13" y="6" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Headband */}
          <rect x="11" y="4" width="7" height="1" fill={d} />
          <rect x="18" y="5" width="2" height="1" fill={d} />
          <rect x="19" y="6" width="1" height="1" fill={d} />
          {/* Neck */}
          <rect x="13" y="9" width="3" height="1" fill={b} />
          {/* Gi torso */}
          <rect x="11" y="10" width="7" height="7" fill="#fff" />
          <rect x="10" y="11" width="1" height="5" fill="#fff" />
          {/* Gi lapel */}
          <rect x="13" y="10" width="3" height="3" fill={a} opacity="0.3" />
          {/* Belt */}
          <rect x="10" y="16" width="8" height="1" fill={d} />
          <rect x="15" y="17" width="3" height="1" fill={d} />
          {/* Left arm — guard */}
          <rect x="8" y="11" width="2" height="2" fill={b} />
          <rect x="6" y="10" width="2" height="2" fill={b} />
          <rect x="5" y="9" width="2" height="2" fill="#fff" />
          {/* Standing leg */}
          <rect x="11" y="17" width="3" height="6" fill="#fff" />
          <rect x="10" y="23" width="4" height="2" fill={a} />
          {/* Kicking leg — high kick right */}
          <rect x="18" y="12" width="2" height="2" fill="#fff" />
          <rect x="20" y="11" width="3" height="2" fill={b} />
          <rect x="23" y="10" width="3" height="2" fill={b} />
          <rect x="26" y="9" width="2" height="2" fill={b} />
          {/* Kicking foot */}
          <rect x="27" y="8" width="2" height="2" fill={a} />
          {/* Impact lines */}
          <rect x="29" y="7" width="2" height="1" fill={a} opacity="0.4" />
          <rect x="30" y="9" width="1" height="1" fill={a} opacity="0.3" />
          <rect x="29" y="11" width="2" height="1" fill={a} opacity="0.2" />
          {/* Right arm balance */}
          <rect x="18" y="13" width="1" height="2" fill={b} />
          <rect x="19" y="14" width="1" height="2" fill={b} />
        </>
      )}

      {creature === 7 && (
        // JUMPER — mid-air jumping jack, arms and legs spread
        <>
          {/* Head */}
          <rect x="14" y="4" width="5" height="5" fill={b} />
          {/* Eyes — excited */}
          <rect x="15" y="6" width="1" height="1" fill="#000" />
          <rect x="17" y="6" width="1" height="1" fill="#000" />
          <rect x="15" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          <rect x="17" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Mouth — open happy */}
          <rect x="15" y="8" width="3" height="1" fill="#000" />
          {/* Sweatband */}
          <rect x="13" y="5" width="7" height="1" fill={a} />
          {/* Neck */}
          <rect x="15" y="9" width="3" height="1" fill={b} />
          {/* Torso */}
          <rect x="13" y="10" width="7" height="6" fill={a} />
          {/* Shorts */}
          <rect x="13" y="16" width="7" height="2" fill={d} />
          {/* Left arm — up and out */}
          <rect x="12" y="10" width="1" height="2" fill={b} />
          <rect x="11" y="9" width="1" height="2" fill={b} />
          <rect x="9" y="7" width="2" height="2" fill={b} />
          <rect x="7" y="5" width="2" height="2" fill={b} />
          <rect x="6" y="4" width="2" height="2" fill={b} />
          {/* Right arm — up and out */}
          <rect x="20" y="10" width="1" height="2" fill={b} />
          <rect x="21" y="9" width="1" height="2" fill={b} />
          <rect x="22" y="7" width="2" height="2" fill={b} />
          <rect x="24" y="5" width="2" height="2" fill={b} />
          <rect x="25" y="4" width="2" height="2" fill={b} />
          {/* Left leg — out */}
          <rect x="13" y="18" width="2" height="2" fill={b} />
          <rect x="11" y="20" width="2" height="2" fill={b} />
          <rect x="9" y="22" width="2" height="2" fill={b} />
          <rect x="7" y="24" width="2" height="2" fill={b} />
          {/* Left shoe */}
          <rect x="6" y="26" width="3" height="2" fill={a} />
          {/* Right leg — out */}
          <rect x="18" y="18" width="2" height="2" fill={b} />
          <rect x="20" y="20" width="2" height="2" fill={b} />
          <rect x="22" y="22" width="2" height="2" fill={b} />
          <rect x="24" y="24" width="2" height="2" fill={b} />
          {/* Right shoe */}
          <rect x="24" y="26" width="3" height="2" fill={a} />
          {/* Star burst effect */}
          <rect x="5" y="3" width="1" height="1" fill={a} opacity="0.5" />
          <rect x="26" y="3" width="1" height="1" fill={a} opacity="0.5" />
        </>
      )}

      {creature === 8 && (
        // CLIMBER — on wall, one hand reaching up
        <>
          {/* Wall / cliff surface */}
          <rect x="0" y="0" width="6" height="32" fill={d} opacity="0.15" />
          <rect x="2" y="5" width="2" height="2" fill={d} opacity="0.25" />
          <rect x="1" y="14" width="3" height="2" fill={d} opacity="0.25" />
          <rect x="3" y="24" width="2" height="2" fill={d} opacity="0.25" />
          {/* Head */}
          <rect x="10" y="6" width="5" height="5" fill={b} />
          {/* Helmet */}
          <rect x="9" y="5" width="7" height="2" fill={a} />
          <rect x="10" y="4" width="5" height="1" fill={a} />
          {/* Eyes — looking up */}
          <rect x="11" y="8" width="1" height="1" fill="#000" />
          <rect x="13" y="8" width="1" height="1" fill="#000" />
          <rect x="11" y="8" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Torso */}
          <rect x="10" y="11" width="6" height="7" fill={a} />
          <rect x="9" y="12" width="1" height="5" fill={a} />
          {/* Harness */}
          <rect x="10" y="17" width="6" height="1" fill={d} />
          <rect x="12" y="13" width="1" height="5" fill={d} opacity="0.4" />
          {/* Reaching arm — up to hold */}
          <rect x="7" y="11" width="2" height="1" fill={b} />
          <rect x="6" y="9" width="2" height="2" fill={b} />
          <rect x="5" y="6" width="2" height="3" fill={b} />
          <rect x="4" y="4" width="2" height="3" fill={b} />
          {/* Hand on hold */}
          <rect x="3" y="3" width="2" height="2" fill={b} />
          <rect x="2" y="4" width="2" height="1" fill={a} opacity="0.5" />
          {/* Lower arm — gripping */}
          <rect x="16" y="13" width="2" height="2" fill={b} />
          <rect x="17" y="15" width="2" height="1" fill={b} />
          {/* Hand on hold */}
          <rect x="5" y="14" width="3" height="2" fill={b} />
          {/* Legs — bent, feet on holds */}
          <rect x="10" y="18" width="3" height="3" fill={b} />
          <rect x="8" y="21" width="3" height="3" fill={b} />
          <rect x="6" y="23" width="3" height="2" fill={b} />
          {/* Foot on hold */}
          <rect x="4" y="24" width="3" height="2" fill={a} />
          {/* Other leg — extended */}
          <rect x="15" y="18" width="2" height="3" fill={b} />
          <rect x="16" y="21" width="2" height="3" fill={b} />
          <rect x="15" y="24" width="3" height="2" fill={a} />
          {/* Rope */}
          <rect x="13" y="18" width="1" height="8" fill="#cc0" opacity="0.4" />
          <rect x="14" y="25" width="1" height="4" fill="#cc0" opacity="0.4" />
        </>
      )}

      {creature === 9 && (
        // SKATER — figure on skateboard, dynamic pose
        <>
          {/* Head */}
          <rect x="12" y="4" width="5" height="5" fill={b} />
          {/* Helmet */}
          <rect x="11" y="3" width="7" height="2" fill={a} />
          <rect x="12" y="2" width="5" height="1" fill={a} />
          {/* Eyes */}
          <rect x="13" y="6" width="1" height="1" fill="#000" />
          <rect x="15" y="6" width="1" height="1" fill="#000" />
          <rect x="13" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Cool grin */}
          <rect x="13" y="8" width="3" height="1" fill="#000" opacity="0.5" />
          {/* Neck */}
          <rect x="13" y="9" width="3" height="1" fill={b} />
          {/* Torso — leaning back */}
          <rect x="12" y="10" width="6" height="6" fill={a} />
          <rect x="11" y="11" width="1" height="4" fill={a} />
          {/* Graphic on shirt */}
          <rect x="13" y="12" width="4" height="2" fill={d} opacity="0.5" />
          {/* Left arm — out for balance */}
          <rect x="9" y="10" width="2" height="2" fill={b} />
          <rect x="7" y="9" width="2" height="2" fill={b} />
          <rect x="5" y="8" width="2" height="2" fill={b} />
          {/* Right arm — back */}
          <rect x="18" y="11" width="2" height="2" fill={b} />
          <rect x="20" y="12" width="2" height="2" fill={b} />
          <rect x="22" y="13" width="1" height="1" fill={b} />
          {/* Baggy pants */}
          <rect x="12" y="16" width="6" height="5" fill={d} />
          <rect x="11" y="17" width="1" height="3" fill={d} />
          {/* Legs */}
          <rect x="12" y="21" width="3" height="2" fill={b} />
          <rect x="16" y="21" width="3" height="2" fill={b} />
          {/* Shoes on board */}
          <rect x="10" y="23" width="4" height="2" fill={a} />
          <rect x="17" y="23" width="4" height="2" fill={a} />
          {/* Skateboard deck */}
          <rect x="7" y="25" width="18" height="2" fill={d} />
          <rect x="6" y="25" width="1" height="1" fill={d} />
          <rect x="25" y="25" width="1" height="1" fill={d} />
          {/* Trucks */}
          <rect x="9" y="27" width="3" height="1" fill="#888" />
          <rect x="19" y="27" width="3" height="1" fill="#888" />
          {/* Wheels */}
          <rect x="8" y="28" width="2" height="2" fill="#aaa" />
          <rect x="12" y="28" width="2" height="2" fill="#aaa" />
          <rect x="19" y="28" width="2" height="2" fill="#aaa" />
          <rect x="22" y="28" width="2" height="2" fill="#aaa" />
        </>
      )}

      {creature === 10 && (
        // GYMNAST — handstand pose
        <>
          {/* Hands on ground */}
          <rect x="12" y="26" width="3" height="2" fill={b} />
          <rect x="18" y="26" width="3" height="2" fill={b} />
          {/* Arms — straight down supporting */}
          <rect x="12" y="22" width="3" height="4" fill={b} />
          <rect x="18" y="22" width="3" height="4" fill={b} />
          {/* Shoulders */}
          <rect x="11" y="20" width="11" height="2" fill={a} />
          {/* Torso — inverted */}
          <rect x="13" y="12" width="7" height="8" fill={a} />
          <rect x="12" y="14" width="1" height="5" fill={a} />
          {/* Belt/waistband */}
          <rect x="13" y="12" width="7" height="1" fill={d} />
          {/* Head — upside down at bottom */}
          <rect x="14" y="22" width="5" height="5" fill={b} />
          {/* Eyes — upside down */}
          <rect x="15" y="25" width="1" height="1" fill="#000" />
          <rect x="17" y="25" width="1" height="1" fill="#000" />
          <rect x="15" y="25" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Mouth */}
          <rect x="15" y="23" width="3" height="1" fill="#000" opacity="0.4" />
          {/* Hair hanging */}
          <rect x="14" y="27" width="5" height="2" fill="#333" />
          <rect x="13" y="28" width="7" height="1" fill="#333" />
          {/* Legs — straight up, split slightly */}
          <rect x="13" y="5" width="3" height="7" fill={b} />
          <rect x="17" y="5" width="3" height="7" fill={b} />
          {/* Pointed toes */}
          <rect x="14" y="3" width="2" height="2" fill={d} />
          <rect x="17" y="3" width="2" height="2" fill={d} />
          <rect x="14" y="2" width="1" height="1" fill={d} />
          <rect x="18" y="2" width="1" height="1" fill={d} />
          {/* Sparkle effects */}
          <rect x="9" y="8" width="1" height="1" fill={a} opacity="0.5" />
          <rect x="23" y="6" width="1" height="1" fill={a} opacity="0.5" />
          <rect x="7" y="14" width="1" height="1" fill={a} opacity="0.3" />
          <rect x="25" y="12" width="1" height="1" fill={a} opacity="0.3" />
          {/* Ground line */}
          <rect x="8" y="28" width="16" height="1" fill={d} opacity="0.2" />
        </>
      )}

      {creature === 11 && (
        // POWERLIFTER — stocky figure in squat with heavy barbell
        <>
          {/* Head — wide */}
          <rect x="12" y="3" width="8" height="6" fill={b} />
          {/* Eyes — strained */}
          <rect x="13" y="5" width="2" height="2" fill="#000" />
          <rect x="17" y="5" width="2" height="2" fill="#000" />
          <rect x="14" y="5" width="1" height="1" fill="#fff" opacity="0.3" />
          <rect x="17" y="5" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Gritted teeth */}
          <rect x="13" y="8" width="6" height="1" fill="#fff" />
          <rect x="14" y="8" width="1" height="1" fill="#000" />
          <rect x="16" y="8" width="1" height="1" fill="#000" />
          <rect x="18" y="8" width="1" height="1" fill="#000" />
          {/* Thick neck */}
          <rect x="13" y="9" width="6" height="2" fill={b} />
          {/* Massive torso */}
          <rect x="9" y="11" width="14" height="6" fill={a} />
          <rect x="8" y="12" width="1" height="4" fill={a} />
          <rect x="23" y="12" width="1" height="4" fill={a} />
          {/* Belt — thick powerlifting belt */}
          <rect x="8" y="16" width="16" height="2" fill={d} />
          <rect x="14" y="16" width="4" height="2" fill={d} />
          {/* Barbell on shoulders */}
          <rect x="2" y="10" width="28" height="1" fill="#aaa" />
          <rect x="2" y="9" width="28" height="1" fill="#ccc" />
          {/* Plates — left */}
          <rect x="0" y="6" width="3" height="7" fill={a} />
          <rect x="3" y="7" width="2" height="5" fill={a} opacity="0.8" />
          {/* Plates — right */}
          <rect x="29" y="6" width="3" height="7" fill={a} />
          <rect x="27" y="7" width="2" height="5" fill={a} opacity="0.8" />
          {/* Arms gripping bar */}
          <rect x="7" y="11" width="2" height="1" fill={b} />
          <rect x="5" y="10" width="3" height="2" fill={b} />
          <rect x="23" y="11" width="2" height="1" fill={b} />
          <rect x="24" y="10" width="3" height="2" fill={b} />
          {/* Legs — deep squat, wide */}
          <rect x="9" y="18" width="4" height="3" fill={b} />
          <rect x="7" y="21" width="4" height="3" fill={b} />
          <rect x="19" y="18" width="4" height="3" fill={b} />
          <rect x="21" y="21" width="4" height="3" fill={b} />
          {/* Knee wraps */}
          <rect x="8" y="21" width="3" height="1" fill="#fff" opacity="0.3" />
          <rect x="21" y="21" width="3" height="1" fill="#fff" opacity="0.3" />
          {/* Flat shoes — wide stance */}
          <rect x="5" y="24" width="5" height="2" fill={d} />
          <rect x="22" y="24" width="5" height="2" fill={d} />
          {/* Sweat */}
          <rect x="10" y="4" width="1" height="1" fill="#68c8ff" opacity="0.5" />
          <rect x="22" y="6" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 12 && (
        // ROWER — figure on rowing machine, pulling handle back
        <>
          {/* Head */}
          <rect x="8" y="10" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="9" y="12" width="1" height="1" fill="#000" />
          <rect x="11" y="12" width="1" height="1" fill="#000" />
          <rect x="9" y="12" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Neck */}
          <rect x="9" y="15" width="3" height="1" fill={b} />
          {/* Torso — leaning back */}
          <rect x="9" y="16" width="6" height="6" fill={a} />
          <rect x="8" y="17" width="1" height="4" fill={a} />
          {/* Arms pulling handle */}
          <rect x="13" y="16" width="2" height="1" fill={b} />
          <rect x="15" y="15" width="2" height="2" fill={b} />
          <rect x="17" y="14" width="2" height="2" fill={b} />
          {/* Handle */}
          <rect x="19" y="14" width="2" height="1" fill="#aaa" />
          {/* Cable */}
          <rect x="20" y="15" width="6" height="1" fill="#888" opacity="0.5" />
          {/* Legs — bent on rail */}
          <rect x="12" y="22" width="3" height="3" fill={b} />
          <rect x="15" y="21" width="3" height="3" fill={b} />
          <rect x="18" y="20" width="3" height="2" fill={b} />
          {/* Feet on pedals */}
          <rect x="21" y="20" width="3" height="2" fill={d} />
          {/* Seat */}
          <rect x="9" y="22" width="4" height="1" fill={d} />
          {/* Rail */}
          <rect x="7" y="24" width="20" height="1" fill="#888" />
          {/* Machine body */}
          <rect x="25" y="16" width="4" height="8" fill={d} opacity="0.3" />
          <rect x="26" y="14" width="2" height="2" fill={d} opacity="0.4" />
          {/* Flywheel */}
          <rect x="26" y="17" width="3" height="3" fill="#aaa" opacity="0.5" />
          {/* Sweat */}
          <rect x="6" y="11" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 13 && (
        // TENNIS PLAYER — serving pose with racket overhead
        <>
          {/* Head */}
          <rect x="14" y="5" width="5" height="5" fill={b} />
          {/* Eyes — focused up */}
          <rect x="15" y="7" width="1" height="1" fill="#000" />
          <rect x="17" y="7" width="1" height="1" fill="#000" />
          <rect x="15" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Headband */}
          <rect x="13" y="5" width="7" height="1" fill={a} />
          {/* Hair */}
          <rect x="14" y="4" width="5" height="1" fill="#333" />
          {/* Neck */}
          <rect x="15" y="10" width="3" height="1" fill={b} />
          {/* Torso — twisted for serve */}
          <rect x="13" y="11" width="6" height="6" fill={a} />
          <rect x="12" y="12" width="1" height="4" fill={a} />
          {/* Collar */}
          <rect x="13" y="11" width="6" height="1" fill="#fff" opacity="0.3" />
          {/* Serving arm — up with racket */}
          <rect x="19" y="11" width="1" height="2" fill={b} />
          <rect x="20" y="9" width="1" height="3" fill={b} />
          <rect x="21" y="6" width="1" height="4" fill={b} />
          {/* Racket handle */}
          <rect x="21" y="4" width="1" height="3" fill={d} />
          {/* Racket head */}
          <rect x="19" y="0" width="5" height="4" fill={a} opacity="0.6" />
          <rect x="20" y="1" width="3" height="2" fill={bg} opacity="0.5" />
          {/* Strings */}
          <rect x="21" y="1" width="1" height="2" fill={a} opacity="0.3" />
          <rect x="20" y="2" width="3" height="1" fill={a} opacity="0.3" />
          {/* Other arm — toss */}
          <rect x="12" y="11" width="1" height="2" fill={b} />
          <rect x="11" y="9" width="1" height="3" fill={b} />
          <rect x="10" y="7" width="1" height="3" fill={b} />
          {/* Ball */}
          <rect x="10" y="5" width="2" height="2" fill="#cc0" />
          {/* Skirt/shorts */}
          <rect x="13" y="17" width="6" height="2" fill={d} />
          {/* Left leg — planted */}
          <rect x="13" y="19" width="3" height="5" fill={b} />
          <rect x="12" y="24" width="4" height="2" fill={a} />
          {/* Right leg — back */}
          <rect x="18" y="19" width="2" height="3" fill={b} />
          <rect x="19" y="22" width="2" height="3" fill={b} />
          <rect x="20" y="25" width="3" height="2" fill={a} />
        </>
      )}

      {creature === 14 && (
        // BASKETBALL PLAYER — dunking, ball visible
        <>
          {/* Head */}
          <rect x="13" y="2" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="4" width="1" height="1" fill="#000" />
          <rect x="16" y="4" width="1" height="1" fill="#000" />
          <rect x="14" y="4" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Headband */}
          <rect x="12" y="3" width="7" height="1" fill={a} />
          {/* Neck */}
          <rect x="14" y="7" width="3" height="1" fill={b} />
          {/* Jersey */}
          <rect x="12" y="8" width="7" height="7" fill={a} />
          <rect x="11" y="9" width="1" height="5" fill={a} />
          {/* Number */}
          <rect x="14" y="10" width="3" height="1" fill={d} />
          <rect x="15" y="9" width="1" height="3" fill={d} />
          {/* Dunking arm — up with ball */}
          <rect x="19" y="8" width="1" height="2" fill={b} />
          <rect x="20" y="6" width="1" height="3" fill={b} />
          <rect x="21" y="3" width="1" height="4" fill={b} />
          <rect x="22" y="2" width="1" height="2" fill={b} />
          {/* Basketball */}
          <rect x="22" y="0" width="4" height="3" fill="#e67300" />
          <rect x="23" y="0" width="1" height="3" fill="#000" opacity="0.3" />
          <rect x="22" y="1" width="4" height="1" fill="#000" opacity="0.2" />
          {/* Other arm — out */}
          <rect x="11" y="9" width="1" height="2" fill={b} />
          <rect x="9" y="10" width="2" height="1" fill={b} />
          <rect x="8" y="11" width="2" height="1" fill={b} />
          {/* Shorts */}
          <rect x="12" y="15" width="7" height="3" fill={d} />
          {/* Left leg — jumping */}
          <rect x="12" y="18" width="3" height="4" fill={b} />
          <rect x="11" y="22" width="3" height="3" fill={b} />
          <rect x="10" y="25" width="4" height="2" fill={a} />
          {/* Right leg — bent up */}
          <rect x="17" y="18" width="3" height="3" fill={b} />
          <rect x="19" y="21" width="2" height="3" fill={b} />
          <rect x="20" y="24" width="3" height="2" fill={a} />
          {/* Hoop/rim */}
          <rect x="24" y="4" width="6" height="1" fill="#e00" />
          <rect x="29" y="0" width="1" height="5" fill="#888" />
          {/* Net */}
          <rect x="25" y="5" width="1" height="2" fill="#fff" opacity="0.3" />
          <rect x="27" y="5" width="1" height="2" fill="#fff" opacity="0.3" />
        </>
      )}

      {creature === 15 && (
        // SOCCER PLAYER — kicking pose with ball at foot
        <>
          {/* Head */}
          <rect x="13" y="4" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="6" width="1" height="1" fill="#000" />
          <rect x="16" y="6" width="1" height="1" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Hair */}
          <rect x="13" y="3" width="5" height="1" fill="#333" />
          <rect x="12" y="4" width="1" height="2" fill="#333" />
          {/* Neck */}
          <rect x="14" y="9" width="3" height="1" fill={b} />
          {/* Jersey */}
          <rect x="12" y="10" width="7" height="6" fill={a} />
          <rect x="11" y="11" width="1" height="4" fill={a} />
          {/* Stripe on jersey */}
          <rect x="12" y="12" width="7" height="1" fill={d} />
          {/* Arms — running */}
          <rect x="10" y="10" width="2" height="2" fill={b} />
          <rect x="8" y="11" width="2" height="2" fill={b} />
          <rect x="19" y="11" width="2" height="2" fill={b} />
          <rect x="21" y="12" width="1" height="2" fill={b} />
          {/* Shorts */}
          <rect x="12" y="16" width="7" height="3" fill={d} />
          {/* Standing leg */}
          <rect x="12" y="19" width="3" height="5" fill={b} />
          {/* Standing sock + cleat */}
          <rect x="12" y="22" width="3" height="1" fill="#fff" />
          <rect x="11" y="24" width="4" height="2" fill={a} />
          {/* Kicking leg — extended */}
          <rect x="17" y="19" width="2" height="2" fill={b} />
          <rect x="19" y="20" width="2" height="2" fill={b} />
          <rect x="21" y="21" width="2" height="2" fill={b} />
          {/* Kicking foot */}
          <rect x="23" y="22" width="3" height="2" fill={a} />
          {/* Soccer ball */}
          <rect x="25" y="20" width="4" height="4" fill="#fff" />
          <rect x="26" y="21" width="2" height="2" fill="#000" opacity="0.3" />
          {/* Motion arc */}
          <rect x="28" y="18" width="1" height="1" fill={a} opacity="0.3" />
          <rect x="29" y="20" width="1" height="1" fill={a} opacity="0.2" />
          {/* Grass */}
          <rect x="0" y="27" width="32" height="1" fill="#2a2" opacity="0.2" />
        </>
      )}

      {creature === 16 && (
        // CROSSFITTER — clean and jerk, intense stance
        <>
          {/* Head */}
          <rect x="13" y="4" width="6" height="5" fill={b} />
          {/* Eyes — intense */}
          <rect x="14" y="6" width="2" height="1" fill="#000" />
          <rect x="17" y="6" width="2" height="1" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Grimace */}
          <rect x="14" y="8" width="4" height="1" fill="#000" />
          {/* Short hair */}
          <rect x="13" y="3" width="6" height="1" fill="#333" />
          {/* Neck — thick */}
          <rect x="14" y="9" width="4" height="1" fill={b} />
          {/* Torso */}
          <rect x="11" y="10" width="10" height="7" fill={a} />
          <rect x="10" y="11" width="1" height="5" fill={a} />
          {/* Belt */}
          <rect x="11" y="16" width="10" height="1" fill={d} />
          {/* Arms overhead — jerk position */}
          <rect x="9" y="10" width="2" height="1" fill={b} />
          <rect x="8" y="8" width="2" height="2" fill={b} />
          <rect x="7" y="5" width="2" height="3" fill={b} />
          <rect x="22" y="10" width="2" height="1" fill={b} />
          <rect x="23" y="8" width="2" height="2" fill={b} />
          <rect x="24" y="5" width="2" height="3" fill={b} />
          {/* Barbell overhead */}
          <rect x="3" y="3" width="26" height="1" fill="#aaa" />
          <rect x="3" y="4" width="26" height="1" fill="#ccc" />
          {/* Plates left */}
          <rect x="1" y="1" width="3" height="5" fill={a} />
          {/* Plates right */}
          <rect x="28" y="1" width="3" height="5" fill={a} />
          {/* Split stance legs */}
          <rect x="11" y="17" width="3" height="4" fill={b} />
          <rect x="9" y="21" width="3" height="3" fill={b} />
          <rect x="19" y="17" width="3" height="3" fill={b} />
          <rect x="21" y="20" width="2" height="3" fill={b} />
          <rect x="22" y="23" width="2" height="1" fill={b} />
          {/* Shoes */}
          <rect x="7" y="24" width="4" height="2" fill={d} />
          <rect x="22" y="24" width="4" height="2" fill={d} />
          {/* Sweat */}
          <rect x="11" y="5" width="1" height="1" fill="#68c8ff" opacity="0.5" />
          <rect x="21" y="7" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 17 && (
        // HIKER — with backpack and walking poles, on incline
        <>
          {/* Head */}
          <rect x="14" y="3" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="15" y="5" width="1" height="1" fill="#000" />
          <rect x="17" y="5" width="1" height="1" fill="#000" />
          <rect x="15" y="5" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Hat */}
          <rect x="12" y="2" width="9" height="1" fill={d} />
          <rect x="13" y="1" width="7" height="1" fill={d} />
          <rect x="14" y="0" width="5" height="1" fill={d} />
          {/* Neck */}
          <rect x="15" y="8" width="3" height="1" fill={b} />
          {/* Torso — jacket */}
          <rect x="13" y="9" width="6" height="7" fill={a} />
          <rect x="12" y="10" width="1" height="5" fill={a} />
          {/* Zipper */}
          <rect x="16" y="9" width="1" height="7" fill={d} opacity="0.4" />
          {/* Backpack */}
          <rect x="19" y="8" width="4" height="8" fill={d} />
          <rect x="20" y="7" width="2" height="1" fill={d} />
          <rect x="19" y="12" width="4" height="1" fill={a} opacity="0.3" />
          {/* Left arm with pole */}
          <rect x="11" y="10" width="2" height="2" fill={b} />
          <rect x="9" y="12" width="2" height="1" fill={b} />
          {/* Left pole */}
          <rect x="8" y="12" width="1" height="14" fill="#888" />
          <rect x="7" y="26" width="3" height="1" fill="#888" />
          {/* Right arm with pole */}
          <rect x="19" y="10" width="1" height="2" fill={b} />
          <rect x="20" y="11" width="2" height="2" fill={b} />
          {/* Right pole */}
          <rect x="23" y="12" width="1" height="14" fill="#888" />
          <rect x="22" y="26" width="3" height="1" fill="#888" />
          {/* Legs — walking */}
          <rect x="13" y="16" width="3" height="4" fill={d} />
          <rect x="12" y="20" width="3" height="3" fill={b} />
          <rect x="16" y="16" width="3" height="3" fill={d} />
          <rect x="17" y="19" width="3" height="3" fill={b} />
          {/* Boots */}
          <rect x="11" y="23" width="4" height="2" fill="#553" />
          <rect x="18" y="22" width="4" height="2" fill="#553" />
          {/* Incline ground */}
          <rect x="0" y="28" width="8" height="4" fill={d} opacity="0.15" />
          <rect x="8" y="26" width="8" height="6" fill={d} opacity="0.12" />
          <rect x="16" y="25" width="16" height="7" fill={d} opacity="0.1" />
        </>
      )}

      {creature === 18 && (
        // SURFER — standing on surfboard on a wave
        <>
          {/* Head */}
          <rect x="14" y="5" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="15" y="7" width="1" height="1" fill="#000" />
          <rect x="17" y="7" width="1" height="1" fill="#000" />
          <rect x="15" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Hair — wavy */}
          <rect x="14" y="4" width="5" height="1" fill="#cc8" />
          <rect x="13" y="5" width="1" height="2" fill="#cc8" />
          <rect x="19" y="5" width="1" height="1" fill="#cc8" />
          {/* Neck */}
          <rect x="15" y="10" width="3" height="1" fill={b} />
          {/* Torso — rash guard */}
          <rect x="13" y="11" width="6" height="5" fill={a} />
          <rect x="12" y="12" width="1" height="3" fill={a} />
          {/* Arms — balance pose */}
          <rect x="11" y="11" width="2" height="1" fill={b} />
          <rect x="9" y="10" width="2" height="2" fill={b} />
          <rect x="7" y="9" width="2" height="2" fill={b} />
          <rect x="19" y="12" width="2" height="1" fill={b} />
          <rect x="21" y="11" width="2" height="2" fill={b} />
          <rect x="23" y="10" width="2" height="2" fill={b} />
          {/* Board shorts */}
          <rect x="13" y="16" width="6" height="3" fill={d} />
          {/* Legs — surf stance, knees bent */}
          <rect x="12" y="19" width="3" height="3" fill={b} />
          <rect x="17" y="19" width="3" height="3" fill={b} />
          {/* Feet */}
          <rect x="11" y="22" width="3" height="1" fill={b} />
          <rect x="18" y="22" width="3" height="1" fill={b} />
          {/* Surfboard */}
          <rect x="6" y="23" width="22" height="2" fill={a} />
          <rect x="4" y="24" width="3" height="1" fill={a} />
          <rect x="27" y="23" width="2" height="1" fill={a} />
          {/* Fin */}
          <rect x="15" y="25" width="2" height="1" fill={d} />
          {/* Wave */}
          <rect x="0" y="26" width="32" height="2" fill="#68c8ff" opacity="0.3" />
          <rect x="2" y="25" width="5" height="1" fill="#68c8ff" opacity="0.25" />
          <rect x="26" y="25" width="4" height="1" fill="#68c8ff" opacity="0.2" />
          <rect x="0" y="28" width="32" height="4" fill="#68c8ff" opacity="0.15" />
        </>
      )}

      {creature === 19 && (
        // DANCER — dynamic dance pose, one leg extended
        <>
          {/* Head */}
          <rect x="14" y="3" width="5" height="5" fill={b} />
          {/* Eyes — expressive */}
          <rect x="15" y="5" width="1" height="1" fill="#000" />
          <rect x="17" y="5" width="1" height="1" fill="#000" />
          <rect x="15" y="5" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Smile */}
          <rect x="15" y="7" width="3" height="1" fill="#000" opacity="0.4" />
          {/* Hair — flowing */}
          <rect x="14" y="2" width="5" height="1" fill="#333" />
          <rect x="19" y="3" width="2" height="3" fill="#333" />
          <rect x="20" y="5" width="1" height="2" fill="#333" />
          {/* Neck */}
          <rect x="15" y="8" width="3" height="1" fill={b} />
          {/* Torso — leotard */}
          <rect x="13" y="9" width="6" height="7" fill={a} />
          <rect x="12" y="10" width="1" height="5" fill={a} />
          {/* Sparkle on outfit */}
          <rect x="15" y="11" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Left arm — up gracefully */}
          <rect x="12" y="9" width="1" height="2" fill={b} />
          <rect x="11" y="7" width="1" height="3" fill={b} />
          <rect x="10" y="5" width="1" height="3" fill={b} />
          <rect x="9" y="3" width="1" height="3" fill={b} />
          <rect x="8" y="2" width="2" height="2" fill={b} />
          {/* Right arm — extended */}
          <rect x="19" y="10" width="2" height="1" fill={b} />
          <rect x="21" y="9" width="2" height="2" fill={b} />
          <rect x="23" y="8" width="2" height="2" fill={b} />
          {/* Standing leg — en pointe */}
          <rect x="14" y="16" width="3" height="6" fill={b} />
          <rect x="15" y="22" width="2" height="3" fill={b} />
          {/* Pointe shoe */}
          <rect x="15" y="25" width="2" height="2" fill={d} />
          {/* Extended leg — back arabesque */}
          <rect x="19" y="14" width="2" height="2" fill={b} />
          <rect x="21" y="13" width="2" height="2" fill={b} />
          <rect x="23" y="12" width="3" height="2" fill={b} />
          {/* Pointed foot */}
          <rect x="26" y="11" width="2" height="2" fill={d} />
          {/* Sparkle effects */}
          <rect x="7" y="1" width="1" height="1" fill={a} opacity="0.4" />
          <rect x="25" y="7" width="1" height="1" fill={a} opacity="0.3" />
        </>
      )}

      {creature === 20 && (
        // DUMBBELL CURLER — bicep curl with dumbbells in each hand
        <>
          {/* Head */}
          <rect x="13" y="4" width="6" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="6" width="1" height="1" fill="#000" />
          <rect x="17" y="6" width="1" height="1" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Determined mouth */}
          <rect x="15" y="8" width="2" height="1" fill="#000" opacity="0.5" />
          {/* Short hair */}
          <rect x="13" y="3" width="6" height="1" fill="#333" />
          {/* Neck */}
          <rect x="14" y="9" width="4" height="1" fill={b} />
          {/* Torso — tank top */}
          <rect x="12" y="10" width="8" height="7" fill={a} />
          <rect x="11" y="11" width="1" height="5" fill={a} />
          {/* Straps */}
          <rect x="13" y="10" width="2" height="1" fill={a} />
          <rect x="17" y="10" width="2" height="1" fill={a} />
          {/* Left arm — curling up */}
          <rect x="9" y="11" width="2" height="3" fill={b} />
          <rect x="8" y="10" width="2" height="2" fill={b} />
          <rect x="7" y="8" width="2" height="3" fill={b} />
          {/* Left dumbbell */}
          <rect x="5" y="7" width="1" height="3" fill="#aaa" />
          <rect x="6" y="8" width="1" height="1" fill="#888" />
          <rect x="9" y="7" width="1" height="3" fill="#aaa" />
          {/* Right arm — curling up */}
          <rect x="21" y="11" width="2" height="3" fill={b} />
          <rect x="22" y="10" width="2" height="2" fill={b} />
          <rect x="23" y="8" width="2" height="3" fill={b} />
          {/* Right dumbbell */}
          <rect x="22" y="7" width="1" height="3" fill="#aaa" />
          <rect x="25" y="8" width="1" height="1" fill="#888" />
          <rect x="26" y="7" width="1" height="3" fill="#aaa" />
          {/* Shorts */}
          <rect x="12" y="17" width="8" height="3" fill={d} />
          {/* Legs */}
          <rect x="12" y="20" width="3" height="5" fill={b} />
          <rect x="17" y="20" width="3" height="5" fill={b} />
          {/* Shoes */}
          <rect x="11" y="25" width="4" height="2" fill={d} />
          <rect x="17" y="25" width="4" height="2" fill={d} />
          {/* Bicep bulge */}
          <rect x="7" y="9" width="1" height="2" fill={b} />
          <rect x="24" y="9" width="1" height="2" fill={b} />
        </>
      )}

      {creature === 21 && (
        // ROPE CLIMBER — climbing a vertical rope, legs wrapped
        <>
          {/* Rope */}
          <rect x="16" y="0" width="2" height="32" fill="#cc8" opacity="0.5" />
          {/* Head */}
          <rect x="12" y="5" width="5" height="5" fill={b} />
          {/* Eyes — looking up */}
          <rect x="13" y="7" width="1" height="1" fill="#000" />
          <rect x="15" y="7" width="1" height="1" fill="#000" />
          <rect x="13" y="7" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Neck */}
          <rect x="13" y="10" width="3" height="1" fill={b} />
          {/* Torso */}
          <rect x="12" y="11" width="6" height="6" fill={a} />
          <rect x="11" y="12" width="1" height="4" fill={a} />
          {/* Upper arm — reaching up */}
          <rect x="15" y="11" width="2" height="1" fill={b} />
          <rect x="16" y="8" width="2" height="3" fill={b} />
          <rect x="16" y="5" width="2" height="4" fill={b} />
          {/* Hand gripping rope */}
          <rect x="15" y="4" width="3" height="2" fill={b} />
          {/* Lower arm — on rope */}
          <rect x="11" y="12" width="2" height="2" fill={b} />
          <rect x="12" y="14" width="2" height="1" fill={b} />
          <rect x="14" y="14" width="3" height="2" fill={b} />
          {/* Shorts */}
          <rect x="12" y="17" width="6" height="3" fill={d} />
          {/* Upper legs wrapping rope */}
          <rect x="13" y="20" width="3" height="3" fill={b} />
          <rect x="15" y="20" width="3" height="2" fill={b} />
          {/* Legs crossed on rope */}
          <rect x="14" y="23" width="4" height="3" fill={b} />
          <rect x="13" y="25" width="2" height="2" fill={b} />
          {/* Feet gripping */}
          <rect x="12" y="26" width="2" height="2" fill={a} />
          <rect x="18" y="24" width="2" height="2" fill={a} />
          {/* Rope friction marks */}
          <rect x="16" y="14" width="2" height="1" fill="#aa6" opacity="0.4" />
          <rect x="16" y="22" width="2" height="1" fill="#aa6" opacity="0.4" />
        </>
      )}

      {creature === 22 && (
        // KETTLEBELL SWINGER — mid-swing, kettlebell between legs
        <>
          {/* Head */}
          <rect x="13" y="5" width="6" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="7" width="1" height="1" fill="#000" />
          <rect x="17" y="7" width="1" height="1" fill="#000" />
          <rect x="14" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Mouth — effort */}
          <rect x="15" y="9" width="2" height="1" fill="#000" />
          {/* Short hair */}
          <rect x="13" y="4" width="6" height="1" fill="#333" />
          {/* Neck */}
          <rect x="14" y="10" width="4" height="1" fill={b} />
          {/* Torso — hinged forward */}
          <rect x="12" y="11" width="8" height="6" fill={a} />
          <rect x="11" y="12" width="1" height="4" fill={a} />
          {/* Arms — straight down holding kettlebell */}
          <rect x="11" y="11" width="2" height="2" fill={b} />
          <rect x="10" y="13" width="2" height="2" fill={b} />
          <rect x="20" y="11" width="2" height="2" fill={b} />
          <rect x="21" y="13" width="2" height="2" fill={b} />
          {/* Hands */}
          <rect x="13" y="15" width="2" height="2" fill={b} />
          <rect x="17" y="15" width="2" height="2" fill={b} />
          {/* Kettlebell handle */}
          <rect x="14" y="16" width="4" height="1" fill="#888" />
          <rect x="13" y="17" width="1" height="1" fill="#888" />
          <rect x="18" y="17" width="1" height="1" fill="#888" />
          {/* Kettlebell ball */}
          <rect x="13" y="18" width="6" height="4" fill={d} />
          <rect x="14" y="22" width="4" height="1" fill={d} />
          <rect x="15" y="19" width="2" height="2" fill={d} opacity="0.7" />
          {/* Legs — wide stance */}
          <rect x="10" y="17" width="3" height="4" fill={b} />
          <rect x="8" y="21" width="3" height="4" fill={b} />
          <rect x="19" y="17" width="3" height="4" fill={b} />
          <rect x="21" y="21" width="3" height="4" fill={b} />
          {/* Shoes */}
          <rect x="7" y="25" width="4" height="2" fill={a} />
          <rect x="21" y="25" width="4" height="2" fill={a} />
          {/* Sweat */}
          <rect x="11" y="6" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 23 && (
        // SPRINTER — in starting blocks, explosive start
        <>
          {/* Head — low, looking forward */}
          <rect x="7" y="10" width="5" height="5" fill={b} />
          {/* Eyes — intense */}
          <rect x="8" y="12" width="1" height="1" fill="#000" />
          <rect x="10" y="12" width="1" height="1" fill="#000" />
          <rect x="8" y="12" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Headband */}
          <rect x="6" y="10" width="7" height="1" fill={a} />
          {/* Neck */}
          <rect x="10" y="14" width="3" height="1" fill={b} />
          {/* Torso — low, explosive angle */}
          <rect x="11" y="12" width="7" height="5" fill={a} />
          <rect x="10" y="13" width="1" height="3" fill={a} />
          {/* Number */}
          <rect x="13" y="13" width="3" height="1" fill={d} />
          {/* Left arm — driving forward */}
          <rect x="9" y="15" width="2" height="1" fill={b} />
          <rect x="7" y="14" width="2" height="2" fill={b} />
          <rect x="5" y="13" width="2" height="2" fill={b} />
          <rect x="3" y="12" width="2" height="2" fill={b} />
          {/* Right arm — back */}
          <rect x="18" y="13" width="2" height="2" fill={b} />
          <rect x="20" y="14" width="2" height="2" fill={b} />
          <rect x="22" y="15" width="1" height="1" fill={b} />
          {/* Shorts */}
          <rect x="12" y="17" width="6" height="2" fill={d} />
          {/* Back leg — extended in block */}
          <rect x="18" y="17" width="2" height="3" fill={b} />
          <rect x="20" y="18" width="3" height="2" fill={b} />
          <rect x="23" y="19" width="2" height="2" fill={b} />
          {/* Back foot on block */}
          <rect x="25" y="20" width="3" height="2" fill={a} />
          {/* Front leg — coiled */}
          <rect x="13" y="19" width="3" height="3" fill={b} />
          <rect x="15" y="22" width="3" height="2" fill={b} />
          {/* Front foot on block */}
          <rect x="18" y="23" width="3" height="2" fill={a} />
          {/* Starting blocks */}
          <rect x="24" y="22" width="4" height="2" fill="#888" />
          <rect x="17" y="25" width="4" height="1" fill="#888" />
          <rect x="16" y="26" width="14" height="1" fill="#888" opacity="0.3" />
          {/* Track line */}
          <rect x="0" y="27" width="32" height="1" fill="#fff" opacity="0.15" />
        </>
      )}

      {creature === 24 && (
        // STRETCHER — deep lunge stretch, arms out
        <>
          {/* Head */}
          <rect x="14" y="4" width="5" height="5" fill={b} />
          {/* Eyes — calm */}
          <rect x="15" y="6" width="1" height="1" fill="#000" />
          <rect x="17" y="6" width="1" height="1" fill="#000" />
          <rect x="15" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Peaceful expression */}
          <rect x="15" y="8" width="3" height="1" fill="#000" opacity="0.3" />
          {/* Hair tied back */}
          <rect x="14" y="3" width="5" height="1" fill="#333" />
          <rect x="19" y="4" width="1" height="2" fill="#333" />
          {/* Neck */}
          <rect x="15" y="9" width="3" height="1" fill={b} />
          {/* Torso — upright over lunge */}
          <rect x="13" y="10" width="6" height="7" fill={a} />
          <rect x="12" y="11" width="1" height="5" fill={a} />
          {/* Left arm — extended left */}
          <rect x="10" y="12" width="2" height="1" fill={b} />
          <rect x="8" y="11" width="2" height="2" fill={b} />
          <rect x="5" y="11" width="3" height="1" fill={b} />
          <rect x="4" y="10" width="2" height="2" fill={b} />
          {/* Right arm — extended right */}
          <rect x="19" y="12" width="2" height="1" fill={b} />
          <rect x="21" y="11" width="2" height="2" fill={b} />
          <rect x="23" y="11" width="3" height="1" fill={b} />
          <rect x="26" y="10" width="2" height="2" fill={b} />
          {/* Front leg — deep lunge, bent */}
          <rect x="12" y="17" width="3" height="3" fill={b} />
          <rect x="11" y="20" width="3" height="3" fill={b} />
          <rect x="10" y="23" width="3" height="2" fill={b} />
          {/* Front foot */}
          <rect x="9" y="25" width="4" height="2" fill={d} />
          {/* Back leg — extended straight */}
          <rect x="17" y="17" width="3" height="2" fill={b} />
          <rect x="20" y="18" width="3" height="2" fill={b} />
          <rect x="23" y="19" width="3" height="2" fill={b} />
          <rect x="26" y="20" width="2" height="2" fill={b} />
          {/* Back foot */}
          <rect x="27" y="22" width="3" height="2" fill={d} />
          {/* Ground */}
          <rect x="5" y="27" width="24" height="1" fill={d} opacity="0.15" />
        </>
      )}

      {creature === 25 && (
        // JUMP ROPER — mid-jump with rope arc visible
        <>
          {/* Head */}
          <rect x="13" y="3" width="6" height="5" fill={b} />
          {/* Eyes — happy */}
          <rect x="14" y="5" width="1" height="1" fill="#000" />
          <rect x="17" y="5" width="1" height="1" fill="#000" />
          <rect x="14" y="5" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Smile */}
          <rect x="15" y="7" width="2" height="1" fill="#000" opacity="0.4" />
          {/* Hair — ponytail */}
          <rect x="13" y="2" width="6" height="1" fill="#333" />
          <rect x="19" y="2" width="2" height="2" fill="#333" />
          {/* Neck */}
          <rect x="14" y="8" width="4" height="1" fill={b} />
          {/* Torso */}
          <rect x="12" y="9" width="8" height="6" fill={a} />
          <rect x="11" y="10" width="1" height="4" fill={a} />
          {/* Arms — at sides, wrists turning rope */}
          <rect x="10" y="10" width="2" height="2" fill={b} />
          <rect x="8" y="11" width="2" height="3" fill={b} />
          <rect x="7" y="13" width="2" height="2" fill={b} />
          <rect x="20" y="10" width="2" height="2" fill={b} />
          <rect x="22" y="11" width="2" height="3" fill={b} />
          <rect x="23" y="13" width="2" height="2" fill={b} />
          {/* Shorts */}
          <rect x="12" y="15" width="8" height="2" fill={d} />
          {/* Legs — together, mid-jump (off ground) */}
          <rect x="13" y="17" width="3" height="4" fill={b} />
          <rect x="16" y="17" width="3" height="4" fill={b} />
          {/* Shoes — in air */}
          <rect x="12" y="21" width="4" height="2" fill={a} />
          <rect x="16" y="21" width="4" height="2" fill={a} />
          {/* Rope arc overhead */}
          <rect x="6" y="15" width="1" height="3" fill={d} opacity="0.5" />
          <rect x="5" y="12" width="1" height="3" fill={d} opacity="0.5" />
          <rect x="5" y="9" width="1" height="3" fill={d} opacity="0.5" />
          <rect x="6" y="6" width="2" height="3" fill={d} opacity="0.5" />
          <rect x="8" y="3" width="2" height="3" fill={d} opacity="0.5" />
          <rect x="10" y="1" width="3" height="2" fill={d} opacity="0.5" />
          <rect x="13" y="0" width="6" height="1" fill={d} opacity="0.5" />
          <rect x="19" y="1" width="3" height="2" fill={d} opacity="0.5" />
          <rect x="22" y="3" width="2" height="3" fill={d} opacity="0.5" />
          <rect x="24" y="6" width="2" height="3" fill={d} opacity="0.5" />
          <rect x="25" y="9" width="1" height="3" fill={d} opacity="0.5" />
          <rect x="26" y="12" width="1" height="3" fill={d} opacity="0.5" />
          <rect x="25" y="15" width="1" height="3" fill={d} opacity="0.5" />
          {/* Ground shadow */}
          <rect x="11" y="25" width="10" height="1" fill="#000" opacity="0.1" />
        </>
      )}

      {creature === 26 && (
        // MEDICINE BALL — throwing medicine ball against wall
        <>
          {/* Head */}
          <rect x="10" y="5" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="11" y="7" width="1" height="1" fill="#000" />
          <rect x="13" y="7" width="1" height="1" fill="#000" />
          <rect x="11" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Mouth — effort */}
          <rect x="11" y="9" width="3" height="1" fill="#000" />
          {/* Short hair */}
          <rect x="10" y="4" width="5" height="1" fill="#333" />
          {/* Neck */}
          <rect x="11" y="10" width="3" height="1" fill={b} />
          {/* Torso — twisted toward wall */}
          <rect x="10" y="11" width="6" height="6" fill={a} />
          <rect x="9" y="12" width="1" height="4" fill={a} />
          {/* Arms — extended forward with ball */}
          <rect x="15" y="11" width="2" height="2" fill={b} />
          <rect x="17" y="10" width="2" height="2" fill={b} />
          <rect x="19" y="9" width="2" height="2" fill={b} />
          {/* Medicine ball */}
          <rect x="21" y="7" width="5" height="5" fill={d} />
          <rect x="22" y="6" width="3" height="1" fill={d} />
          <rect x="22" y="12" width="3" height="1" fill={d} />
          <rect x="23" y="8" width="2" height="3" fill={d} opacity="0.7" />
          {/* Other arm support */}
          <rect x="9" y="12" width="2" height="2" fill={b} />
          <rect x="8" y="14" width="2" height="1" fill={b} />
          {/* Wall */}
          <rect x="28" y="0" width="4" height="32" fill={d} opacity="0.15" />
          <rect x="27" y="0" width="1" height="32" fill={d} opacity="0.1" />
          {/* Shorts */}
          <rect x="10" y="17" width="6" height="3" fill={d} />
          {/* Legs — athletic stance */}
          <rect x="10" y="20" width="3" height="4" fill={b} />
          <rect x="14" y="20" width="3" height="4" fill={b} />
          {/* Shoes */}
          <rect x="9" y="24" width="4" height="2" fill={a} />
          <rect x="14" y="24" width="4" height="2" fill={a} />
          {/* Impact lines */}
          <rect x="26" y="8" width="1" height="1" fill={a} opacity="0.3" />
          <rect x="26" y="11" width="1" height="1" fill={a} opacity="0.2" />
        </>
      )}

      {creature === 27 && (
        // PULL-UP — hanging from bar, arms bent
        <>
          {/* Pull-up bar */}
          <rect x="4" y="2" width="24" height="2" fill="#888" />
          <rect x="3" y="0" width="2" height="3" fill="#888" />
          <rect x="27" y="0" width="2" height="3" fill="#888" />
          {/* Hands gripping bar */}
          <rect x="11" y="3" width="3" height="2" fill={b} />
          <rect x="18" y="3" width="3" height="2" fill={b} />
          {/* Arms — bent at top of pull-up */}
          <rect x="11" y="5" width="2" height="3" fill={b} />
          <rect x="10" y="7" width="2" height="2" fill={b} />
          <rect x="19" y="5" width="2" height="3" fill={b} />
          <rect x="20" y="7" width="2" height="2" fill={b} />
          {/* Head — chin above bar */}
          <rect x="13" y="4" width="6" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="6" width="1" height="1" fill="#000" />
          <rect x="17" y="6" width="1" height="1" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Grimace */}
          <rect x="14" y="8" width="4" height="1" fill="#000" />
          {/* Neck */}
          <rect x="14" y="9" width="4" height="1" fill={b} />
          {/* Torso */}
          <rect x="12" y="10" width="8" height="7" fill={a} />
          <rect x="11" y="11" width="1" height="5" fill={a} />
          <rect x="20" y="11" width="1" height="5" fill={a} />
          {/* Shorts */}
          <rect x="12" y="17" width="8" height="3" fill={d} />
          {/* Legs — hanging, slightly bent */}
          <rect x="12" y="20" width="3" height="5" fill={b} />
          <rect x="17" y="20" width="3" height="5" fill={b} />
          {/* Shoes */}
          <rect x="12" y="25" width="3" height="2" fill={a} />
          <rect x="17" y="25" width="3" height="2" fill={a} />
          {/* Cross feet */}
          <rect x="14" y="26" width="4" height="1" fill={a} />
          {/* Sweat */}
          <rect x="10" y="5" width="1" height="1" fill="#68c8ff" opacity="0.5" />
          <rect x="22" y="7" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 28 && (
        // PUSH-UP — plank position, arms extended
        <>
          {/* Head — facing down */}
          <rect x="5" y="10" width="5" height="4" fill={b} />
          {/* Eyes */}
          <rect x="6" y="12" width="1" height="1" fill="#000" />
          <rect x="8" y="12" width="1" height="1" fill="#000" />
          <rect x="6" y="12" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Short hair */}
          <rect x="5" y="9" width="5" height="1" fill="#333" />
          {/* Neck */}
          <rect x="9" y="11" width="2" height="2" fill={b} />
          {/* Arms — extended, supporting */}
          <rect x="7" y="14" width="2" height="5" fill={b} />
          <rect x="6" y="19" width="3" height="1" fill={b} />
          {/* Hands on ground */}
          <rect x="5" y="20" width="4" height="2" fill={b} />
          {/* Torso — horizontal plank */}
          <rect x="11" y="10" width="12" height="4" fill={a} />
          <rect x="10" y="11" width="1" height="2" fill={a} />
          {/* Core tight line */}
          <rect x="11" y="12" width="12" height="1" fill={d} opacity="0.3" />
          {/* Shorts */}
          <rect x="22" y="10" width="4" height="4" fill={d} />
          {/* Legs — straight back */}
          <rect x="25" y="10" width="3" height="3" fill={b} />
          <rect x="27" y="10" width="2" height="3" fill={b} />
          {/* Feet — toes on ground */}
          <rect x="28" y="13" width="2" height="4" fill={b} />
          <rect x="28" y="17" width="3" height="2" fill={a} />
          {/* Ground line */}
          <rect x="3" y="22" width="28" height="1" fill={d} opacity="0.15" />
          {/* Sweat drop */}
          <rect x="5" y="15" width="1" height="1" fill="#68c8ff" opacity="0.5" />
          <rect x="4" y="16" width="1" height="2" fill="#68c8ff" opacity="0.3" />
        </>
      )}

      {creature === 29 && (
        // DEADLIFTER — mid-deadlift, bent over with barbell
        <>
          {/* Head */}
          <rect x="10" y="6" width="6" height="5" fill={b} />
          {/* Eyes — strained */}
          <rect x="11" y="8" width="2" height="1" fill="#000" />
          <rect x="14" y="8" width="2" height="1" fill="#000" />
          <rect x="11" y="8" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Gritted teeth */}
          <rect x="12" y="10" width="3" height="1" fill="#fff" />
          <rect x="13" y="10" width="1" height="1" fill="#000" />
          {/* Short hair */}
          <rect x="10" y="5" width="6" height="1" fill="#333" />
          {/* Neck */}
          <rect x="13" y="11" width="3" height="1" fill={b} />
          {/* Torso — bent forward */}
          <rect x="13" y="12" width="7" height="6" fill={a} />
          <rect x="12" y="13" width="1" height="4" fill={a} />
          {/* Belt */}
          <rect x="13" y="17" width="7" height="1" fill={d} />
          {/* Arms — straight down to bar */}
          <rect x="12" y="12" width="2" height="2" fill={b} />
          <rect x="11" y="14" width="2" height="3" fill={b} />
          <rect x="10" y="17" width="2" height="2" fill={b} />
          <rect x="20" y="13" width="2" height="2" fill={b} />
          <rect x="21" y="15" width="2" height="2" fill={b} />
          <rect x="21" y="17" width="2" height="2" fill={b} />
          {/* Barbell bar */}
          <rect x="3" y="19" width="26" height="1" fill="#aaa" />
          <rect x="3" y="20" width="26" height="1" fill="#ccc" />
          {/* Plates left */}
          <rect x="1" y="17" width="3" height="5" fill={a} />
          <rect x="0" y="18" width="1" height="3" fill={a} opacity="0.7" />
          {/* Plates right */}
          <rect x="28" y="17" width="3" height="5" fill={a} />
          <rect x="31" y="18" width="1" height="3" fill={a} opacity="0.7" />
          {/* Legs — slight bend */}
          <rect x="14" y="18" width="3" height="4" fill={b} />
          <rect x="18" y="18" width="3" height="4" fill={b} />
          {/* Shoes — wide stance */}
          <rect x="13" y="22" width="4" height="2" fill={d} />
          <rect x="18" y="22" width="4" height="2" fill={d} />
          {/* Sweat */}
          <rect x="8" y="7" width="1" height="1" fill="#68c8ff" opacity="0.5" />
          <rect x="17" y="6" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 30 && (
        // BATTLE ROPES — waving two ropes, dynamic pose
        <>
          {/* Head */}
          <rect x="13" y="4" width="6" height="5" fill={b} />
          {/* Eyes — fierce */}
          <rect x="14" y="6" width="2" height="1" fill="#000" />
          <rect x="17" y="6" width="2" height="1" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Mouth — yelling */}
          <rect x="15" y="8" width="2" height="1" fill="#000" />
          {/* Headband */}
          <rect x="12" y="4" width="8" height="1" fill={a} />
          {/* Neck */}
          <rect x="14" y="9" width="4" height="1" fill={b} />
          {/* Torso */}
          <rect x="12" y="10" width="8" height="7" fill={a} />
          <rect x="11" y="11" width="1" height="5" fill={a} />
          <rect x="20" y="11" width="1" height="5" fill={a} />
          {/* Left arm — raised (rope up) */}
          <rect x="10" y="10" width="2" height="2" fill={b} />
          <rect x="8" y="9" width="2" height="2" fill={b} />
          <rect x="6" y="8" width="2" height="2" fill={b} />
          {/* Right arm — lowered (rope down) */}
          <rect x="20" y="11" width="2" height="2" fill={b} />
          <rect x="22" y="13" width="2" height="2" fill={b} />
          <rect x="24" y="14" width="2" height="2" fill={b} />
          {/* Left rope — wave up */}
          <rect x="4" y="7" width="2" height="2" fill={d} opacity="0.6" />
          <rect x="2" y="9" width="2" height="2" fill={d} opacity="0.6" />
          <rect x="0" y="7" width="2" height="3" fill={d} opacity="0.5" />
          <rect x="0" y="10" width="2" height="4" fill={d} opacity="0.4" />
          <rect x="1" y="14" width="2" height="3" fill={d} opacity="0.3" />
          {/* Right rope — wave down */}
          <rect x="26" y="15" width="2" height="2" fill={d} opacity="0.6" />
          <rect x="28" y="17" width="2" height="2" fill={d} opacity="0.5" />
          <rect x="29" y="19" width="2" height="3" fill={d} opacity="0.4" />
          <rect x="28" y="22" width="2" height="2" fill={d} opacity="0.3" />
          {/* Shorts */}
          <rect x="12" y="17" width="8" height="3" fill={d} />
          {/* Legs — wide athletic stance */}
          <rect x="11" y="20" width="3" height="4" fill={b} />
          <rect x="18" y="20" width="3" height="4" fill={b} />
          {/* Shoes */}
          <rect x="10" y="24" width="4" height="2" fill={a} />
          <rect x="18" y="24" width="4" height="2" fill={a} />
          {/* Sweat */}
          <rect x="11" y="5" width="1" height="1" fill="#68c8ff" opacity="0.5" />
        </>
      )}

      {creature === 31 && (
        // MOUNTAIN BIKER — on bike with helmet, bumpy terrain
        <>
          {/* Head with helmet */}
          <rect x="11" y="4" width="5" height="4" fill={b} />
          <rect x="10" y="3" width="7" height="2" fill={a} />
          <rect x="11" y="2" width="5" height="1" fill={a} />
          {/* Visor */}
          <rect x="10" y="5" width="1" height="1" fill={d} />
          {/* Eyes */}
          <rect x="12" y="6" width="1" height="1" fill="#000" />
          <rect x="14" y="6" width="1" height="1" fill="#000" />
          {/* Torso — leaning forward aggressively */}
          <rect x="12" y="8" width="5" height="5" fill={a} />
          <rect x="11" y="9" width="1" height="3" fill={a} />
          {/* Arms to handlebars */}
          <rect x="10" y="8" width="2" height="1" fill={b} />
          <rect x="8" y="9" width="3" height="1" fill={b} />
          <rect x="7" y="10" width="2" height="1" fill={b} />
          {/* Handlebars */}
          <rect x="5" y="10" width="3" height="1" fill="#aaa" />
          {/* Legs on pedals */}
          <rect x="15" y="13" width="2" height="3" fill={b} />
          <rect x="16" y="16" width="2" height="2" fill={b} />
          <rect x="12" y="13" width="2" height="2" fill={b} />
          <rect x="10" y="15" width="2" height="2" fill={b} />
          {/* Shoes */}
          <rect x="16" y="18" width="2" height="1" fill={d} />
          <rect x="9" y="17" width="2" height="1" fill={d} />
          {/* Bike frame */}
          <rect x="8" y="14" width="10" height="1" fill={d} />
          <rect x="6" y="11" width="1" height="4" fill={d} />
          <rect x="17" y="12" width="1" height="3" fill={d} />
          {/* Seat */}
          <rect x="16" y="11" width="3" height="1" fill="#333" />
          {/* Rear wheel — knobby */}
          <rect x="18" y="17" width="7" height="1" fill="#555" />
          <rect x="19" y="15" width="1" height="1" fill="#555" />
          <rect x="25" y="15" width="1" height="1" fill="#555" />
          <rect x="17" y="18" width="1" height="4" fill="#555" />
          <rect x="25" y="18" width="1" height="4" fill="#555" />
          <rect x="18" y="22" width="7" height="1" fill="#555" />
          {/* Front wheel — knobby */}
          <rect x="1" y="17" width="7" height="1" fill="#555" />
          <rect x="1" y="15" width="1" height="1" fill="#555" />
          <rect x="7" y="15" width="1" height="1" fill="#555" />
          <rect x="0" y="18" width="1" height="4" fill="#555" />
          <rect x="8" y="18" width="1" height="4" fill="#555" />
          <rect x="1" y="22" width="7" height="1" fill="#555" />
          {/* Bumpy terrain */}
          <rect x="0" y="24" width="5" height="2" fill={d} opacity="0.2" />
          <rect x="8" y="25" width="4" height="1" fill={d} opacity="0.15" />
          <rect x="15" y="24" width="6" height="2" fill={d} opacity="0.2" />
          <rect x="24" y="25" width="5" height="1" fill={d} opacity="0.15" />
          {/* Mud splashes */}
          <rect x="26" y="14" width="1" height="1" fill={d} opacity="0.3" />
          <rect x="27" y="16" width="1" height="1" fill={d} opacity="0.2" />
        </>
      )}

      {creature === 32 && (
        // FENCER — lunge position with foil, mask on
        <>
          {/* Head with fencing mask */}
          <rect x="8" y="6" width="6" height="6" fill="#888" />
          <rect x="9" y="7" width="4" height="4" fill="#aaa" />
          {/* Mesh lines on mask */}
          <rect x="9" y="8" width="4" height="1" fill="#777" opacity="0.4" />
          <rect x="11" y="7" width="1" height="4" fill="#777" opacity="0.4" />
          {/* Eyes behind mask */}
          <rect x="9" y="9" width="1" height="1" fill="#000" />
          <rect x="12" y="9" width="1" height="1" fill="#000" />
          {/* Neck */}
          <rect x="10" y="12" width="3" height="1" fill={b} />
          {/* Torso — fencing jacket */}
          <rect x="9" y="13" width="7" height="6" fill="#fff" />
          <rect x="8" y="14" width="1" height="4" fill="#fff" />
          {/* Target area */}
          <rect x="10" y="14" width="5" height="4" fill={a} opacity="0.3" />
          {/* Sword arm — extended in lunge */}
          <rect x="7" y="13" width="2" height="1" fill={b} />
          <rect x="5" y="12" width="2" height="2" fill={b} />
          <rect x="3" y="11" width="2" height="2" fill={b} />
          {/* Foil */}
          <rect x="0" y="11" width="4" height="1" fill="#ccc" />
          <rect x="3" y="10" width="1" height="3" fill={d} />
          {/* Guard */}
          <rect x="2" y="10" width="2" height="1" fill={a} />
          {/* Back arm — up for balance */}
          <rect x="16" y="13" width="2" height="2" fill={b} />
          <rect x="18" y="12" width="2" height="2" fill={b} />
          <rect x="20" y="10" width="2" height="2" fill={b} />
          {/* Knickers */}
          <rect x="9" y="19" width="7" height="3" fill="#fff" />
          {/* Front leg — lunging */}
          <rect x="7" y="19" width="3" height="3" fill={b} />
          <rect x="5" y="22" width="3" height="3" fill={b} />
          {/* Front shoe */}
          <rect x="3" y="25" width="5" height="2" fill={a} />
          {/* Back leg — extended */}
          <rect x="16" y="19" width="3" height="2" fill={b} />
          <rect x="19" y="20" width="3" height="2" fill={b} />
          <rect x="22" y="21" width="3" height="2" fill={b} />
          {/* Back shoe */}
          <rect x="24" y="23" width="4" height="2" fill={a} />
          {/* Lunge line */}
          <rect x="3" y="27" width="22" height="1" fill="#fff" opacity="0.1" />
        </>
      )}

      {creature === 33 && (
        // ARCHER — drawing a bow, focused pose
        <>
          {/* Head */}
          <rect x="14" y="3" width="5" height="5" fill={b} />
          {/* Eyes — squinting, focused */}
          <rect x="15" y="5" width="2" height="1" fill="#000" />
          <rect x="18" y="5" width="1" height="1" fill="#000" />
          <rect x="15" y="5" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Hair */}
          <rect x="14" y="2" width="5" height="1" fill="#333" />
          <rect x="19" y="3" width="1" height="2" fill="#333" />
          {/* Neck */}
          <rect x="15" y="8" width="3" height="1" fill={b} />
          {/* Torso */}
          <rect x="13" y="9" width="6" height="7" fill={a} />
          <rect x="12" y="10" width="1" height="5" fill={a} />
          {/* Quiver on back */}
          <rect x="19" y="8" width="2" height="8" fill={d} />
          <rect x="20" y="7" width="1" height="1" fill={d} />
          {/* Arrow tips in quiver */}
          <rect x="19" y="6" width="1" height="2" fill="#aaa" />
          <rect x="20" y="6" width="1" height="1" fill="#aaa" />
          {/* Bow arm — extended left */}
          <rect x="11" y="10" width="2" height="1" fill={b} />
          <rect x="9" y="9" width="2" height="2" fill={b} />
          <rect x="7" y="9" width="2" height="1" fill={b} />
          <rect x="5" y="9" width="2" height="1" fill={b} />
          {/* Bow */}
          <rect x="3" y="4" width="1" height="12" fill={d} />
          <rect x="4" y="3" width="1" height="2" fill={d} />
          <rect x="4" y="14" width="1" height="2" fill={d} />
          {/* Bowstring */}
          <rect x="4" y="5" width="1" height="1" fill="#888" opacity="0.5" />
          <rect x="5" y="6" width="1" height="2" fill="#888" opacity="0.5" />
          <rect x="6" y="8" width="1" height="2" fill="#888" opacity="0.5" />
          <rect x="7" y="10" width="1" height="2" fill="#888" opacity="0.5" />
          <rect x="6" y="12" width="1" height="2" fill="#888" opacity="0.5" />
          <rect x="5" y="13" width="1" height="2" fill="#888" opacity="0.5" />
          <rect x="4" y="14" width="1" height="1" fill="#888" opacity="0.5" />
          {/* Draw arm — pulling string back */}
          <rect x="12" y="9" width="1" height="2" fill={b} />
          <rect x="10" y="9" width="2" height="1" fill={b} />
          {/* Arrow nocked */}
          <rect x="4" y="9" width="9" height="1" fill="#aaa" opacity="0.6" />
          {/* Legs */}
          <rect x="13" y="16" width="3" height="5" fill={b} />
          <rect x="17" y="16" width="3" height="5" fill={b} />
          {/* Boots */}
          <rect x="12" y="21" width="4" height="2" fill={d} />
          <rect x="17" y="21" width="4" height="2" fill={d} />
        </>
      )}

      {creature === 34 && (
        // KAYAKER — in kayak with paddle, water splashes
        <>
          {/* Head */}
          <rect x="13" y="5" width="5" height="5" fill={b} />
          {/* Eyes */}
          <rect x="14" y="7" width="1" height="1" fill="#000" />
          <rect x="16" y="7" width="1" height="1" fill="#000" />
          <rect x="14" y="7" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Helmet */}
          <rect x="12" y="4" width="7" height="2" fill={a} />
          <rect x="13" y="3" width="5" height="1" fill={a} />
          {/* Neck */}
          <rect x="14" y="10" width="3" height="1" fill={b} />
          {/* Life jacket / torso */}
          <rect x="12" y="11" width="7" height="5" fill={a} />
          <rect x="11" y="12" width="1" height="3" fill={a} />
          <rect x="19" y="12" width="1" height="3" fill={a} />
          {/* PFD buckle */}
          <rect x="15" y="13" width="1" height="1" fill={d} />
          {/* Arms holding paddle — left high */}
          <rect x="10" y="11" width="2" height="2" fill={b} />
          <rect x="8" y="9" width="2" height="3" fill={b} />
          <rect x="6" y="7" width="2" height="3" fill={b} />
          {/* Arms — right low */}
          <rect x="19" y="12" width="2" height="2" fill={b} />
          <rect x="21" y="14" width="2" height="2" fill={b} />
          <rect x="23" y="15" width="2" height="2" fill={b} />
          {/* Paddle shaft */}
          <rect x="5" y="6" width="1" height="1" fill="#888" />
          <rect x="6" y="7" width="1" height="1" fill="#888" />
          <rect x="8" y="9" width="1" height="1" fill="#888" />
          <rect x="11" y="12" width="1" height="1" fill="#888" />
          <rect x="14" y="13" width="1" height="1" fill="#888" />
          <rect x="19" y="14" width="1" height="1" fill="#888" />
          <rect x="22" y="15" width="1" height="1" fill="#888" />
          <rect x="24" y="16" width="1" height="1" fill="#888" />
          {/* Paddle blades */}
          <rect x="3" y="4" width="3" height="3" fill={d} />
          <rect x="24" y="17" width="3" height="3" fill={d} />
          {/* Kayak hull */}
          <rect x="5" y="16" width="22" height="3" fill={d} />
          <rect x="3" y="17" width="3" height="2" fill={d} />
          <rect x="26" y="16" width="3" height="2" fill={d} />
          <rect x="1" y="18" width="3" height="1" fill={d} />
          <rect x="28" y="17" width="2" height="1" fill={d} />
          {/* Cockpit */}
          <rect x="12" y="16" width="7" height="1" fill="#333" opacity="0.3" />
          {/* Water */}
          <rect x="0" y="20" width="32" height="2" fill="#68c8ff" opacity="0.25" />
          <rect x="2" y="19" width="4" height="1" fill="#68c8ff" opacity="0.3" />
          <rect x="26" y="19" width="4" height="1" fill="#68c8ff" opacity="0.3" />
          {/* Splashes */}
          <rect x="1" y="17" width="1" height="1" fill="#fff" opacity="0.4" />
          <rect x="29" y="16" width="1" height="1" fill="#fff" opacity="0.4" />
          <rect x="0" y="19" width="1" height="1" fill="#fff" opacity="0.3" />
        </>
      )}

      {creature === 35 && (
        // ICE SKATER — graceful skating pose, one leg extended back
        <>
          {/* Head */}
          <rect x="14" y="3" width="5" height="5" fill={b} />
          {/* Eyes — graceful */}
          <rect x="15" y="5" width="1" height="1" fill="#000" />
          <rect x="17" y="5" width="1" height="1" fill="#000" />
          <rect x="15" y="5" width="1" height="1" fill="#fff" opacity="0.4" />
          {/* Elegant smile */}
          <rect x="15" y="7" width="3" height="1" fill="#000" opacity="0.3" />
          {/* Hair — bun */}
          <rect x="15" y="1" width="3" height="2" fill="#333" />
          <rect x="14" y="2" width="5" height="1" fill="#333" />
          {/* Hair ribbon */}
          <rect x="18" y="2" width="2" height="1" fill={a} />
          {/* Neck */}
          <rect x="15" y="8" width="3" height="1" fill={b} />
          {/* Torso — skating dress */}
          <rect x="13" y="9" width="6" height="6" fill={a} />
          <rect x="12" y="10" width="1" height="4" fill={a} />
          {/* Sparkle on costume */}
          <rect x="15" y="11" width="1" height="1" fill="#fff" opacity="0.5" />
          <rect x="14" y="13" width="1" height="1" fill="#fff" opacity="0.3" />
          {/* Skirt */}
          <rect x="12" y="15" width="7" height="2" fill={a} />
          <rect x="11" y="16" width="2" height="1" fill={a} opacity="0.7" />
          <rect x="19" y="15" width="1" height="1" fill={a} opacity="0.7" />
          {/* Left arm — extended gracefully up */}
          <rect x="12" y="9" width="1" height="2" fill={b} />
          <rect x="11" y="7" width="1" height="3" fill={b} />
          <rect x="10" y="5" width="1" height="3" fill={b} />
          <rect x="9" y="3" width="1" height="3" fill={b} />
          <rect x="8" y="2" width="2" height="2" fill={b} />
          {/* Right arm — extended out */}
          <rect x="19" y="10" width="2" height="1" fill={b} />
          <rect x="21" y="9" width="2" height="2" fill={b} />
          <rect x="23" y="8" width="2" height="2" fill={b} />
          {/* Standing leg */}
          <rect x="14" y="17" width="3" height="5" fill={b} />
          {/* Skate blade — standing */}
          <rect x="13" y="22" width="4" height="1" fill={a} />
          <rect x="12" y="23" width="6" height="1" fill="#ccc" />
          {/* Extended leg — behind, graceful */}
          <rect x="19" y="14" width="2" height="2" fill={b} />
          <rect x="21" y="13" width="2" height="2" fill={b} />
          <rect x="23" y="12" width="3" height="2" fill={b} />
          {/* Skate blade — extended */}
          <rect x="25" y="11" width="2" height="1" fill={a} />
          <rect x="25" y="12" width="3" height="1" fill="#ccc" />
          {/* Ice surface */}
          <rect x="0" y="24" width="32" height="2" fill="#ddf" opacity="0.15" />
          {/* Ice scratch marks */}
          <rect x="8" y="24" width="3" height="1" fill="#fff" opacity="0.2" />
          <rect x="18" y="24" width="4" height="1" fill="#fff" opacity="0.15" />
          {/* Sparkle effects */}
          <rect x="7" y="1" width="1" height="1" fill={a} opacity="0.4" />
          <rect x="25" y="6" width="1" height="1" fill={a} opacity="0.3" />
        </>
      )}
    </>
  )
}
