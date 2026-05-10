import type { StateCreator } from 'zustand'

export interface StatisticsState {
  totalTimeSpent: number
  totalKeystrokesRecorded: number
  motionUseCounts: Record<string, number>
  dailyActivity: Record<string, number>
  arrowKeyPresses: number
  sessionDotRepeatCount: number
  speedChallengesUnderPar: number
  perfectAccuracyChallenges: number
  grammarCombosUsed: number
  countPrefixUses: number
  ggGUseCounts: number
  lateNightChallenges: number
  firstDeleteChallengeCompleted: boolean
}

export interface StatisticsSlice {
  statistics: StatisticsState
  recordMotionUse: (motion: string) => void
  recordArrowKeyPress: () => void
  recordDotRepeat: () => void
  recordSpeedChallengeUnderPar: () => void
  recordPerfectAccuracyChallenge: () => void
  recordGrammarCombo: () => void
  recordCountPrefixUse: () => void
  recordGgGUse: () => void
  recordLateNightChallenge: () => void
  markFirstDeleteChallengeCompleted: () => void
  addTimeSpent: (seconds: number) => void
  recordKeystrokes: (count: number) => void
  recordDailyActivity: (date: string) => void
  resetSessionDotRepeatCount: () => void
}

export const createStatisticsSlice: StateCreator<StatisticsSlice> = (set) => ({
  statistics: {
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
  },
  recordMotionUse: (motion) =>
    set((s) => ({
      statistics: {
        ...s.statistics,
        motionUseCounts: {
          ...s.statistics.motionUseCounts,
          [motion]: (s.statistics.motionUseCounts[motion] ?? 0) + 1,
        },
      },
    })),
  recordArrowKeyPress: () =>
    set((s) => ({
      statistics: { ...s.statistics, arrowKeyPresses: s.statistics.arrowKeyPresses + 1 },
    })),
  recordDotRepeat: () =>
    set((s) => ({
      statistics: {
        ...s.statistics,
        sessionDotRepeatCount: s.statistics.sessionDotRepeatCount + 1,
      },
    })),
  recordSpeedChallengeUnderPar: () =>
    set((s) => ({
      statistics: {
        ...s.statistics,
        speedChallengesUnderPar: s.statistics.speedChallengesUnderPar + 1,
      },
    })),
  recordPerfectAccuracyChallenge: () =>
    set((s) => ({
      statistics: {
        ...s.statistics,
        perfectAccuracyChallenges: s.statistics.perfectAccuracyChallenges + 1,
      },
    })),
  recordGrammarCombo: () =>
    set((s) => ({
      statistics: { ...s.statistics, grammarCombosUsed: s.statistics.grammarCombosUsed + 1 },
    })),
  recordCountPrefixUse: () =>
    set((s) => ({
      statistics: { ...s.statistics, countPrefixUses: s.statistics.countPrefixUses + 1 },
    })),
  recordGgGUse: () =>
    set((s) => ({
      statistics: { ...s.statistics, ggGUseCounts: s.statistics.ggGUseCounts + 1 },
    })),
  recordLateNightChallenge: () =>
    set((s) => ({
      statistics: { ...s.statistics, lateNightChallenges: s.statistics.lateNightChallenges + 1 },
    })),
  markFirstDeleteChallengeCompleted: () =>
    set((s) => ({
      statistics: { ...s.statistics, firstDeleteChallengeCompleted: true },
    })),
  addTimeSpent: (seconds) =>
    set((s) => ({
      statistics: { ...s.statistics, totalTimeSpent: s.statistics.totalTimeSpent + seconds },
    })),
  recordKeystrokes: (count) =>
    set((s) => ({
      statistics: {
        ...s.statistics,
        totalKeystrokesRecorded: s.statistics.totalKeystrokesRecorded + count,
      },
    })),
  recordDailyActivity: (date) =>
    set((s) => ({
      statistics: {
        ...s.statistics,
        dailyActivity: {
          ...s.statistics.dailyActivity,
          [date]: (s.statistics.dailyActivity[date] ?? 0) + 1,
        },
      },
    })),
  resetSessionDotRepeatCount: () =>
    set((s) => ({
      statistics: { ...s.statistics, sessionDotRepeatCount: 0 },
    })),
})
