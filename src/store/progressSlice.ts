import type { StateCreator } from 'zustand'

export interface ChallengeResult {
  attempts: number
  bestTime: number
  bestAccuracy: number
  stars: 1 | 2 | 3
  xpEarned: number
}

export interface LessonResult {
  stars: 1 | 2 | 3
  bestTime: number
  completedAt: string
}

export interface BossDefeat {
  defeatedAt: string
  heartsRemaining: number
}

export interface ProgressSlice {
  unlockedZones: string[]
  completedLessons: Record<string, LessonResult>
  completedChallenges: Record<string, ChallengeResult>
  bossDefeats: Record<string, BossDefeat>
  currentZone: string
  currentLesson: string | null
  unlockZone: (zoneId: string) => void
  completeChallenge: (id: string, result: ChallengeResult) => void
  completeLesson: (id: string, result: LessonResult) => void
  defeatBoss: (id: string, result: BossDefeat) => void
  setCurrentLesson: (lessonId: string | null) => void
}

export const createProgressSlice: StateCreator<ProgressSlice> = (set) => ({
  unlockedZones: ['zone1'],
  completedLessons: {},
  completedChallenges: {},
  bossDefeats: {},
  currentZone: 'zone1',
  currentLesson: null,
  unlockZone: (zoneId) =>
    set((s) => ({
      unlockedZones: s.unlockedZones.includes(zoneId)
        ? s.unlockedZones
        : [...s.unlockedZones, zoneId],
    })),
  completeChallenge: (id, result) =>
    set((s) => ({ completedChallenges: { ...s.completedChallenges, [id]: result } })),
  completeLesson: (id, result) =>
    set((s) => ({ completedLessons: { ...s.completedLessons, [id]: result } })),
  defeatBoss: (id, result) =>
    set((s) => ({ bossDefeats: { ...s.bossDefeats, [id]: result } })),
  setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),
})
