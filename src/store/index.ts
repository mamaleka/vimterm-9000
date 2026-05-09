import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPlayerSlice, type PlayerSlice } from './playerSlice'
import { createProgressSlice, type ProgressSlice } from './progressSlice'
import { createChallengeSlice, type ChallengeSlice } from './challengeSlice'
import { createSettingsSlice, type SettingsSlice } from './settingsSlice'

export type RootStore = PlayerSlice & ProgressSlice & ChallengeSlice & SettingsSlice

export const useStore = create<RootStore>()(
  persist(
    (...args) => ({
      ...createPlayerSlice(...args),
      ...createProgressSlice(...args),
      ...createChallengeSlice(...args),
      ...createSettingsSlice(...args),
    }),
    {
      name: 'vimterm_save_v1',
      version: 1,
    },
  ),
)
