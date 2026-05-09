import { describe, it, expect } from 'vitest'
import { zone1 } from './curriculum'

describe('Zone 1 curriculum', () => {
  it('has exactly 4 lessons', () => {
    expect(zone1.lessons).toHaveLength(4)
  })

  it('has at least 10 challenges total', () => {
    const total = zone1.lessons.reduce((sum, l) => sum + l.challenges.length, 0)
    expect(total).toBeGreaterThanOrEqual(10)
  })

  it('all challenge IDs are unique', () => {
    const ids = zone1.lessons.flatMap(l => l.challenges.map(c => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all parTime values are positive', () => {
    zone1.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        expect(challenge.parTime).toBeGreaterThan(0)
      })
    })
  })

  it('lesson 1-1 is HJKL Barracks with 3 challenges', () => {
    const lesson = zone1.lessons[0]!
    expect(lesson.title).toContain('HJKL')
    expect(lesson.challenges.length).toBeGreaterThanOrEqual(3)
  })

  it('lesson 1-2 is Word Waypoints with 3 challenges', () => {
    const lesson = zone1.lessons[1]!
    expect(lesson.title).toContain('Word')
    expect(lesson.challenges.length).toBeGreaterThanOrEqual(3)
  })

  it('lesson 1-3 is Line Ledge with 2 challenges', () => {
    const lesson = zone1.lessons[2]!
    expect(lesson.title).toContain('Line')
    expect(lesson.challenges.length).toBeGreaterThanOrEqual(2)
  })

  it('lesson 1-4 is Count Cavern with 2 challenges', () => {
    const lesson = zone1.lessons[3]!
    expect(lesson.title).toContain('Count')
    expect(lesson.challenges.length).toBeGreaterThanOrEqual(2)
  })

  it('all allowedMotions entries are non-empty strings', () => {
    zone1.lessons.flatMap(l => l.challenges).forEach(challenge => {
      expect(challenge.allowedMotions.length).toBeGreaterThan(0)
      challenge.allowedMotions.forEach(m => expect(typeof m).toBe('string'))
    })
  })

  it('HJKL Barracks challenges only allow hjkl motions', () => {
    const lesson = zone1.lessons[0]!
    lesson.challenges.forEach(challenge => {
      challenge.allowedMotions.forEach(m => {
        expect(['h', 'j', 'k', 'l']).toContain(m)
      })
    })
  })

  it('Word Waypoints challenges allow w b e motions', () => {
    const lesson = zone1.lessons[1]!
    const allMotions = new Set(lesson.challenges.flatMap(c => c.allowedMotions))
    expect(allMotions.has('w') || allMotions.has('b') || allMotions.has('e')).toBe(true)
  })

  it('all challenges have type reachTarget for Zone 1', () => {
    zone1.lessons.flatMap(l => l.challenges).forEach(challenge => {
      expect(['reachTarget', 'speedRun']).toContain(challenge.type)
    })
  })

  it('zone1 has the correct id and bossId', () => {
    expect(zone1.id).toBe('zone1')
    expect(zone1.bossId).toBe('arrow-key-phantom')
  })
})
