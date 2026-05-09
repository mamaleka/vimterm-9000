import { describe, it, expect } from 'vitest'
import { calculateXP, xpToLevel, levelToXPThreshold } from './xp'

describe('calculateXP', () => {
  it('returns base XP with no bonuses', () => {
    expect(calculateXP(100, false, false, false, 0)).toBe(100)
  })

  it('adds 25% speed bonus when speedBonus is true', () => {
    expect(calculateXP(100, true, false, false, 0)).toBe(125)
  })

  it('adds 15% accuracy bonus when accuracyBonus is true', () => {
    expect(calculateXP(100, false, true, false, 0)).toBe(115)
  })

  it('doubles XP for first completion', () => {
    expect(calculateXP(100, false, false, true, 0)).toBe(200)
  })

  it('applies streak bonus: +5% per day, capped at +50% (10 days)', () => {
    expect(calculateXP(100, false, false, false, 10)).toBe(150)
  })

  it('caps streak bonus at 50% regardless of higher day count', () => {
    expect(calculateXP(100, false, false, false, 100)).toBe(150)
  })

  it('applies all bonuses together', () => {
    // base=100, speed=+25%, accuracy=+15%, first=×2, streak=10days(+50%)
    // = 100 × 1.25 × 1.15 × 2 × 1.5 = 431.25 → floor = 431
    expect(calculateXP(100, true, true, true, 10)).toBe(431)
  })

  it('streak of 1 day adds 5%', () => {
    expect(calculateXP(100, false, false, false, 1)).toBe(105)
  })

  it('streak of 0 days adds nothing', () => {
    expect(calculateXP(100, false, false, false, 0)).toBe(100)
  })

  it('returns floored integer', () => {
    // 100 × 1.15 = 115.0 exactly, no rounding issue
    // 100 × 1.05 = 105.0
    expect(typeof calculateXP(100, false, false, false, 1)).toBe('number')
    expect(Number.isInteger(calculateXP(100, false, false, false, 1))).toBe(true)
  })
})

describe('xpToLevel', () => {
  it('returns level 1 at 0 XP', () => {
    expect(xpToLevel(0)).toBe(1)
  })

  it('returns level 1 at 99 XP', () => {
    expect(xpToLevel(99)).toBe(1)
  })

  it('returns level 2 at exactly 100 XP', () => {
    expect(xpToLevel(100)).toBe(2)
  })

  it('returns level 2 at 249 XP', () => {
    expect(xpToLevel(249)).toBe(2)
  })

  it('returns level 3 at 250 XP', () => {
    expect(xpToLevel(250)).toBe(3)
  })

  it('returns level 4 at 500 XP', () => {
    expect(xpToLevel(500)).toBe(4)
  })

  it('returns level 5 at 900 XP', () => {
    expect(xpToLevel(900)).toBe(5)
  })

  it('returns level 6 at 1400 XP', () => {
    expect(xpToLevel(1400)).toBe(6)
  })

  it('returns level 7 at 2000 XP', () => {
    expect(xpToLevel(2000)).toBe(7)
  })

  it('returns level 8 at 2800 XP', () => {
    expect(xpToLevel(2800)).toBe(8)
  })

  it('returns level 9 at 3800 XP', () => {
    expect(xpToLevel(3800)).toBe(9)
  })

  it('returns level 10 at 5000 XP', () => {
    expect(xpToLevel(5000)).toBe(10)
  })

  it('returns level 11 at 6500 XP (5000 + 1500)', () => {
    expect(xpToLevel(6500)).toBe(11)
  })

  it('returns level 12 at 8000 XP (5000 + 1500 + 1500)', () => {
    expect(xpToLevel(8000)).toBe(12)
  })
})

describe('levelToXPThreshold', () => {
  it('returns 0 for level 1', () => {
    expect(levelToXPThreshold(1)).toBe(0)
  })

  it('returns 100 for level 2', () => {
    expect(levelToXPThreshold(2)).toBe(100)
  })

  it('returns 250 for level 3', () => {
    expect(levelToXPThreshold(3)).toBe(250)
  })

  it('returns 5000 for level 10', () => {
    expect(levelToXPThreshold(10)).toBe(5000)
  })

  it('returns 6500 for level 11', () => {
    expect(levelToXPThreshold(11)).toBe(6500)
  })
})
