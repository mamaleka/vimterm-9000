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

export interface ChallengeSlice {
  currentChallengeId: string | null
  currentScreen: Screen
  arrowKeyPresses: number
  setCurrentChallenge: (id: string | null) => void
  navigateTo: (screen: Screen) => void
  recordArrowKeyPress: () => void
}

export const createChallengeSlice: StateCreator<ChallengeSlice> = (set) => ({
  currentChallengeId: null,
  currentScreen: 'home',
  arrowKeyPresses: 0,
  setCurrentChallenge: (id) => set({ currentChallengeId: id }),
  navigateTo: (screen) => set({ currentScreen: screen }),
  recordArrowKeyPress: () => set((s) => ({ arrowKeyPresses: s.arrowKeyPresses + 1 })),
})
