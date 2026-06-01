# Puck vs. The Boss — combined design concept

Combined replacement for the Battle Arena card game, drafted before survey
results. Pairs two of the gamification ideas explored in the 2026-06
brainstorm:

- **Co-op Boss Battle** — channel-wide weekly fight; every logged workout
  deals damage.
- **Hero Card Album** — keep the loved "I got a new card" moment from Battle
  Arena, drop the PvP combat that killed engagement.

The two compose into one mechanic: the card you collect each week is the
stat token you contribute to that week's boss fight.

## Core idea

The hero card you get every week is no longer something you have to *fight
with*. It's a stat token you contribute to a channel-wide weekly co-op fight
against a themed Boss. The full collection lives on as a binder on your
profile.

## Weekly cycle

- **Monday.** Puck announces this week's Boss in the Slack post. Boss has a
  name, art, and an HP bar scaled to the roster ("This week: COACH GRINDSTONE.
  HP 12,000. Hit the ice.").
- **Through the week.** Every logged workout deals damage to the Boss.
  Damage = your equipped card's POWER × a small workout-type multiplier.
  That's the whole formula — no type-advantage matrix, no PP, no moves to
  learn.
- **The card you equip** is one from your album. Defaults to your newest. You
  can swap once during the week so the people who care can min-max; the
  people who don't never notice the choice.
- **Sunday.** Channel checks the result. If the Boss is down, everyone who
  contributed gets a drop, tiered by how much damage they personally dealt.
  If the Boss survived, Puck escapes, the channel gets nothing that week,
  and Monday opens with a "revenge" framing.

## Album side

- All cards you've earned over the season are visible on your profile as a
  binder.
- Rare cards drop on individual milestones (first 30-workout month, 10-week
  streak, themed seasonal events). Scarcity is shown.
- **v1: no trading, no fusing.** Pure collection. Trading is the kind of
  mechanic that *looks* fun but adds the rules-learning tax that killed
  Battle Arena. Add only if the survey shows demand.

## Why this addresses what killed Battle Arena

- **No combat to learn.** The contribution mechanic is "log a workout — that
  is already enough."
- **No PvP shame for low performers.** The Boss is the enemy, not a
  colleague.
- **The good part of Battle Arena survives.** Opening a new card each week
  was the bit people enjoyed. That stays untouched.
- **Every workout has a visible team consequence.** HP ticks down in Slack,
  so even one workout a week is seen.

## The four tuning decisions

1. **Boss HP target.** Goal: Boss defeated ~80–85% of weeks. Too easy →
   no drama. Too hard → learned helplessness. Auto-scale with roster size.
2. **Damage formula transparency.** One sentence printed under the HP bar.
   The moment players can't predict their own damage, the feature feels
   opaque.
3. **Drop tiering.** Gap between "MVP contributor" drop and "logged once"
   drop. Big gap = engaging; small gap = participation-trophy. Suggested:
   3 tiers, MVP gets ~3× the basic drop.
4. **Loss handling.** Public shame, gentle "Puck got away" framing, or a
   streak counter the channel collectively breaks? Default: gentle, plus a
   "weeks since the channel lost" counter so the eventual loss is
   memorable.

## Risks to mitigate before building

- **Free-rider problem.** Boss dies because the engaged 30% logged hard; the
  disengaged 70% still cash in. Tier-by-contribution drops mitigate but do
  not eliminate this.
- **Album value decay.** Without trading or use beyond equipping one card
  per week, collection loses meaning after one season. Introduce themed
  seasonal sets (Winter Boss series, Old-Time Hockey series) so each season
  is collectible in its own right.
- **Boss art workload.** A new themed Boss every week is real production
  cost. Options: month-long Bosses with 4-week HP, or a small recurring
  villain roster that returns with upgrades.

## What this doc is and isn't

This is a concept anchor, not an implementation spec. The actual design
will be shaped by responses to the
[end-of-round survey](./end-of-round-survey-2026-06.md) — particularly Q5
(what people enjoyed), Q8 (Battle Arena experience), and Q10 (open
suggestions). Revisit and refine once data is in.
