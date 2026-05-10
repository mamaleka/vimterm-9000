import type { StateCreator } from 'zustand'

export interface ThemeSettings {
  phosphorColor: 'green' | 'amber' | 'blue' | 'white'
  scanlines: boolean
  crtCurvature: boolean
  flickerEffect: boolean
  fontSize: 'sm' | 'md' | 'lg'
}

export interface AudioSettings {
  enabled: boolean
  volume: number
}

export interface GameplaySettings {
  showHints: boolean
  arrowKeyWarning: boolean
  autoAdvance: boolean
}

export interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
}

export interface SettingsSlice {
  theme: ThemeSettings
  audio: AudioSettings
  gameplay: GameplaySettings
  accessibility: AccessibilitySettings
  updateTheme: (patch: Partial<ThemeSettings>) => void
  updateAudio: (patch: Partial<AudioSettings>) => void
  updateGameplay: (patch: Partial<GameplaySettings>) => void
  updateAccessibility: (patch: Partial<AccessibilitySettings>) => void
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  theme: {
    phosphorColor: 'green',
    scanlines: true,
    crtCurvature: false,
    flickerEffect: false,
    fontSize: 'md',
  },
  audio: {
    enabled: false,
    volume: 0.5,
  },
  gameplay: {
    showHints: true,
    arrowKeyWarning: true,
    autoAdvance: false,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
  },
  updateTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),
  updateAudio: (patch) => set((s) => ({ audio: { ...s.audio, ...patch } })),
  updateGameplay: (patch) => set((s) => ({ gameplay: { ...s.gameplay, ...patch } })),
  updateAccessibility: (patch) => set((s) => ({ accessibility: { ...s.accessibility, ...patch } })),
})
