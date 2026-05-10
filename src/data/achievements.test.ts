import { describe, it, expect } from 'vitest'
import { achievements } from './achievements'
import type { StatisticsState } from '../store/statisticsSlice'
import type { ProgressState } from '../store/progressSlice'

function makeStats(overrides: Partial<StatisticsState> = {}): StatisticsState {
  return {
    totalTimeSpent: 0,
    totalKeystrokesRecorded: 0,
    motionUseCounts: {},
    dailyActivity: {},
    arrowKeyPresses: 0,
    sessionDotRepeatCount: 0,
    speedChallengesUnderPar: 0,
    perfectAccuracyChallenges: 0,
    grammarCombosUsed: 0,
    countPrefixUses: 0,
    ggGUseCounts: 0,
    lateNightChallenges: 0,
    firstDeleteChallengeCompleted: false,
    ...overrides,
  }
}

function makeProgress(overrides: Partial<ProgressState> = {}): ProgressState {
  return {
    unlockedZones: ['zone1'],
    completedLessons: {},
    completedChallenges: {},
    bossDefeats: {},
    currentZone: 'zone1',
    currentLesson: null,
    ...overrides,
  }
}

describe('achievements definitions', () => {
  it('exports an array of 13 achievements', () => {
    // PLAN.md lists 13 achievements across 4 categories (4+4+2+3).
    // SPEC-037 says "12 achievements" but the plan has 13; we implement all 13.
    expect(achievements).toHaveLength(13)
  })

  it('each achievement has id, name, description, and checkCondition', () => {
    for (const ach of achievements) {
      expect(typeof ach.id).toBe('string')
      expect(typeof ach.name).toBe('string')
      expect(typeof ach.description).toBe('string')
      expect(typeof ach.checkCondition).toBe('function')
    }
  })

  it('all achievement ids are unique', () => {
    const ids = achievements.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Hjklonomicon', () => {
  const ach = () => achievements.find((a) => a.id === 'hjklonomicon')!

  it('returns false when no HJKL challenges completed', () => {
    expect(ach().checkCondition(makeStats(), makeProgress())).toBe(false)
  })

  it('returns true when all HJKL lesson challenges completed', () => {
    const progress = makeProgress({
      completedChallenges: {
        z1l1c1: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
        z1l1c2: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
        z1l1c3: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
      },
    })
    expect(ach().checkCondition(makeStats(), progress)).toBe(true)
  })

  it('returns false when only some HJKL challenges completed', () => {
    const progress = makeProgress({
      completedChallenges: {
        z1l1c1: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
      },
    })
    expect(ach().checkCondition(makeStats(), progress)).toBe(false)
  })
})

describe('Word Wizard', () => {
  const ach = () => achievements.find((a) => a.id === 'word-wizard')!

  it('returns false when w+b+e < 100', () => {
    const stats = makeStats({ motionUseCounts: { w: 30, b: 20, e: 10 } })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when w+b+e >= 100', () => {
    const stats = makeStats({ motionUseCounts: { w: 50, b: 30, e: 20 } })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })

  it('returns true when only w is 100', () => {
    const stats = makeStats({ motionUseCounts: { w: 100 } })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })

  it('treats missing motion keys as 0', () => {
    const stats = makeStats({ motionUseCounts: {} })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })
})

describe('Repeat Offender', () => {
  const ach = () => achievements.find((a) => a.id === 'repeat-offender')!

  it('returns false when dot repeat < 25', () => {
    const stats = makeStats({ sessionDotRepeatCount: 24 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when dot repeat >= 25', () => {
    const stats = makeStats({ sessionDotRepeatCount: 25 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })

  it('returns true when dot repeat is well above 25', () => {
    const stats = makeStats({ sessionDotRepeatCount: 100 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('Speed Demon', () => {
  const ach = () => achievements.find((a) => a.id === 'speed-demon')!

  it('returns false when speedChallengesUnderPar < 10', () => {
    const stats = makeStats({ speedChallengesUnderPar: 9 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when speedChallengesUnderPar >= 10', () => {
    const stats = makeStats({ speedChallengesUnderPar: 10 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('HJKL Addict', () => {
  const ach = () => achievements.find((a) => a.id === 'hjkl-addict')!

  it('returns false when arrowKeyPresses < 50', () => {
    const stats = makeStats({ arrowKeyPresses: 49 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when arrowKeyPresses >= 50', () => {
    const stats = makeStats({ arrowKeyPresses: 50 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('Line Lord', () => {
  const ach = () => achievements.find((a) => a.id === 'line-lord')!

  it('returns false when gg/G use < 50', () => {
    const stats = makeStats({ ggGUseCounts: 49 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when gg/G use >= 50', () => {
    const stats = makeStats({ ggGUseCounts: 50 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('Counter Culture', () => {
  const ach = () => achievements.find((a) => a.id === 'counter-culture')!

  it('returns false when count prefix uses < 50', () => {
    const stats = makeStats({ countPrefixUses: 49 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when count prefix uses >= 50', () => {
    const stats = makeStats({ countPrefixUses: 50 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('First Blood', () => {
  const ach = () => achievements.find((a) => a.id === 'first-blood')!

  it('returns false when no delete challenge completed', () => {
    expect(ach().checkCondition(makeStats(), makeProgress())).toBe(false)
  })

  it('returns true when first delete challenge is completed', () => {
    const stats = makeStats({ firstDeleteChallengeCompleted: true })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('Grammar Purist', () => {
  const ach = () => achievements.find((a) => a.id === 'grammar-purist')!

  it('returns false when grammar combos < 10', () => {
    const stats = makeStats({ grammarCombosUsed: 9 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when grammar combos >= 10', () => {
    const stats = makeStats({ grammarCombosUsed: 10 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('No Time to Think', () => {
  const ach = () => achievements.find((a) => a.id === 'no-time-to-think')!

  it('returns false when no challenge beaten in < 2 seconds', () => {
    const progress = makeProgress({
      completedChallenges: {
        z1l1c1: { attempts: 1, bestTime: 3000, bestAccuracy: 1, stars: 3, xpEarned: 100 },
      },
    })
    expect(ach().checkCondition(makeStats(), progress)).toBe(false)
  })

  it('returns true when any challenge beaten in < 2000ms', () => {
    const progress = makeProgress({
      completedChallenges: {
        z1l1c1: { attempts: 1, bestTime: 1999, bestAccuracy: 1, stars: 3, xpEarned: 100 },
      },
    })
    expect(ach().checkCondition(makeStats(), progress)).toBe(true)
  })
})

describe('Perfectionist', () => {
  const ach = () => achievements.find((a) => a.id === 'perfectionist')!

  it('returns false when perfectAccuracyChallenges < 20', () => {
    const stats = makeStats({ perfectAccuracyChallenges: 19 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when perfectAccuracyChallenges >= 20', () => {
    const stats = makeStats({ perfectAccuracyChallenges: 20 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('Late Night Hacker', () => {
  const ach = () => achievements.find((a) => a.id === 'late-night-hacker')!

  it('returns false when no late night challenge', () => {
    const stats = makeStats({ lateNightChallenges: 0 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(false)
  })

  it('returns true when at least one late night challenge completed', () => {
    const stats = makeStats({ lateNightChallenges: 1 })
    expect(ach().checkCondition(stats, makeProgress())).toBe(true)
  })
})

describe('Clean Cut', () => {
  const ach = () => achievements.find((a) => a.id === 'clean-cut')!

  it('returns false when no perfect-accuracy delete challenge exists', () => {
    const progress = makeProgress({
      completedChallenges: {
        'delete-c1': { attempts: 1, bestTime: 5000, bestAccuracy: 0.8, stars: 2, xpEarned: 50 },
      },
    })
    expect(ach().checkCondition(makeStats(), progress)).toBe(false)
  })

  it('returns true when a delete challenge is completed with perfect accuracy', () => {
    const progress = makeProgress({
      completedChallenges: {
        'delete-c1': { attempts: 1, bestTime: 5000, bestAccuracy: 1, stars: 3, xpEarned: 100 },
      },
    })
    expect(ach().checkCondition(makeStats(), progress)).toBe(true)
  })
})
