import { describe, it, expect } from 'vitest'
import { zone1, zone2, zone3, zone4, zone5, allZones } from './curriculum'

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

describe('Zone 2 curriculum — Find & Seek Range', () => {
  it('has the correct id, name, and bossId', () => {
    expect(zone2.id).toBe('zone2')
    expect(zone2.name).toBe('Find & Seek Range')
    expect(zone2.bossId).toBe('grep-golem')
  })

  it('has at least 8 challenges total', () => {
    const total = zone2.lessons.reduce((sum, l) => sum + l.challenges.length, 0)
    expect(total).toBeGreaterThanOrEqual(8)
  })

  it('uses f, F, t, T motions', () => {
    const allMotions = new Set(
      zone2.lessons.flatMap(l => l.challenges.flatMap(c => c.allowedMotions))
    )
    expect(allMotions.has('f') || allMotions.has('F') || allMotions.has('t') || allMotions.has('T')).toBe(true)
  })

  it('uses /, ?, n, N motions', () => {
    const allMotions = new Set(
      zone2.lessons.flatMap(l => l.challenges.flatMap(c => c.allowedMotions))
    )
    expect(allMotions.has('/') || allMotions.has('?') || allMotions.has('n') || allMotions.has('N')).toBe(true)
  })

  it('all challenge IDs are unique within zone', () => {
    const ids = zone2.lessons.flatMap(l => l.challenges.map(c => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all parTime values are positive', () => {
    zone2.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        expect(challenge.parTime).toBeGreaterThan(0)
      })
    })
  })

  it('all allowedMotions entries are non-empty strings', () => {
    zone2.lessons.flatMap(l => l.challenges).forEach(challenge => {
      expect(challenge.allowedMotions.length).toBeGreaterThan(0)
      challenge.allowedMotions.forEach(m => expect(typeof m).toBe('string'))
    })
  })
})

describe('Zone 3 curriculum — Operator Outpost', () => {
  it('has the correct id, name, and bossId', () => {
    expect(zone3.id).toBe('zone3')
    expect(zone3.name).toBe('Operator Outpost')
    expect(zone3.bossId).toBe('syntax-serpent')
  })

  it('has at least 10 challenges total', () => {
    const total = zone3.lessons.reduce((sum, l) => sum + l.challenges.length, 0)
    expect(total).toBeGreaterThanOrEqual(10)
  })

  it('uses d, c, y, p operators', () => {
    const allMotions = new Set(
      zone3.lessons.flatMap(l => l.challenges.flatMap(c => c.allowedMotions))
    )
    expect(
      allMotions.has('d') || allMotions.has('c') || allMotions.has('y') || allMotions.has('p') ||
      allMotions.has('dd') || allMotions.has('dw') || allMotions.has('cw') || allMotions.has('yy')
    ).toBe(true)
  })

  it('includes at least one deleteEnemies or transform challenge', () => {
    const types = zone3.lessons.flatMap(l => l.challenges.map(c => c.type))
    expect(types.some(t => t === 'deleteEnemies' || t === 'transform')).toBe(true)
  })

  it('all challenge IDs are unique within zone', () => {
    const ids = zone3.lessons.flatMap(l => l.challenges.map(c => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all parTime values are positive', () => {
    zone3.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        expect(challenge.parTime).toBeGreaterThan(0)
      })
    })
  })

  it('all allowedMotions entries are non-empty strings', () => {
    zone3.lessons.flatMap(l => l.challenges).forEach(challenge => {
      expect(challenge.allowedMotions.length).toBeGreaterThan(0)
      challenge.allowedMotions.forEach(m => expect(typeof m).toBe('string'))
    })
  })
})

describe('Zone 4 curriculum — Text Object Citadel', () => {
  it('has the correct id, name, and bossId', () => {
    expect(zone4.id).toBe('zone4')
    expect(zone4.name).toBe('Text Object Citadel')
    expect(zone4.bossId).toBe('json-jormungandr')
  })

  it('has at least 10 challenges total', () => {
    const total = zone4.lessons.reduce((sum, l) => sum + l.challenges.length, 0)
    expect(total).toBeGreaterThanOrEqual(10)
  })

  it('uses text object motions iw, aw, i", i(, i[, i{', () => {
    const allMotions = new Set(
      zone4.lessons.flatMap(l => l.challenges.flatMap(c => c.allowedMotions))
    )
    expect(
      allMotions.has('iw') || allMotions.has('aw') ||
      allMotions.has('i"') || allMotions.has("i'") ||
      allMotions.has('i(') || allMotions.has('i[') ||
      allMotions.has('i{') || allMotions.has('ip') || allMotions.has('ap')
    ).toBe(true)
  })

  it('all challenge IDs are unique within zone', () => {
    const ids = zone4.lessons.flatMap(l => l.challenges.map(c => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all parTime values are positive', () => {
    zone4.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        expect(challenge.parTime).toBeGreaterThan(0)
      })
    })
  })

  it('all allowedMotions entries are non-empty strings', () => {
    zone4.lessons.flatMap(l => l.challenges).forEach(challenge => {
      expect(challenge.allowedMotions.length).toBeGreaterThan(0)
      challenge.allowedMotions.forEach(m => expect(typeof m).toBe('string'))
    })
  })
})

describe('Zone 5 curriculum — Named Positions Nexus', () => {
  it('has the correct id, name, and bossId', () => {
    expect(zone5.id).toBe('zone5')
    expect(zone5.name).toBe('Named Positions Nexus')
    expect(zone5.bossId).toBe('vim-wraith')
  })

  it('has at least 8 challenges total', () => {
    const total = zone5.lessons.reduce((sum, l) => sum + l.challenges.length, 0)
    expect(total).toBeGreaterThanOrEqual(8)
  })

  it('uses mark and jump motions m, \', `, %, {, }', () => {
    const allMotions = new Set(
      zone5.lessons.flatMap(l => l.challenges.flatMap(c => c.allowedMotions))
    )
    expect(
      allMotions.has('m') || allMotions.has("'") || allMotions.has('`') ||
      allMotions.has('%') || allMotions.has('{') || allMotions.has('}') ||
      allMotions.has('*') || allMotions.has('#') ||
      allMotions.has('Ctrl-o') || allMotions.has('Ctrl-i')
    ).toBe(true)
  })

  it('all challenge IDs are unique within zone', () => {
    const ids = zone5.lessons.flatMap(l => l.challenges.map(c => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all parTime values are positive', () => {
    zone5.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        expect(challenge.parTime).toBeGreaterThan(0)
      })
    })
  })

  it('all allowedMotions entries are non-empty strings', () => {
    zone5.lessons.flatMap(l => l.challenges).forEach(challenge => {
      expect(challenge.allowedMotions.length).toBeGreaterThan(0)
      challenge.allowedMotions.forEach(m => expect(typeof m).toBe('string'))
    })
  })
})

describe('allZones — cross-zone invariants', () => {
  it('exports all 5 zones', () => {
    expect(allZones).toHaveLength(5)
  })

  it('total challenge count across all zones is at least 46', () => {
    const total = allZones.reduce(
      (sum, z) => sum + z.lessons.reduce((s, l) => s + l.challenges.length, 0),
      0
    )
    expect(total).toBeGreaterThanOrEqual(46)
  })

  it('all challenge IDs are unique across all zones', () => {
    const ids = allZones.flatMap(z =>
      z.lessons.flatMap(l => l.challenges.map(c => c.id))
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('zone order matches ids zone1 through zone5', () => {
    expect(allZones.map(z => z.id)).toEqual(['zone1', 'zone2', 'zone3', 'zone4', 'zone5'])
  })
})
