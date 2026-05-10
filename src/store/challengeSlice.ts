import type { StateCreator } from 'zustand'

export type Screen =
  | 'home'
  | 'worldMap'
  | 'skillTree'
  | 'lesson'
  | 'practice'
  | 'bossFight'
  | 'profile'
  | 'settings'
  | 'challengeComplete'

export interface PendingChallengeResult {
  xpEarned: number
  stars: 1 | 2 | 3
  keystrokes: number
  timeMs: number
  parTime: number
  firstCompletion: boolean
  streakDays: number
}

export interface ChallengeSlice {
  currentChallengeId: string | null
  currentScreen: Screen
  arrowKeyPresses: number
  pendingChallengeResult: PendingChallengeResult | null
  setCurrentChallenge: (id: string | null) => void
  navigateTo: (screen: Screen) => void
  recordArrowKeyPress: () => void
  setPendingChallengeResult: (result: PendingChallengeResult | null) => void
}

export const createChallengeSlice: StateCreator<ChallengeSlice> = (set) => ({
  currentChallengeId: null,
  currentScreen: 'home',
  arrowKeyPresses: 0,
  pendingChallengeResult: null,
  setCurrentChallenge: (id) => set({ currentChallengeId: id }),
  navigateTo: (screen) => set({ currentScreen: screen }),
  recordArrowKeyPress: () => set((s) => ({ arrowKeyPresses: s.arrowKeyPresses + 1 })),
  setPendingChallengeResult: (result) => set({ pendingChallengeResult: result }),
})
