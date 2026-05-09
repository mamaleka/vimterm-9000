const LEVEL_THRESHOLDS: number[] = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000]

export function levelToXPThreshold(level: number): number {
  if (level <= 1) return 0
  if (level <= 10) return LEVEL_THRESHOLDS[level - 1]!
  return 5000 + (level - 10) * 1500
}

export function xpToLevel(xp: number): number {
  if (xp >= 5000) {
    return 10 + Math.floor((xp - 5000) / 1500)
  }
  let level = 1
  for (let i = 1; i <= 9; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]!) {
      level = i + 1
    }
  }
  return level
}

export function calculateXP(
  base: number,
  speedBonus: boolean,
  accuracyBonus: boolean,
  firstCompletion: boolean,
  streakDays: number,
): number {
  let xp = base
  if (speedBonus) xp *= 1.25
  if (accuracyBonus) xp *= 1.15
  if (firstCompletion) xp *= 2
  const streakMultiplier = 1 + Math.min(streakDays * 0.05, 0.5)
  xp *= streakMultiplier
  return Math.floor(Math.round(xp * 1e10) / 1e10)
}
