import type { StateCreator } from 'zustand'

export interface StreakState {
  current: number
  longest: number
  lastActivityDate: string
  graceUsed: boolean
}

export interface PlayerSlice {
  xp: number
  level: number
  displayName: string
  streak: StreakState
  title: string
  setDisplayName: (name: string) => void
  addXP: (amount: number) => void
  setLevel: (level: number) => void
  updateStreak: (streak: StreakState) => void
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
  setDisplayName: (name) => set({ displayName: name }),
  addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
  setLevel: (level) => set({ level }),
  updateStreak: (streak) => set({ streak }),
})
