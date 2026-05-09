import { describe, it, expect } from 'vitest'
import { todayString, updateStreak, isStreakActive } from './time'
import type { StreakState } from '../types/player'

const makeStreak = (overrides: Partial<StreakState> = {}): StreakState => ({
  current: 1,
  longest: 1,
  lastActivityDate: '2026-05-01',
  graceUsed: false,
  ...overrides,
})

describe('todayString', () => {
  it('returns a YYYY-MM-DD string', () => {
    const result = todayString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('isStreakActive', () => {
  it('active when lastActivityDate is today', () => {
    const streak = makeStreak({ lastActivityDate: '2026-05-09' })
    expect(isStreakActive(streak, '2026-05-09')).toBe(true)
  })

  it('active when lastActivityDate is yesterday', () => {
    const streak = makeStreak({ lastActivityDate: '2026-05-08' })
    expect(isStreakActive(streak, '2026-05-09')).toBe(true)
  })

  it('inactive when lastActivityDate is 2 days ago', () => {
    const streak = makeStreak({ lastActivityDate: '2026-05-07' })
    expect(isStreakActive(streak, '2026-05-09')).toBe(false)
  })

  it('inactive when lastActivityDate is empty', () => {
    const streak = makeStreak({ lastActivityDate: '' })
    expect(isStreakActive(streak, '2026-05-09')).toBe(false)
  })
})

describe('updateStreak', () => {
  it('same day activity: streak unchanged', () => {
    const streak = makeStreak({ current: 5, lastActivityDate: '2026-05-09' })
    const result = updateStreak(streak, '2026-05-09')
    expect(result.current).toBe(5)
    expect(result.lastActivityDate).toBe('2026-05-09')
  })

  it('next day activity: streak increments by 1', () => {
    const streak = makeStreak({ current: 3, longest: 3, lastActivityDate: '2026-05-08' })
    const result = updateStreak(streak, '2026-05-09')
    expect(result.current).toBe(4)
    expect(result.lastActivityDate).toBe('2026-05-09')
  })

  it('next day activity updates longest when current exceeds it', () => {
    const streak = makeStreak({ current: 5, longest: 5, lastActivityDate: '2026-05-08' })
    const result = updateStreak(streak, '2026-05-09')
    expect(result.current).toBe(6)
    expect(result.longest).toBe(6)
  })

  it('next day activity does not decrease longest', () => {
    const streak = makeStreak({ current: 3, longest: 10, lastActivityDate: '2026-05-08' })
    const result = updateStreak(streak, '2026-05-09')
    expect(result.current).toBe(4)
    expect(result.longest).toBe(10)
  })

  it('1-day gap: uses grace period if not used, preserves streak', () => {
    const streak = makeStreak({ current: 7, longest: 7, lastActivityDate: '2026-05-07', graceUsed: false })
    const result = updateStreak(streak, '2026-05-09') // 2-day skip = 1 missed day
    expect(result.current).toBe(8)
    expect(result.graceUsed).toBe(true)
  })

  it('1-day gap: resets streak when grace already used', () => {
    const streak = makeStreak({ current: 7, longest: 7, lastActivityDate: '2026-05-07', graceUsed: true })
    const result = updateStreak(streak, '2026-05-09')
    expect(result.current).toBe(1)
    expect(result.graceUsed).toBe(false)
  })

  it('2-day gap: always resets streak regardless of grace', () => {
    const streak = makeStreak({ current: 10, longest: 10, lastActivityDate: '2026-05-06', graceUsed: false })
    const result = updateStreak(streak, '2026-05-09') // 3-day skip = 2 missed days
    expect(result.current).toBe(1)
    expect(result.graceUsed).toBe(false)
  })

  it('first activity ever: sets streak to 1', () => {
    const streak = makeStreak({ current: 0, longest: 0, lastActivityDate: '' })
    const result = updateStreak(streak, '2026-05-09')
    expect(result.current).toBe(1)
    expect(result.lastActivityDate).toBe('2026-05-09')
  })

  it('graceUsed resets after 7 consecutive days', () => {
    const streak = makeStreak({ current: 13, longest: 13, lastActivityDate: '2026-05-08', graceUsed: true })
    const result = updateStreak(streak, '2026-05-09') // current becomes 14, divisible by 7
    expect(result.current).toBe(14)
    expect(result.graceUsed).toBe(false)
  })
})
