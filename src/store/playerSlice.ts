import type { StateCreator } from 'zustand'

export interface StreakState {
  current: number
  longest: number
  lastActivityDate: string
  graceUsed: boolean
}

export interface AchievementUnlock {
  unlockedAt: string
  progress?: number
}

export interface PlayerSlice {
  xp: number
  level: number
  displayName: string
  streak: StreakState
  title: string
  unlockedAchievements: Record<string, AchievementUnlock>
  setDisplayName: (name: string) => void
  addXP: (amount: number) => void
  setLevel: (level: number) => void
  updateStreak: (streak: StreakState) => void
  unlockAchievement: (id: string) => void
}

export const createPlayerSlice: StateCreator<PlayerSlice> = (set) => ({
  xp: 0,
  level: 1,
  displayName: 'PLAYER_ONE',
  title: 'Lost in Normal Mode',
  streak: {
    current: 0,
    longest: 0,
    lastActivityDate: '',
    graceUsed: false,
  },
  unlockedAchievements: {},
  setDisplayName: (name) => set({ displayName: name }),
  addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
  setLevel: (level) => set({ level }),
  updateStreak: (streak) => set({ streak }),
  unlockAchievement: (id) =>
    set((s) => ({
      unlockedAchievements: {
        ...s.unlockedAchievements,
        [id]: { unlockedAt: new Date().toISOString() },
      },
    })),
})
