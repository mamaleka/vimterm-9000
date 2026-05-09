import type { StreakState } from '../types/player'

export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysDiff(dateA: string, dateB: string): number {
  if (!dateA || !dateB) return Infinity
  const msPerDay = 86400000
  const a = new Date(dateA).getTime()
  const b = new Date(dateB).getTime()
  return Math.round((b - a) / msPerDay)
}

export function isStreakActive(streak: StreakState, today: string): boolean {
  if (!streak.lastActivityDate) return false
  const diff = daysDiff(streak.lastActivityDate, today)
  return diff === 0 || diff === 1
}

export function updateStreak(streak: StreakState, today: string): StreakState {
  if (!streak.lastActivityDate) {
    return { ...streak, current: 1, lastActivityDate: today, longest: Math.max(1, streak.longest) }
  }

  const diff = daysDiff(streak.lastActivityDate, today)

  // Same day: no change
  if (diff === 0) {
    return streak
  }

  // Next day: continue streak
  if (diff === 1) {
    const newCurrent = streak.current + 1
    const newLongest = Math.max(newCurrent, streak.longest)
    // Reset grace after 7 consecutive days (rolling window)
    const newGraceUsed = newCurrent % 7 === 0 ? false : streak.graceUsed
    return {
      ...streak,
      current: newCurrent,
      longest: newLongest,
      lastActivityDate: today,
      graceUsed: newGraceUsed,
    }
  }

  // 1 missed day (diff === 2): use grace if available
  if (diff === 2 && !streak.graceUsed) {
    const newCurrent = streak.current + 1
    const newLongest = Math.max(newCurrent, streak.longest)
    return {
      ...streak,
      current: newCurrent,
      longest: newLongest,
      lastActivityDate: today,
      graceUsed: true,
    }
  }

  // Streak broken: reset
  return {
    ...streak,
    current: 1,
    longest: streak.longest,
    lastActivityDate: today,
    graceUsed: false,
  }
}
