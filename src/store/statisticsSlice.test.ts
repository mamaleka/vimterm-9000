import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './index'
import type { StatisticsState } from './statisticsSlice'

const defaultStats: StatisticsState = {
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
}

beforeEach(() => {
  useStore.setState({ statistics: { ...defaultStats } })
})

describe('statisticsSlice', () => {
  it('initializes with correct default state', () => {
    const { statistics } = useStore.getState()
    expect(statistics).toEqual(defaultStats)
  })

  it('recordMotionUse increments motion count', () => {
    const { recordMotionUse } = useStore.getState()
    recordMotionUse('w')
    recordMotionUse('w')
    recordMotionUse('b')
    const { statistics } = useStore.getState()
    expect(statistics.motionUseCounts['w']).toBe(2)
    expect(statistics.motionUseCounts['b']).toBe(1)
  })

  it('recordArrowKeyPress increments arrowKeyPresses', () => {
    const { recordArrowKeyPress } = useStore.getState()
    recordArrowKeyPress()
    recordArrowKeyPress()
    expect(useStore.getState().statistics.arrowKeyPresses).toBe(2)
  })

  it('recordDotRepeat increments sessionDotRepeatCount', () => {
    const { recordDotRepeat } = useStore.getState()
    recordDotRepeat()
    expect(useStore.getState().statistics.sessionDotRepeatCount).toBe(1)
  })

  it('recordSpeedChallengeUnderPar increments speedChallengesUnderPar', () => {
    const { recordSpeedChallengeUnderPar } = useStore.getState()
    recordSpeedChallengeUnderPar()
    expect(useStore.getState().statistics.speedChallengesUnderPar).toBe(1)
  })

  it('markFirstDeleteChallengeCompleted sets flag to true', () => {
    const { markFirstDeleteChallengeCompleted } = useStore.getState()
    expect(useStore.getState().statistics.firstDeleteChallengeCompleted).toBe(false)
    markFirstDeleteChallengeCompleted()
    expect(useStore.getState().statistics.firstDeleteChallengeCompleted).toBe(true)
  })

  it('recordDailyActivity increments for the given date', () => {
    const { recordDailyActivity } = useStore.getState()
    recordDailyActivity('2026-05-10')
    recordDailyActivity('2026-05-10')
    expect(useStore.getState().statistics.dailyActivity['2026-05-10']).toBe(2)
  })

  it('resetSessionDotRepeatCount resets to 0', () => {
    useStore.setState((s) => ({
      statistics: { ...s.statistics, sessionDotRepeatCount: 15 },
    }))
    const { resetSessionDotRepeatCount } = useStore.getState()
    resetSessionDotRepeatCount()
    expect(useStore.getState().statistics.sessionDotRepeatCount).toBe(0)
  })
})
